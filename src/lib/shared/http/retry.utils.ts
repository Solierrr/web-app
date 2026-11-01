import { classifyHttpFailure } from "./httpFailure.utils";

export interface RetryPolicy {
  /** Total de tentativas, contando a primeira. */
  attempts: number;
  /** Espera antes da primeira repetição; dobra a cada nova repetição. */
  baseMs: number;
  /** Teto da espera entre duas tentativas. */
  maxMs: number;
}

// Backoff exponencial com jitter, o padrão para leituras de interface: 1 s, 2 s, 4 s, 8 s, 16 s e depois 30 s,
// em 10 tentativas (cerca de 2 minutos no total), tempo de uma indisponibilidade curta ou de uma reinicialização.
export const LOAD_RETRY_POLICY: RetryPolicy = { attempts: 10, baseMs: 1_000, maxMs: 30_000 };

// Só vale repetir o que pode passar sozinho: rede, tempo esgotado, serviço indisponível (5xx) ou limite de taxa (429).
// Erros do pedido (400, 401, 403, 404, 422...) falham de imediato, porque repetir não muda a resposta.
export function isTransientFailure(error: unknown): boolean {
  const kind = classifyHttpFailure(error);
  return kind === "network" || kind === "timeout" || kind === "unavailable" || kind === "rateLimited";
}

// Jitter "igual": metade da espera é fixa e a outra metade é sorteada, para vários visitantes não voltarem juntos.
export function backoffDelay(retry: number, policy: RetryPolicy = LOAD_RETRY_POLICY, random: () => number = Math.random): number {
  const ceiling = Math.min(policy.maxMs, policy.baseMs * 2 ** (retry - 1));
  return Math.round(ceiling / 2 + (random() * ceiling) / 2);
}

export function abortableDelay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    function onAbort() {
      clearTimeout(timer);
      reject(signal?.reason ?? new DOMException("Aborted", "AbortError"));
    }
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

export interface RetryOptions {
  policy?: RetryPolicy;
  shouldRetry?: (error: unknown) => boolean;
  signal?: AbortSignal;
  onRetry?: (retry: number, delayMs: number, error: unknown) => void;
  wait?: (ms: number, signal?: AbortSignal) => Promise<void>;
  random?: () => number;
}

/** Roda a operação e a repete com backoff enquanto a falha for transitória; o último erro sobe quando as tentativas acabam. */
export async function retryWithBackoff<T>(operation: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { policy = LOAD_RETRY_POLICY, shouldRetry = isTransientFailure, signal, onRetry, wait = abortableDelay, random } = options;
  for (let attempt = 1; ; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (signal?.aborted || attempt >= policy.attempts || !shouldRetry(error)) throw error;
      const delay = backoffDelay(attempt, policy, random);
      onRetry?.(attempt, delay, error);
      await wait(delay, signal);
    }
  }
}

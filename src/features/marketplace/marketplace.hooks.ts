import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { retryWithBackoff } from "@/lib/shared/http/retry.utils";

const CACHE_PREFIX = "marketplace-cache:";
const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

function readCache<T>(key: string): T[] | null {
  try {
    const raw = window.localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as { savedAt: number; items: T[] };
    if (!Array.isArray(entry.items) || Date.now() - entry.savedAt > CACHE_MAX_AGE_MS) return null;
    return entry.items;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, items: T[]) {
  try {
    window.localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ savedAt: Date.now(), items }));
  } catch {
    // armazenamento cheio ou bloqueado: o catálogo segue funcionando sem cache
  }
}

// Carrega o catálogo repetindo as falhas transitórias (rede, 5xx, tempo esgotado) com backoff: `items` fica nulo e
// `error` falso, ou seja, a interface segue no skeleton, até dar certo ou as tentativas acabarem.
// Com `cacheKey`, o último resultado fica guardado no navegador (até 24 h): ao voltar para a página os itens aparecem
// na hora e a versão nova é buscada em segundo plano. Falha de rede com cache disponível não mostra erro.
export function useMarketplaceCatalog<T>(load: () => Promise<T[]>, cacheKey?: string) {
  const [state, setState] = useState<{ key?: string; items: T[] | null }>(() => ({ key: cacheKey, items: cacheKey ? readCache<T>(cacheKey) : null }));
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  if (state.key !== cacheKey) setState({ key: cacheKey, items: cacheKey ? readCache<T>(cacheKey) : null });
  const items = state.key === cacheKey ? state.items : null;
  useEffect(() => {
    const controller = new AbortController();
    retryWithBackoff(load, { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return;
        setState({ key: cacheKey, items: data });
        setError(false);
        if (cacheKey) writeCache(cacheKey, data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      });
    return () => controller.abort();
  }, [load, cacheKey, revision]);
  function retry() {
    setState({ key: cacheKey, items: null });
    setError(false);
    setRevision((value) => value + 1);
  }
  return { items, error: error && !items, retry };
}

export function useMarketplaceQuery() {
  const [params, setParams] = useSearchParams();
  return [
    params.get("q") ?? "",
    (query: string) => {
      const next = new URLSearchParams(params);
      if (query) next.set("q", query);
      else next.delete("q");
      setParams(next, { replace: true });
    },
  ] as const;
}

export function useMarketplacePagination<T>(items: T[], resetKey: string, pageSize = 12) {
  const [selection, setSelection] = useState({ key: resetKey, page: 1 });
  if (selection.key !== resetKey) setSelection({ key: resetKey, page: 1 });
  const page = Math.max(1, Math.min(selection.key === resetKey ? selection.page : 1, Math.ceil(items.length / pageSize)));
  return {
    items: items.slice((page - 1) * pageSize, page * pageSize),
    pagination: { page, total: items.length, pageSize, onPageChange: (next: number) => setSelection({ key: resetKey, page: next }) },
  };
}

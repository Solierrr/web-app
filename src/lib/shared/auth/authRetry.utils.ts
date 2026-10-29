import { refresh } from "@/features/access/access.service";
import { getHttpStatus } from "@/lib/shared/http/http.service";

/** Repete a chamada uma única vez com a sessão renovada quando o servidor responde 401. */
export async function retryAfterRefresh<T>(call: () => Promise<T>): Promise<T> {
  try {
    return await call();
  } catch (error) {
    if (getHttpStatus(error) !== 401) throw error;
    const session = await refresh().catch(() => null);
    if (!session) throw error;
    return call();
  }
}

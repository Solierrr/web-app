import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export function useMarketplaceCatalog<T>(load: () => Promise<T[]>) {
  const [items, setItems] = useState<T[] | null>(null);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    load()
      .then((data) => {
        if (active) {
          setItems(data);
          setError(false);
        }
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [load, revision]);
  function retry() {
    setItems(null);
    setError(false);
    setRevision((value) => value + 1);
  }
  return { items, error, retry };
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

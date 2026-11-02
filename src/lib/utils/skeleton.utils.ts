/** Chaves estáveis para listas fixas de placeholders (skeletons), que nunca são reordenadas nem recebem itens. */
export function skeletonKeys(count: number): string[] {
  return Array.from({ length: count }, (_, position) => `skeleton-${position + 1}`);
}

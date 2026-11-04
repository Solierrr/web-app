import { useParams } from "react-router-dom";

/**
 * Lê um parâmetro de rota e devolve o valor apenas quando ele existe e não é vazio.
 * A ausência é indicada com `null`, sem lançar exceção, para que a página decida o que renderizar.
 */
export function useRequiredParam(name: string): string | null {
  const value = useParams()[name];
  return value && value.trim() !== "" ? value : null;
}

export interface PostalAddress {
  state: string;
  city: string;
  neighborhood: string;
  street: string;
}

export type PostalLookupResult = { found: true; address: PostalAddress } | { found: false };

interface ViaCepResponse {
  erro?: boolean | string;
  uf?: string;
  localidade?: string;
  bairro?: string;
  logradouro?: string;
}

const VIA_CEP_URL = (import.meta.env.VITE_VIACEP_URL as string | undefined) || "https://viacep.com.br/ws";

/** Consulta o endereço de um CEP de 8 dígitos. Lança erro em falha de rede ou resposta inválida. */
export async function lookupPostalCode(zipCode: string, signal?: AbortSignal): Promise<PostalLookupResult> {
  try {
    const response = await fetch(`${VIA_CEP_URL}/${zipCode}/json/`, { signal });
    if (!response.ok) throw new Error(`Postal lookup failed with status ${response.status}`);
    const data = (await response.json()) as ViaCepResponse;
    if (data.erro) return { found: false };
    return {
      found: true,
      address: {
        state: data.uf ?? "",
        city: data.localidade ?? "",
        neighborhood: data.bairro ?? "",
        street: data.logradouro ?? "",
      },
    };
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error("Postal lookup failed", { cause: error });
  }
}

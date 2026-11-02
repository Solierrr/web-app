<p align="center">
  <img src="../assets/readme/banners/react.png" alt="React" width="100%">
</p>

# Cadastro profissional

O fluxo é iniciado pela pessoa na interface e depende das permissões da conta.

```mermaid
flowchart TD
 N0[Carrega requisitos e rascunho] --> N1
 N1[Envia documentos] --> N2
 N2[Submete revisão] --> N3
 N3[Acompanha decisão]
```

Documento vazio, tipo não aceito ou tamanho acima de dez MiB é recusado no cliente. A autorização e a decisão final pertencem ao servidor.

O contexto entre repositórios está no [mapa de integrações](https://github.com/Solierrr/docs-warehouse/blob/main/docs/flows/INTEGRATIONS.md).

<p align="center">
  <img src="../assets/readme/banners/react.png" alt="React" width="100%">
</p>

# Acesso à plataforma

O fluxo é iniciado pela pessoa na interface e depende das permissões da conta.

```mermaid
flowchart TD
 N0[Pessoa informa senha ou identidade federada] --> N1
 N1[Cliente chama api-auth] --> N2
 N2[Guarda sessão e carrega contexto] --> N3
 N3[Abre área permitida]
```

Falha de autenticação mantém a pessoa na tela de acesso. O refresh é coordenado para reduzir uso simultâneo do mesmo token.

O contexto entre repositórios está no [mapa de integrações](https://github.com/Solierrr/docs-warehouse/blob/main/docs/flows/INTEGRATIONS.md).

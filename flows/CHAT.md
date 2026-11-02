<p align="center">
  <img src="../assets/readme/banners/react.png" alt="React" width="100%">
</p>

# Conversa e presença

O fluxo é iniciado pela pessoa na interface e depende das permissões da conta.

```mermaid
flowchart TD
 N0[Abre conversa pelo REST] --> N1
 N1[Conecta STOMP com JWT] --> N2
 N2[Recebe mensagens e eventos de presença] --> N3
 N3[Atualiza lista e leitura]
```

Erro de conexão exige reconexão e recuperação pelo REST. As mensagens e a presença não dependem de Firestore.

O contexto entre repositórios está no [mapa de integrações](https://github.com/Solierrr/docs-warehouse/blob/main/docs/flows/INTEGRATIONS.md).

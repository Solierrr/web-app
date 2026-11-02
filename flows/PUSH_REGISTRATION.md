<p align="center">
  <img src="../assets/readme/banners/react.png" alt="React" width="100%">
</p>

# Ativação de avisos

O fluxo é iniciado pela pessoa na interface e depende das permissões da conta.

```mermaid
flowchart TD
 N0[Pessoa autoriza notificações] --> N1
 N1[Obtém token do Firebase] --> N2
 N2[Cadastra instalação no api-notify] --> N3
 N3[Recebe avisos no navegador]
```

Navegador incompatível, permissão bloqueada e chave VAPID ausente impedem ativação. A remoção da instalação é tratada na saída da conta.

O contexto entre repositórios está no [mapa de integrações](https://github.com/Solierrr/docs-warehouse/blob/main/docs/flows/INTEGRATIONS.md).

<p align="center">
  <img src="../assets/readme/banners/react.png" alt="React" width="100%">
</p>

# Situação

Leitura da main em 2026-10-31.

- O assistente tem cliente HTTP real para `ai-assistant` e `ai-operational`, ao contrário do checklist antigo.
- A análise de imagens já tem cliente real e tratamento de indisponibilidade em `aiAccessibility.service.ts`.
- Há cadastro de instalação e histórico de notificações pelo `api-notify`.
- Digitação e presença são eventos STOMP. Não foi encontrado modelo Firestore de escrita.
- A UI usa componentes em `src/lib/`, sem depender do pacote `lib-web` no manifesto.
- O catálogo usa o `api-core`, e os serviços integrados estão publicados no QA e na produção.

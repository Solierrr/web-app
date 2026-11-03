<p align="center">
  <img src="../assets/readme/banners/react.png" alt="React" width="100%">
</p>

# Situação

Leitura da main em 2026-10-31.

- O assistente tem cliente HTTP real para `ai-assistant` e `ai-operational`, ao contrário do checklist antigo.
- A análise de imagens já tem cliente real e tratamento de indisponibilidade em `aiAccessibility.service.ts`.
- Há cadastro de instalação e histórico de notificações pelo `api-notify`.
- Digitação e presença são eventos STOMP. Não foi encontrado modelo Firestore de escrita.
- O chat cobre as rotas de usuário do `api-messenger`: canal único `.events`, recuperação por `/messaging/updates` a cada conexão, editar e excluir na janela de 30 minutos, silenciar e arquivar com a lista de arquivadas, grupos avulsos (participantes e gestor), comunidade do projeto (membros, papéis, sucessores e arquivamento), anexos pelo bucket com link assinado, avaliações de profissionais e NPS do assistente (2026-11-02).
- Anexos dependem do bucket de mídia do `api-messenger` aceitar o domínio do portal no CORS, tanto no envio quanto no redirecionamento do download (2026-11-02).
- Avaliação de produto (`PRODUTO`) não tem tela: o serviço aceita o tipo, mas o portal só avalia profissionais (2026-11-02).
- A UI usa componentes em `src/lib/`, sem depender do pacote `lib-web` no manifesto.
- O catálogo usa o `api-core`, e os serviços integrados estão publicados no QA e na produção.

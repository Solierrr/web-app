# Rodando o Projeto Localmente

Este repositório é TypeScript (React + Vite). O processo local é sempre o mesmo: clonar, abrir na IDE, instalar as dependências via `npm` e subir o servidor de desenvolvimento. Antes de iniciar, verifique a seção de impedimentos abaixo — o projeto depende do Firebase Authentication para o login e possui um sistema de mocks que evita bloqueio total mesmo sem a API de persistência configurada.

<p>
  <a href="https://github.com/syvixor/skills-icons">
    <img src="https://skills.syvixor.com/api/icons?i=ts,react,vite,tailwind,firebase,github" height="48" alt="Rodando o Projeto — TypeScript">
  </a>
</p>

## Possíveis Impedimentos

- **Node.js na versão usada no `Dockerfile`** (`node:22-alpine` ou equivalente), rodar com uma versão diferente pode gerar builds inconsistentes com o que roda em produção.
- **Firebase configurado**, o repositório usa o Firebase Authentication (projeto `solaria-authenticator` em `.firebaserc`) para o login — sem acesso ao projeto Firebase, o login fica indisponível.
- **Variáveis `VITE_*` em `.env.local`**, o repositório já traz um `.env.example` com os valores padrão de desenvolvimento; copie-o e ajuste conforme necessário antes de rodar `npm run dev`.

## Instalação do Projeto

### Iniciando o repositório com o Github

<p>
  <a href="https://github.com/syvixor/skills-icons">
    <img src="https://skills.syvixor.com/api/icons?i=github,vscode" height="48" alt="Frameworks">
  </a>
</p>

Clone o repositório e abra no VS Code.

```Comandos para clonar o repositório
git clone https://github.com/Solierrr/web-app.git
cd ./web-app
code . -r
```

### Configurando as variáveis de ambiente

```Comandos para configurar o .env local
cp .env.example .env.local
```

As variáveis `VITE_*` são embutidas no bundle em build-time, então nunca guarde segredos nelas. O `.env.example` traz todas, comentadas, com valores seguros por padrão (sem mocks).

| Variável | Finalidade |
|---|---|
| `VITE_APP_MODE` | `PROD` ou `TEST`. `TEST` expõe as rotas de teste (`TestRoutes`); use só em desenvolvimento. |
| `VITE_MOCKS` | `ALWAYS`, `FALLBACK` ou `DEACTIVATED`. Mocks dos dados de domínio (catálogo, empresas, perfis). |
| `VITE_AUTH_MOCKS` | `ALWAYS` ou `DEACTIVATED`. Mock do login e da sessão; sobrepõe `VITE_MOCKS` só para a autenticação. |
| `VITE_MESSENGER_MOCKS` | `ALWAYS` ou `DEACTIVATED`. Mock de mensagens e tempo real (digitando, presença, assistente); sobrepõe `VITE_MOCKS` só para o messenger. |
| `VITE_AI_MOCKS` | `ALWAYS` ou `DEACTIVATED`. Mock dos serviços de IA (validação de CNPJ e certificados, assistentes e texto alternativo de imagens); sobrepõe `VITE_MOCKS` só para a IA. O assistente do demandante grava as conversas simuladas no messenger local, então use-o junto com `VITE_MESSENGER_MOCKS="ALWAYS"`. |
| `VITE_NOTIFY_MOCKS` | `ALWAYS` ou `DEACTIVATED`. Mock do histórico de notificações e do registro de dispositivo; sobrepõe `VITE_MOCKS` só para o `api-notify`. |
| `VITE_MOCKS_DELAY_SECONDS` | Atraso simulado, em segundos, das respostas mockadas. |
| `VITE_LOGS` | `DEBUG`, `ACTIVATED` ou `DEACTIVATED`. Nível de logging. |
| `VITE_API_CORE` | URL base do `api-core`; o front acrescenta o prefixo `/api` das rotas. |
| `VITE_API_AUTH` | URL base do `api-auth` (login, cadastro e renovação de sessão). |
| `VITE_API_MESSENGER` | URL base do `api-messenger` (REST); o front acrescenta `/messaging`. |
| `VITE_WS_MESSENGER` | Endereço completo do WebSocket STOMP do `api-messenger`, por exemplo `wss://host/messaging/ws`. |
| `VITE_API_NOTIFY` | URL base do `api-notify` (histórico de notificações e registro de dispositivos para push); o front acrescenta `/notify`. |
| `VITE_API_VALIDATION` | URL base do `ai-validation` (validação de CNPJ e certificados NR-10/NR-35). Todas as rotas exigem o `Authorization: Bearer` do `api-auth` (o front renova a sessão uma vez ao receber `401`) e a origem do web-app precisa constar em `CORS_ALLOWED_ORIGINS` do serviço. Limites: 10 certificados e 20 CNPJs por minuto; o cold start do Render leva de 40 a 100 s, então o front espera até 120 s. |
| `VITE_API_ACCESSIBILITY` | URL base do `ai-accessibility` (`https://ai-accessibility.onrender.com`). Os uploads de imagem (fotos do modelo de placa, perfil e banner, logotipo de marca e fotos de projeto) enviam a imagem a `POST /v1/images/analyze` com o Bearer do `api-auth` antes de entrar na lista de envio. A decisão `approved` sugere o texto alternativo (campo editável); `rejected` e `review_required` por risco impedem o envio; falha, limite (`429`), `503` ou timeout do serviço nunca bloqueiam o upload e o texto passa a ser manual. A origem do web-app precisa constar em `CORS_ALLOWED_ORIGINS` do serviço. |
| `VITE_API_ASSISTANT` | URL base do `ai-assistant` (assistente do demandante). O front chama `POST /chat` com `{conversation_id, message}` e o Bearer do `api-auth`; o `conversation_id` é só o `thread_id` guardado neste navegador. O agente cria a conversa no `api-messenger` (`messenger_conversation_id` na resposta), grava a mensagem do usuário e a resposta, então o front não envia `USER_TO_CHATBOT` por conta própria: ele sincroniza a conversa depois do turno. Esperas de até 120 s, uma renovação de sessão automática em `401` e mensagens próprias para `403`, `429`, `503`, timeout e falta de conexão, com reenvio na fila do chat. A origem do web-app precisa constar em `CORS_ALLOWED_ORIGINS` do serviço. |
| `VITE_API_OPERATIONAL` | URL base do `ai-operational`, o assistente de ajuda do SaaS para empresas (fornecedores, demandantes e administradores). Aparece no painel lateral e em `/painel/assistente` quando o contexto ativo é uma empresa; no contexto pessoal essas telas usam o `ai-assistant`. O front chama `POST /chat` com o Bearer do `api-auth` e o `conversation_id` é o `thread_id` da conversa, guardado na sessão do navegador (o serviço não grava no messenger). Os caminhos de tela citados na resposta só viram botão de navegação se casarem com uma rota estática conhecida do web-app; a ação proposta só é executada quando o usuário clica em Confirmar, o que envia a mensagem `sim`. Esperas de até 120 s, uma renovação de sessão em `401`, mensagens próprias para `403`, `429`, `503`, timeout e falta de conexão, reenvio na fila e descarte. A origem do web-app precisa constar em `CORS_ALLOWED_ORIGINS` do serviço. |
| `VITE_EXCHANGE_API` | URL da API pública de câmbio consumida pela feature `exchange`. |
| `VITE_GOOGLE_MAPS_API_KEY` | Opcional. Chave do widget de mapa em Unidades; sem ela o formulário usa latitude e longitude numéricas. |
| `VITE_FIREBASE_VAPID_KEY` | Opcional. Chave pública VAPID do Firebase Cloud Messaging (push web). Sem ela o registro de push fica desligado e o navegador nunca é solicitado a pedir permissão; a central de notificações segue funcionando pelo `api-notify`. |
| `VITE_MOBILE_INSTALL_URL` | Opcional. Link de instalação do app mobile na página de acesso mobile. |
| `VITE_LOCAL_API_CORE_TARGET` | Só desenvolvimento. Destino do proxy `/local-api/core` (padrão `http://localhost:8080`). |
| `VITE_DEV_LOGIN_EMAIL`, `VITE_DEV_LOGIN_PASSWORD` | Só desenvolvimento. Pré-preenchem o login com uma conta do seed local. |

Os mocks só existem em desenvolvimento (`npm run dev`) e nos testes, e apenas quando ligados de forma explícita. Um build de produção (`npm run build`) ignora `VITE_MOCKS`, `VITE_AUTH_MOCKS`, `VITE_MESSENGER_MOCKS`, `VITE_AI_MOCKS` e `VITE_NOTIFY_MOCKS`, então QA e produção sempre chamam as APIs reais. Para desenvolver sem backend do messenger, use `VITE_MESSENGER_MOCKS="ALWAYS"`: o tempo real (mensagens ao vivo, digitando, presença e respostas do assistente) é simulado pelo mesmo caminho de código da conexão real. O WebSocket é STOMP puro (sem SockJS): `wss://<host>/messaging/ws` atrás do gateway e `ws://localhost:8080/ws` com o `api-messenger` local.

### Notificações push no navegador

O push web usa o Firebase Cloud Messaging do projeto `solaria-authenticator` e o `api-notify`. Ele só liga quando `VITE_FIREBASE_VAPID_KEY` está definida; a chave é criada por quem administra o projeto Firebase (Cloud Messaging > Certificados push da Web) e nunca vai para o repositório. A permissão do navegador só é pedida quando a pessoa clica em "Ativar notificações" em Configurações; depois disso o dispositivo é registrado no `api-notify` a cada início de sessão e removido ao sair. O service worker `public/firebase-messaging-sw.js` recebe a configuração pública do Firebase por parâmetros de URL, sem segredos, e exige HTTPS ou `localhost`. Em desenvolvimento sem chave, use `VITE_NOTIFY_MOCKS="ALWAYS"` para simular o histórico e o botão de ativar.

### Instalando dependências necessárias para rodar o projeto localmente

<p>
  <a href="https://github.com/syvixor/skills-icons">
    <img src="https://skills.syvixor.com/api/icons?i=npm" height="48" alt="Frameworks">
  </a>
</p>

```Comandos para instalação de dependências
npm install
npm run dev
```

## Outros Comandos Disponíveis

- `npm run build`, roda a checagem de tipos (`tsc -b`) e gera o build de produção com Vite.
- `npm run preview`, serve localmente o build gerado por `npm run build`.
- `npm run lint`, roda o ESLint sobre o projeto.
- `npm run format` / `npm run format:check`, aplica ou apenas verifica a formatação com Prettier.
- `npm run test`, roda a suíte de testes com Vitest.
- `npm run storybook`, sobe o Storybook em modo desenvolvimento na porta `6006` para visualizar os componentes de `src/lib/components/`.
- `npm run build-storybook`, gera o build estático do Storybook.

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
| `VITE_MOCKS_DELAY_SECONDS` | Atraso simulado, em segundos, das respostas mockadas. |
| `VITE_LOGS` | `DEBUG`, `ACTIVATED` ou `DEACTIVATED`. Nível de logging. |
| `VITE_API_CORE` | URL base do `api-core`; o front acrescenta o prefixo `/api` das rotas. |
| `VITE_API_AUTH` | URL base do `api-auth` (login, cadastro e renovação de sessão). |
| `VITE_API_MESSENGER` | URL base do `api-messenger` (REST); o front acrescenta `/messaging`. |
| `VITE_WS_MESSENGER` | Endereço completo do WebSocket STOMP do `api-messenger`, por exemplo `wss://host/messaging/ws`. |
| `VITE_API_VALIDATION` | URL base do `ai-validation` (validação de CNPJ e certificados NR-10/NR-35). Todas as rotas exigem o `Authorization: Bearer` do `api-auth` (o front renova a sessão uma vez ao receber `401`) e a origem do web-app precisa constar em `CORS_ALLOWED_ORIGINS` do serviço. Limites: 10 certificados e 20 CNPJs por minuto; o cold start do Render leva de 40 a 100 s, então o front espera até 120 s. |
| `VITE_EXCHANGE_API` | URL da API pública de câmbio consumida pela feature `exchange`. |
| `VITE_GOOGLE_MAPS_API_KEY` | Opcional. Chave do widget de mapa em Unidades; sem ela o formulário usa latitude e longitude numéricas. |
| `VITE_MOBILE_INSTALL_URL` | Opcional. Link de instalação do app mobile na página de acesso mobile. |
| `VITE_LOCAL_API_CORE_TARGET` | Só desenvolvimento. Destino do proxy `/local-api/core` (padrão `http://localhost:8080`). |
| `VITE_DEV_LOGIN_EMAIL`, `VITE_DEV_LOGIN_PASSWORD` | Só desenvolvimento. Pré-preenchem o login com uma conta do seed local. |

Os mocks só existem em desenvolvimento (`npm run dev`) e nos testes, e apenas quando ligados de forma explícita. Um build de produção (`npm run build`) ignora `VITE_MOCKS`, `VITE_AUTH_MOCKS`, `VITE_MESSENGER_MOCKS` e `VITE_AI_MOCKS`, então QA e produção sempre chamam as APIs reais. Para desenvolver sem backend do messenger, use `VITE_MESSENGER_MOCKS="ALWAYS"`: o tempo real (mensagens ao vivo, digitando, presença e respostas do assistente) é simulado pelo mesmo caminho de código da conexão real. O WebSocket é STOMP puro (sem SockJS): `wss://<host>/messaging/ws` atrás do gateway e `ws://localhost:8080/ws` com o `api-messenger` local.

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

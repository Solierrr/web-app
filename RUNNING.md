# Rodando o Projeto Localmente

Este repositório é TypeScript (React + Vite). O processo local é sempre o mesmo: clonar, abrir na IDE, instalar as dependências via `npm` e subir o servidor de desenvolvimento. Antes de iniciar, verifique a seção de impedimentos abaixo — o projeto depende de Firebase (Firestore) para o chat e possui um sistema de mocks que evita bloqueio total mesmo sem a API de persistência configurada.

<p>
  <a href="https://github.com/syvixor/skills-icons">
    <img src="https://skills.syvixor.com/api/icons?i=ts,react,vite,tailwind,firebase,github" height="48" alt="Rodando o Projeto — TypeScript">
  </a>
</p>

## Possíveis Impedimentos

- **Node.js na versão usada no `Dockerfile`** (`node:22-alpine` ou equivalente), rodar com uma versão diferente pode gerar builds inconsistentes com o que roda em produção.
- **Firebase configurado**, o repositório usa Firestore (`firebase.json`, `firestore.rules`, `firestore.indexes.json`, projeto `solaria-authenticator` em `.firebaserc`) para o indicador de digitação do chat (`typingStatus.service.ts`) — sem acesso ao projeto Firebase, apenas essa funcionalidade específica fica indisponível, o restante do app funciona normalmente.
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

- `VITE_APP_MODE`, `TEST` ou `PROD`, controla se as rotas de teste (`TestRoutes`) ficam ativas.
- `VITE_MOCKS`, `ALWAYS` | `FALLBACK` | `DEACTIVATED`, controla se as chamadas de API usam dado mockado sempre, apenas como fallback em caso de erro, ou nunca.
- `VITE_LOGS`, `DEBUG` | `ACTIVATED` | `DEACTIVATED`, nível de logging da aplicação.
- `VITE_EXCHANGE_API`, URL da API pública de câmbio consumida pela feature `exchange`.
- `VITE_API_PERSISTENCE`, URL da API de persistência própria do backend, `{a confirmar}` valor real usado em produção.

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
- `npm run storybook`, sobe o Storybook em modo desenvolvimento na porta `6006` para visualizar os componentes de `src/components/`.
- `npm run build-storybook`, gera o build estático do Storybook.

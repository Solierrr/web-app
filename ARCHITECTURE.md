# Arquitetura do Repositório

O **Solaria** é uma Single Page Application em React 19 + TypeScript, servida por Vite e empacotada em uma imagem Nginx no `Dockerfile`. A organização do código segue uma separação por responsabilidade: `features/` agrupa páginas, tipos, serviços e mocks por domínio de negócio; `components/` guarda peças de UI reutilizáveis; `shared/` concentra código transversal; e `config/` reúne infraestrutura como internacionalização, Firebase, logging e o sistema de mocks. Rotas são declaradas de forma centralizada e multiplicadas automaticamente para cada idioma suportado, e cada camada de acesso a API já nasce com um caminho de fallback para dados mockados, permitindo que o time de frontend trabalhe sem depender do backend estar sempre disponível.

<p>
  <a href="https://github.com/syvixor/skills-icons">
    <img src="https://skills.syvixor.com/api/icons?i=react,typescript,vite,tailwind,firebase,docker" height="48" alt="Arquitetura">
  </a>
</p>

- **Roteamento centralizado em `src/routes/AppRoutes.tsx`**, as rotas de acesso (login, registro, esqueci a senha) e de aplicação (feeds, buscas, perfis, chat, CRUD) são declaradas como listas de `RouteDefinition` e multiplicadas para cada idioma em `SUPPORTED` via `joinSegments`, garantindo URLs localizadas (`/pt-BR/...`, `/en-US/...`, `/es-ES/...`) sem duplicar componentes.
- **Código agrupado por feature em `src/features/`**, cada domínio (`solar-panel`, `companies`, `professionals`, `users`, `messages`, `exchange`, `access`) concentra suas páginas em `pages/<fluxo>/`, além de serviços `*.service.ts`, tipos `*.d.ts` e, quando aplicável, mocks `*.d.mocks.ts` usados pelo sistema de fallback.
- **Código transversal em `src/shared/`**, incluindo infraestrutura HTTP, tipos comuns e páginas globais de erro em `shared/pages/error/`.
- **Cliente HTTP fino em `src/shared/http/http.service.ts`**, encapsula `fetch`, padroniza tratamento de erro e logging via `httpJson`, evitando repetição de boilerplate em cada service.
- **Sistema de mocks resiliente em `src/config/mocks/`**, o `fallback.service.ts` decide, a partir da variável `VITE_MOCKS` (`ALWAYS` | `FALLBACK` | `DEACTIVATED`), se a chamada real à API é feita ou se retorna dado mockado, inclusive quando a API real falha em tempo de execução.
- **Integração com Firebase em `src/config/firebase/`**, usa Firestore (`getFirestore`) para funcionalidades em tempo real como indicador de digitação (`typingStatus.service.ts` e o hook `useTypingStatus`) no chat.
- **Internacionalização em `src/config/inter/`**, usa `i18next` / `react-i18next` com dicionários por idioma em `locales/{en-US,es-ES,pt-BR}/*.json` separados por domínio (`access`, `chat`, `crud`, `feed`, `profile`, `search`, `commons`, `routes`, `announcements`), e o `LanguageLayout` resolve o idioma a partir da URL.
- **Componentes de UI em `src/components/`**, organizados por categoria (`ui/` para primitivos como `Button`, `Input`, `Select`, `Textarea`, `Icon`; `layout/` para navbar, footer, chat, anúncios e a moldura compartilhada de perfis; `feedback/` para skeleton e alert; `overlay/` para menus e context menu; `brand/` para logo e copyright), a maioria documentada com Storybook (`*.stories.tsx`).
- **Aliases de import via Vite**, `@` aponta para `src/` e `@@` aponta para `src/components/`, configurados em `vite.config.ts` e replicados no `tsconfig`.
- **Testes com Vitest + Testing Library**, arquivos `*.test.tsx`/`*.test.ts` ficam ao lado do código testado, com ambiente `jsdom` configurado em `src/config/vite/test.setup.ts`; há também um projeto Vitest dedicado a rodar os testes do Storybook via `@storybook/addon-vitest`.

```Tree do Repositório
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   └── quality.yml
│   └── pull_request_template.md
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── brand/
│   │   ├── feedback/
│   │   ├── layout/
│   │   │   └── profile/
│   │   ├── overlay/
│   │   └── ui/
│   ├── config/
│   │   ├── error/
│   │   ├── firebase/
│   │   ├── inter/
│   │   │   └── locales/{en-US,es-ES,pt-BR}/
│   │   ├── logging/
│   │   ├── mocks/
│   │   └── vite/
│   ├── features/
│   │   ├── access/pages/{login,register,forgot-password}/
│   │   ├── companies/pages/{feed,search,profile}/
│   │   ├── exchange/
│   │   ├── messages/pages/{chat,chatbot}/
│   │   ├── professionals/pages/{feed,search,profile}/
│   │   ├── solar-panel/pages/{announcement,feed,search,model-crud}/
│   │   └── users/user/pages/{profile,onboarding}/
│   ├── routes/
│   ├── shared/
│   │   ├── pages/error/{boundary,generic,not-found}/
│   │   ├── http/
│   │   ├── styles/
│   │   └── types/
│   ├── utils/
│   ├── App.tsx
│   ├── App.test.tsx
│   ├── index.css
│   └── main.tsx
├── .env.example
├── .firebaserc
├── firebase.json
├── firestore.indexes.json
├── firestore.rules
├── eslint.config.js
├── vite.config.ts
├── tsconfig.node.json
├── sonar-project.properties
├── Dockerfile
├── README.md
├── ARCHITECTURE.md
├── RUNNING.md
├── LICENSE
└── index.html
```

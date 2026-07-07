# Roadmap de Implementação — Projeto Interdisciplinar (React + TypeScript)

> Baseado nos requisitos mínimos (nota 7,0) e itens extras do documento de solicitações por disciplina (14/05/2026).
> Duração estimada: 4 semanas, com commits distribuídos (Conventional Commits) ao longo de todo o período.

---

## Fase 0 — Setup do Projeto (Semana 1, dias 1-2)

- [x] Criar projeto com Vite: `npm create vite@latest meu-projeto -- --template react-ts`
- [x] Configurar ESLint + Prettier (garante nada de `.js`/`.jsx` em `src/`)
- [x] Criar estrutura de pastas:
  ``
  src/
    components/
    pages/
    types/
    services/
    hooks/
    context/
    utils/
    routes/
  ```
- [x] ______Configurar variáveis de ambiente (`.env`, `.env.example`) para chaves/URLs de API______ (vamos usar Secrets)
- [x] Adicionar `.env` ao `.gitignore`
- [x] Instalar dependências: `npm install react-router-dom`
- [x] Primeiro commit: `feat: setup inicial do projeto com Vite + React + TypeScript`
- [x] Publicar repositório no GitHub

**Commits sugeridos:** `feat: setup vite`, `chore: configura eslint e prettier`, `chore: estrutura de pastas`

---

## Fase 1 — Tipagem e Fundação de Dados (Semana 1, dias 3-5)

- [ ] Definir interfaces de domínio em `src/types/` (um arquivo por entidade, ex: `types/produto.ts`, `types/usuario.ts`)
- [ ] Definir interfaces de props de cada componente/página junto ao próprio componente ou em `types/`
- [ ] Garantir **zero uso de `any`** — usar `unknown` + type guards quando necessário
- [ ] Criar camada `src/services/` com um arquivo por recurso (ex: `services/produtoService.ts`)
  - [ ] Cada função retorna `Promise<Tipo>`
  - [ ] `try/catch` em toda chamada de API
  - [ ] Nenhum `fetch` direto em componentes/páginas
- [ ] Criar funções de validação/sanitização em `src/utils/` (tipo, tamanho máximo, mensagem de erro por campo)

**Commits sugeridos:** `feat: adiciona tipos de dominio`, `feat: cria camada de servicos`, `feat: adiciona validacao de formularios`

---

## Fase 2 — Roteamento (Semana 2, dias 1-2)

- [ ] Envolver `App` com `BrowserRouter` no `main.tsx`
- [ ] Criar `src/routes/AppRoutes.tsx` com no mínimo **3 rotas**
- [ ] Rota curinga `path="*"` → página de erro (404) com botão de retorno (`useNavigate` ou `<Link to="/">`)
- [ ] Navegação exclusivamente via `<Link>` ou `useNavigate` — **proibido `window.location.href`**
- [ ] Implementar rota dinâmica com parâmetro (ex: `/produtos/:id`)
  - [ ] Usar `useParams<{ id: string }>()`
  - [ ] **Validar presença do parâmetro antes de usar** (ex: `if (!id) return <NotFound />`)
- [ ] (Extra) Estruturar rotas aninhadas com layout + `<Outlet />`, se aplicável

**Commits sugeridos:** `feat: configura react router`, `feat: adiciona pagina 404`, `feat: rota dinamica de detalhe`

---

## Fase 3 — Componentes e Estado (Semana 2, dias 3-5)

- [ ] Construir **mínimo de 6 componentes** com responsabilidade única (separar renderização / lógica / acesso a dados)
- [ ] Estado local com `useState`, agrupando campos relacionados em objeto único (nunca mutar array/objeto diretamente — sempre spread/imutabilidade)
- [ ] Implementar `useEffect` com array de dependências correto e explícito (testar removendo uma dependência para validar comportamento)
- [ ] Renderizar listas dinâmicas com `key` de identificador único (nunca `key={index}` quando há add/remove/reorder)
- [ ] Implementar os **3 estados visuais** para operações assíncronas em cada tela que consome API:
  - [ ] Carregando (spinner / skeleton / `aria-live`)
  - [ ] Sucesso
  - [ ] Erro (com `role="alert"`)
  - [ ] **Proibido `alert()` ou `console.log`** como único tratamento de erro

**Commits sugeridos:** `feat: componente ListaProdutos`, `feat: estados de loading e erro`, `refactor: separa logica de renderizacao`

---

## Fase 4 — Acessibilidade Básica WCAG 2.1 AA (Semana 3, dias 1-2)

- [ ] Trocar todo `<div onClick>` por `<button>`
- [ ] Associar `<label htmlFor>` a cada `<input>`
- [ ] Adicionar `alt` descritivo em imagens (ou `alt=""` se decorativa)
- [ ] Validar contraste mínimo (4,5:1 texto normal / 3:1 texto grande) — usar ferramenta como Lighthouse ou axe DevTools
- [ ] Garantir foco visível em todos os elementos interativos
- [ ] Testar navegação completa **sem mouse** (Tab, Shift+Tab, Enter, Esc)
- [ ] Erros de formulário anunciados com `role="alert"`

**Commits sugeridos:** `fix: acessibilidade em formularios`, `fix: contraste de cores`, `feat: navegacao por teclado`

---

## Fase 5 — Deploy e Documentação (Semana 3, dias 3-4)

- [ ] Configurar deploy (Vercel ou GitHub Pages)
- [ ] Testar aplicação publicada em produção (rotas funcionando com refresh direto na URL)
- [ ] Escrever `README.md` com:
  - [ ] Descrição do projeto
  - [ ] Link da aplicação publicada
  - [ ] Instruções de instalação/execução local
  - [ ] Variáveis de ambiente necessárias (sem valores reais)

**Commits sugeridos:** `docs: adiciona readme`, `chore: configura deploy vercel`

---

## Fase 6 — Itens Extras (Semana 3 dia 5 → Semana 4)

Priorize os extras conforme o tempo restante; todos exigem demonstração oral/ao vivo.

- [ ] **Context API**: Provider dedicado + hook customizado de consumo + tipagem completa (demonstrar prop drilling resolvido)
- [ ] **useReducer**: `State` e `Action` como union types tipados (justificar por que não múltiplos `useState`)
- [ ] **Hook customizado de dados**: retorno tipado, loading, erro tratado, `AbortController` para cancelamento
- [ ] **React.lazy + Suspense** por página (demonstrar na aba Network do DevTools)
- [ ] **localStorage versionado**: campo `_versao`, verificação ao carregar, migração/descarte seguro
- [ ] **useCallback / useMemo** com justificativa de performance (demonstrar no React DevTools Profiler)
- [ ] **Proteção XSS**: nunca `dangerouslySetInnerHTML` com dados externos; tudo via `{variavel}` JSX
- [ ] **PrivateRoute**: componente que redireciona para login se não autenticado, estado via Context (nunca checado direto na página)
- [ ] **Acessibilidade avançada**: ARIA em modais/menus/abas (`aria-expanded`, `aria-controls`, `aria-haspopup`, `aria-selected`), gerenciamento programático de foco, landmarks semânticos (`<header>`, `<main>`, `<nav>`, `<footer>`), teste com leitor de tela (NVDA/VoiceOver)

**Commits sugeridos:** `feat: context de autenticacao`, `feat: useReducer no carrinho`, `feat: lazy loading de rotas`, `feat: private route`, `feat: aria em modal`

---

## Fase 7 — Revisão Final e Apresentação (Semana 4, últimos dias)

- [ ] Revisar checklist completo do mínimo (7,0) — nenhum item pendente
- [ ] Conferir contagem de commits (mínimo 20, Conventional Commits, distribuídos em 4+ semanas reais — não concentrados no último dia)
- [ ] Ensaiar demonstração ao vivo:
  - [ ] Navegação 100% por teclado
  - [ ] Remoção de uma dependência do `useEffect` para mostrar o efeito da mudança
  - [ ] DevTools Network mostrando lazy loading (se implementado)
  - [ ] Leitor de tela navegando sem perda de contexto (se implementado)
- [ ] Testar aplicação publicada em ambiente limpo (aba anônima, sem cache)


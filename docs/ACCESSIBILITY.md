# Acessibilidade

Este documento descreve os padrões de acessibilidade adotados na interface web e como verificá-los. A meta é o nível AA das diretrizes WCAG 2.1.

## Princípios

- Toda ação é um `<button>` ou um link. Elementos não interativos não recebem `onClick`.
- Todo campo tem um rótulo associado, por `<label>` que envolve o campo ou por `htmlFor` e `id`. Quando o rótulo visual não existe, o campo recebe `aria-label`.
- Imagens informativas têm `alt` descritivo. Imagens decorativas usam `alt=""`.
- Mensagens de erro entram no DOM com `role="alert"`. Mensagens de estado usam `role="status"`.
- A interface inteira é operável por teclado, com foco sempre visível e ordem de foco lógica.

## Foco visível

O estilo global está em `src/index.css` (`:focus-visible`) e usa a cor de tinta do tema com espessura de 2,5 px, o que mantém contraste superior a 3:1 contra os fundos claros. Componentes que definem o próprio anel usam a mesma cor. Nenhum componente deve remover o contorno sem substituí-lo.

## Contraste

- O texto pequeno em laranja usa o token `--color-orange-text`, e não `--color-orange`, que fica abaixo de 4,5:1 sobre branco. Use `text-orange-text` para texto, links e rótulos ativos.
- Placeholders e rótulos inativos usam `--color-input-text`, ajustado para 4,5:1 sobre os campos.
- A cor `--color-orange` fica reservada para fundos, ícones e texto grande.

## Estrutura de página

- Toda página tem um único `<main>` e um `<h1>`, mesmo quando o título é apenas para leitores de tela (`sr-only`).
- O layout público e o layout logado começam com um link "Pular para o conteúdo", visível apenas quando recebe foco.
- A navegação lateral é um landmark com nome acessível (`aria-label`). Quando vira gaveta no celular, recebe `role="dialog"` e `aria-modal`.
- Níveis de título não são pulados. Rótulos de métrica e de cartões usam o nível seguinte ao da seção ou um parágrafo.

## Componentes interativos

- **Diálogos** usam o elemento nativo `<dialog>` aberto como modal, o que prende o foco, fecha com `Esc` e devolve o foco ao elemento de origem. O diálogo tem `aria-labelledby`.
- **Popovers** (por exemplo, o centro de notificações) têm `role="dialog"` e rótulo, movem o foco ao abrir, fecham com `Esc` e devolvem o foco ao botão de origem.
- **Menus e listas de opções** (`MenuList` e `MenuItem`) aceitam setas, `Home` e `End`, com navegação circular, e ativam com `Enter` ou espaço. O foco aparece com contorno.
- **Select** abre com `Enter`, espaço ou setas, leva o foco à opção selecionada (ou à primeira), navega com as setas e fecha com `Esc`, devolvendo o foco ao botão.
- **Abas de navegação** (`Switcher`) são links dentro de `<nav>` e marcam a página atual com `aria-current`.
- **Tabelas** têm nome acessível, cabeçalhos ordenáveis com `aria-sort` e região rolável focável.
- **Notificações temporárias** usam `role="alert"` para erros e `role="status"` para as demais.

## Verificação

- Lint: o `eslint-plugin-jsx-a11y` roda junto com o `npm run lint` e falha em violações. As exceções de configuração estão em `eslint.config.js`.
- Testes: use `expectNoA11yViolations(container)`, de `src/lib/shared/accessibility/accessibility.matchers.ts`, que executa o axe sobre o resultado renderizado. Há testes para login, configurações, painel de análises e o catálogo.
- Storybook: o painel de acessibilidade mostra as violações de cada componente.
- Manual: percorra as telas apenas com o teclado (`Tab`, `Shift+Tab`, setas, `Enter`, `Esc`), confira se o foco nunca se perde e teste os fluxos de login e de abertura e fechamento de diálogos com um leitor de tela.

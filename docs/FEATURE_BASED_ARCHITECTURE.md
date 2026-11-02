<p align="center">
  <img src="../assets/readme/banners/react.png" alt="React" width="100%">
</p>

# Arquitetura por funcionalidade

O `web-app` segue a arquitetura baseada em funcionalidades (feature based). Em vez de agrupar os arquivos pelo tipo (todos os componentes juntos, todas as páginas juntas, todos os serviços juntos), o código é agrupado pelo domínio do negócio. Este documento explica a escolha e mostra onde fica cada coisa que a disciplina de Desenvolvimento de Aplicações Dinâmicas espera encontrar.

## Como o código está organizado

```text
src/
  features/<domínio>/      uma pasta por domínio do negócio (24 hoje)
    pages/                 páginas do domínio
    components/            componentes usados só por esse domínio
    <domínio>.service.ts   chamadas à API do domínio, com retorno tipado
    <domínio>.d.ts         tipos e interfaces do domínio
    *.test.ts(x)           testes ao lado do código que testam
  lib/
    components/            componentes reutilizáveis (ui, layout, overlay, feedback, dashboard)
    shared/                HTTP, tipos comuns, validação, acessibilidade, contexto, formulários
    utils/                 funções puras de validação, normalização e sanitização
  routes/                  mapa de rotas e guardas de acesso
  config/                  internacionalização, Firebase, logs e modos de dados
```

## Onde fica o que o enunciado pede

| O enunciado espera | Onde está                                                                            | Observação                                                                |
| ------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| `src/components/`  | `src/lib/components/` (reutilizáveis) e `src/features/*/components/` (de um domínio) | Componentes com pasta própria quando têm teste e story, como `ui/select/` |
| `src/pages/`       | `src/features/*/pages/`                                                              | 19 domínios têm página; as rotas ficam em `src/routes/AppRoutes.tsx`      |
| `src/services/`    | `src/features/*/<domínio>.service.ts` e `src/lib/shared/http/`                       | Um serviço por recurso, mais o cliente HTTP único                         |
| `src/types/`       | `src/features/*/<domínio>.d.ts` e `src/lib/shared/types/`                            | Tipos por domínio; não há `any` fora dos testes                           |
| `src/utils/`       | `src/lib/utils/` e `src/lib/shared/validation/`                                      | Validação, normalização e sanitização                                     |

## Por que essa escolha

- **Coesão por domínio.** Uma mudança em "projetos" ou "propostas" quase sempre toca a página, o serviço, o tipo e o teste do mesmo domínio. Com tudo na mesma pasta, a mudança fica em um só lugar e a revisão do PR é mais simples.
- **Escala.** São 24 domínios, 165 arquivos de teste e 86 stories. Pastas globais com um arquivo por tipo (`components/`, `pages/`, `services/`) ficariam com centenas de arquivos misturando assuntos sem relação.
- **Donos claros.** O trabalho no Jira e os `CODEOWNERS` seguem os domínios, então cada pessoa encontra e revisa a sua área sem percorrer o projeto inteiro.
- **Reuso explícito.** O que serve a mais de um domínio sobe para `src/lib/`, e o que é de um domínio fica dentro dele. Isso evita componente "genérico" que na verdade só atende uma tela.
- **Remoção e teste locais.** Remover ou testar um domínio exige mexer em uma pasta.

## A convenção de `index.tsx`

Os componentes e as páginas usam o nome do próprio componente no arquivo (`Select.tsx`, `ProjectsPage.tsx`) e não `index.tsx`. Os motivos são práticos: várias abas abertas com o mesmo nome `index.tsx` são difíceis de distinguir no editor, os nomes aparecem de forma legível nos erros e nos testes, e o teste e a story do componente ficam ao lado dele com o mesmo prefixo (`Select.test.tsx`, `Select.stories.tsx`). Os imports usam o alias `@/` e não dependem do nome do arquivo de entrada.

## O que a convenção do enunciado quer garantir e como é atendido

- **Responsabilidade única.** Componentes de apresentação ficam em `components/`, páginas só compõem componentes e chamam serviços, e a lógica de acesso à API fica nos serviços.
- **Comunicação com a API isolada.** Nenhum componente chama a API diretamente: tudo passa por `*.service.ts` e pelo cliente HTTP único em `src/lib/shared/http/`. A consulta de CEP, que era a exceção, foi movida para `src/features/companies/company.postal.service.ts`.
- **Tipos separados do código visual.** Cada domínio tem o seu arquivo `.d.ts`, e os tipos comuns ficam em `src/lib/shared/types/`.
- **TypeScript estrito nos tipos.** Não há `any` fora dos testes.

## Limites conhecidos

- Cerca de 15 arquivos de `src/lib/` importam tipos de `src/features/`. A regra desejada é que `lib` não dependa de `features`; esses imports são tipos de mensagens, usuários e permissões e convém movê-los para `src/lib/shared/types/` quando houver oportunidade.
- Quem espera os caminhos literais `src/components`, `src/pages`, `src/services` e `src/types` precisa consultar a tabela acima para localizar cada coisa.
- Se a avaliação exigir os caminhos literais, a migração é mecânica e pode ser feita em etapas sem mudar comportamento: mover `src/lib/components` para `src/components`, reexportar os componentes pelo caminho antigo durante a transição e só depois ajustar os imports.

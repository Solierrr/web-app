<p align="center">
  <img src="../assets/readme/banners/react.png" alt="React" width="100%">
</p>

# Execução local

Use Node.js 22, a versão do Dockerfile, npm e `make`. O guia comum está em [TYPESCRIPT.md](https://github.com/Solierrr/docs-warehouse/blob/main/readme/running/TYPESCRIPT.md).

Execute `make install`, `make vault` e `make dev`. As variáveis são exportadas de `/vite` e `/service-urls`. As variáveis `VITE_*` entram no bundle, portanto não devem conter segredos de serviço. A stack de banco e APIs pode ser iniciada pelo `database-console` ao lado do repositório.

| Comando | Efeito |
|---|---|
| `make test` | Vitest |
| `make lint` | ESLint |
| `make build` | TypeScript e Vite |
| `npm run storybook` | Catálogo local na porta 6006 |
| `npm run test:storybook` | Testes de histórias com navegador |

Os modos locais de dados dependem do ambiente Vite e das variáveis de mock. A produção desativa esses modos. Valide login, carregamento do contexto e uma operação da área escolhida com as APIs configuradas. Erros de CORS, endereço ausente e permissões da conta devem ser conferidos no serviço correspondente.

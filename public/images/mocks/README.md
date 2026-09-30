# Mock image library

Coloque aqui as imagens usadas pelos dados e telas de demonstração. Os arquivos são locais para manter a interface previsível durante o desenvolvimento e não exigem chamadas externas em tempo de execução.

## Arquivos esperados

Cada classe reserva oito arquivos numerados de `01` a `08`. Use `.jpg` e mantenha estes nomes para que as referências locais continuem válidas.

| Classe | Caminho e padrão de nome | Proporção sugerida | Direção visual |
| --- | --- | --- | --- |
| Logos de empresas | `companies/logos/company-01.jpg` … `company-08.jpg` | 1:1 | Marcas ou imagens simples ligadas a energia e negócios |
| Banners de empresas | `companies/banners/company-01.jpg` … `company-08.jpg` | 16:6 | Instalações solares, equipes e projetos comerciais |
| Avatares de usuários | `users/avatars/user-01.jpg` … `user-08.jpg` | 1:1 | Misture frutas e animais; sem retratos de pessoas |
| Banners de usuários | `users/banners/user-01.jpg` … `user-08.jpg` | 16:6 | Imagens neutras e agradáveis para cabeçalho de perfil |
| Avatares de profissionais | `professionals/avatars/professional-01.jpg` … `professional-08.jpg` | 1:1 | Misture frutas e animais; sem retratos de pessoas |
| Fotos de painéis solares | `solar-panels/panel-01.jpg` … `panel-08.jpg` | 4:3 | Painéis, inversores e instalações fotovoltaicas |

## Créditos e origem

Registre para cada arquivo a URL da página da foto e o nome do fotógrafo antes de compartilhar ou publicar estes mocks. Preencha a tabela abaixo conforme adicionar imagens.

| Arquivo | Página da foto / origem | Fotógrafo | Observações |
| --- | --- | --- | --- |
|  |  |  |  |

Os cartões do feed de empresas já apontam para `companies/logos/company-01.jpg` e `company-01.jpg` em `companies/banners/`, com números correspondentes às empresas mockadas. Até os arquivos existirem, a interface mostra um fallback visual.

# API da escola — Prisma ORM (aulas 1 a 4)

Alunos, disciplinas e cursos usam Prisma 7 com MySQL e o adapter
`@prisma/adapter-mariadb`. O fluxo é Controller → Service → Repository →
PrismaService → Prisma Client → adapter → MySQL. Professores continua em memória.

## Executar

1. Instale as dependências: `npm install`.
2. Copie `.env.example` para `.env` e configure `DB_*` e `DATABASE_URL` para o
   mesmo banco. Codifique caracteres especiais do usuário/senha na URL.
3. Inicie MySQL: `npm run db:up` (dispensável para um servidor já existente).
4. Para um banco novo, execute `npm run db:init`: cria o banco, aplica migrations
   e insere os alunos iniciais sem substituir registros existentes.
5. Inicie a API: `npm run start:dev`.

Neste ambiente a API usa `PORT=3006`: <http://localhost:3006/alunos>.
A porta 3000 pertence a outro projeto. O `.env` é ignorado pelo Git e o volume
Docker `mysql_data` mantém os dados ao executar `npm run db:down`.

`DATABASE_URL` configura a CLI; `DB_*` configura o adapter em runtime. O script
`db:init` verifica se ambos apontam para a mesma conexão. Os scripts requerem
Node.js 22.12+ ou 24+. O Prisma Client é gerado antes do build, start e testes;
os arquivos de `src/generated/prisma` são ignorados pelo Git e não devem ser editados.

## Migração do banco existente

A migração deste ambiente foi feita por introspecção (`prisma db pull`), revisão
SQL e registro de `0_init` como baseline. Os registros anteriores foram preservados.

- `0_init` descreve as tabelas alunos (incluindo email obrigatório) e disciplinas
  que já existiam na aula 3. Foi marcada como aplicada, sem executar seus CREATEs.
- `20261031000100_email_unico_cursos` cria a restrição de email único, cria cursos,
  preenche os cursos a partir dos alunos existentes e adiciona a chave estrangeira.
- Disciplinas já existia: faz parte da baseline e não é recriada na segunda migration.

Para outro banco existente, revise sua estrutura e seus dados antes de registrar
uma baseline. Se ele corresponder exatamente a `0_init`, execute
`npx prisma migrate resolve --applied 0_init` antes de `npm run db:init`.
Emails duplicados devem ser corrigidos antes da migration de unicidade; a migração
não apaga nem escolhe automaticamente registros para resolver duplicações.
Não execute reset para adaptar um banco com dados que precisa preservar.

As tabelas usam MySQL 8.4 com `utf8mb4_0900_ai_ci`, inclusive na baseline e na
chave estrangeira textual de cursos.

## Rotas de alunos

| Método | Rota          | Resultado                            |
| ------ | ------------- | ------------------------------------ |
| GET    | `/alunos`     | Array de alunos, filtrado e paginado |
| GET    | `/alunos/:id` | Aluno, ou 404                        |
| POST   | `/alunos`     | Aluno criado, 201                    |
| PUT    | `/alunos/:id` | Atualização completa, 200 ou 404     |
| PATCH  | `/alunos/:id` | Atualização parcial, 200 ou 404      |
| DELETE | `/alunos/:id` | 204 sem corpo, ou 404                |

Exemplo para POST e PUT:

```json
{
  "nome": "Maria",
  "email": "maria@example.com",
  "curso": "Engenharia de Software"
}
```

Nome e curso são strings não vazias de até 100 caracteres. Email é obrigatório,
válido, único e tem até 150 caracteres. Email duplicado retorna 409, incluindo em
PUT e PATCH. Valores nulos ou inválidos retornam 400. Campos extras são removidos
pela whitelist. IDs não inteiros retornam 400.

PATCH usa `PartialType`: pode receber apenas `{"curso":"ADS"}`, preservando os
demais campos. Um objeto vazio não modifica o aluno.

### Filtros e paginação

```text
GET /alunos?curso=ADS
GET /alunos?nome=Ana
GET /alunos?curso=ADS&nome=Ana&page=1&limit=10
```

`curso` filtra por igualdade e `nome` usa `contains`. Os filtros são combinados.
A ordenação é por ID crescente e a resposta continua sendo um array. Page padrão
é 1 e limit padrão é 10; page aceita inteiros de 1 a 1000000 e limit de 1 a 100.
Parâmetros inválidos retornam 400. Uma página sem resultados retorna `[]`.
A comparação de texto segue a collation do MySQL.

## Cursos e relacionamento

`GET /cursos` lista cursos com seus alunos usando `include` do Prisma.
Cada curso possui muitos alunos e cada aluno pertence a um curso. O model
`Curso` tem ID e nome único; a relação usa o campo existente `Aluno.curso`
referenciando `Curso.nome`, preservando o contrato HTTP e os dados anteriores.

Criar ou alterar o curso de um aluno conecta um curso existente ou cria um novo
com `connectOrCreate`. A foreign key impede alunos com curso inexistente. Excluir
um aluno mantém o curso, mesmo que ele fique sem alunos.

## Disciplinas

GET e POST em `/disciplinas`, e GET, PUT e DELETE em `/disciplinas/:id`.
POST retorna 201, GET/PUT retornam 200, DELETE retorna 204 sem corpo; IDs inexistentes
retornam 404. JSON para POST e PUT:

```json
{
  "nome": "Programação",
  "carga_horaria": 80
}
```

Os campos são obrigatórios. Nome é uma string não vazia de até 100 caracteres.
Carga horária é um inteiro positivo até 2147483647. Dados inválidos retornam 400.
No Prisma, o campo chama-se `cargaHoraria` com `@map("carga_horaria")`; a API
mantém `carga_horaria` para compatibilidade com a aula anterior.

## Comandos Prisma

| Comando                                            | Uso                                              |
| -------------------------------------------------- | ------------------------------------------------ |
| `npm run prisma:pull`                              | Introspecção: banco → schema                     |
| `npm run prisma:generate`                          | Gerar client após mudar o schema                 |
| `npm run prisma:status`                            | Conferir migrations aplicadas                    |
| `npm run prisma:migrate -- --name nome_da_mudanca` | Criar/aplicar migration em desenvolvimento       |
| `npm run prisma:deploy`                            | Aplicar migrations revisadas                     |
| `npm run prisma:seed`                              | Inserir dados iniciais sem substituir existentes |
| `npm run prisma:studio`                            | Abrir a interface visual do banco                |

Depois da baseline, evolua a estrutura por migrations. Revise o SQL antes de
aplicar mudanças. O Prisma Studio também permite editar dados.

## Testes

```sh
npm run build
npm run lint
npm test
npm run test:e2e
```

Os testes e2e precisam do MySQL e de credenciais com permissão de criar/excluir
bancos. Cada teste cria uma base `api_alunos_test_*`, aplica as migrations reais e
faz o seed. Somente essas bases temporárias são removidas; a base escola é preservada.
Os testes cobrem CRUD, validação, 404/204/409, PATCH, filtros, paginação, relações
entre cursos e alunos e persistência após reiniciar a aplicação.

Referências: [Prisma 7 com MySQL existente](https://www.prisma.io/docs/v7/prisma-orm/add-to-existing-project/mysql)
e [relações 1:N](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/one-to-many-relations).

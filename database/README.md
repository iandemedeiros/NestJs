# API da escola — Aula 2

Alunos usa o fluxo Controller → Service → Repository → DatabaseService → MySQL.
Professores mantém os dados em memória da aula 1.

## Preparação

1. Instale as dependências com `npm install`.
2. Copie `.env.example` para `.env` e configure a senha e os demais dados de conexão.
3. Execute `npm run db:up` para iniciar MySQL no Docker. Se já possui MySQL,
   configure o `.env` para esse servidor e pule este comando.
4. Execute `npm run db:init`: cria o banco configurado em `DB_NAME`, a tabela e
   os alunos iniciais. Também adiciona `email` a uma tabela antiga sem apagar dados.
5. Execute `npm run start:dev` e acesse `http://localhost:3000/alunos`.

Neste ambiente, o `.env` usa `PORT=3006` porque a porta 3000 já pertence a
outro projeto. A API está em `http://localhost:3006/alunos`.

O `.env` é ignorado pelo Git. O banco do Docker fica no volume `mysql_data`;
`npm run db:down` para o serviço preservando esse volume.
Os scripts usam Node.js com suporte a `process.loadEnvFile` (Node 22 ou superior).

## Rotas de alunos

| Método | Rota          | Resultado                                 |
| ------ | ------------- | ----------------------------------------- |
| GET    | `/alunos`     | Lista ordenada por ID                     |
| GET    | `/alunos/:id` | Aluno ou resposta vazia quando não existe |
| POST   | `/alunos`     | Aluno criado, HTTP 201                    |
| PUT    | `/alunos/:id` | Aluno atualizado ou resposta vazia        |
| DELETE | `/alunos/:id` | Quantidade de registros excluídos: 1 ou 0 |

Exemplo de JSON para POST e PUT:

```json
{
  "nome": "Maria",
  "email": "maria@example.com",
  "curso": "Engenharia de Software"
}
```

`email` aceita `null` ou pode ser omitido, conforme a coluna anulável do exercício.
IDs não inteiros retornam HTTP 400 via `ParseIntPipe`. DTOs, validação de corpo e
tratamento de 404 ficam para a próxima aula, conforme o material.

## Verificação

```sh
npm run build
npm run lint
npm test
npm run test:e2e
```

Os testes e2e precisam do MySQL disponível e das credenciais do `.env` com
permissão de criar e excluir bancos. Criam bases temporárias com o prefixo
`api_alunos_test_` e removem apenas essas bases. Verificam CRUD, email,
parâmetros SQL, IDs inválidos e persistência após reiniciar a aplicação.

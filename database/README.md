# API da escola — Aulas 2 e 3

Alunos e disciplinas usam DTOs, validação global e o fluxo
Controller → Service → Repository → DatabaseService → MySQL.
Professores mantém os dados em memória da aula 1.

## Preparação

1. Instale as dependências com `npm install`.
2. Copie `.env.example` para `.env` e configure a senha e os demais dados de conexão.
3. Execute `npm run db:up` para iniciar MySQL no Docker. Se já possui MySQL,
   configure o `.env` para esse servidor e pule este comando.
4. Execute `npm run db:init`: cria o banco configurado em `DB_NAME`, as tabelas e
   os alunos iniciais. Também atualiza `email` para `NOT NULL` sem apagar registros.
   Se uma base antiga contiver emails nulos, preencha esses valores antes de
   repetir o comando; o script informa a pendência e preserva os registros.
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
| GET    | `/alunos/:id` | Aluno, ou HTTP 404 quando não existe |
| POST   | `/alunos`     | Aluno criado, HTTP 201                    |
| PUT    | `/alunos/:id` | Atualização completa, ou HTTP 404 |
| PATCH  | `/alunos/:id` | Atualização parcial, ou HTTP 404 |
| DELETE | `/alunos/:id` | HTTP 204 sem corpo, ou HTTP 404 |

Exemplo de JSON para POST e PUT:

```json
{
  "nome": "Maria",
  "email": "maria@example.com",
  "curso": "Engenharia de Software"
}
```

POST e PUT exigem `nome`, `email` e `curso`. Nome e curso precisam ser strings
não vazias com até 100 caracteres. Email precisa ser válido, com até 150 caracteres.
Dados inválidos e campos obrigatórios ausentes retornam HTTP 400.

PATCH usa `PartialType` e permite enviar apenas os campos desejados, com as mesmas
regras; valores `null` são rejeitados. Exemplo: `{"curso":"ADS"}`. Campos omitidos
são preservados. Um PATCH vazio retorna o aluno sem alterar seus dados.

A validação global usa `whitelist: true` e `transform: true`: campos extras são
removidos. IDs não inteiros retornam HTTP 400 via `ParseIntPipe`.

## Disciplinas

Disponíveis GET e POST em `/disciplinas`, e GET, PUT e DELETE em `/disciplinas/:id`.
POST retorna 201, GET e PUT retornam 200, e DELETE retorna 204 sem corpo.
Disciplinas inexistentes retornam 404 e dados inválidos retornam 400.

JSON para POST e PUT:

```json
{
  "nome": "Programação",
  "carga_horaria": 80
}
```

Ambos os campos são obrigatórios. Nome deve ser texto não vazio com até 100
caracteres. Carga horária deve ser um inteiro positivo até 2147483647 (limite
da coluna INT); strings como `"80"` são rejeitadas.

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
parâmetros SQL, validação, PATCH, códigos HTTP e persistência após reiniciar a aplicação.

Referência do exercício de PATCH: [PartialType na documentação do NestJS](https://docs.nestjs.com/application/validation).

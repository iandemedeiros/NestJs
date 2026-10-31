import { PrismaClient } from '../src/generated/prisma/client.js';

export async function seedData(prisma: PrismaClient) {
  const alunos = [
    { nome: 'Ana', email: 'ana@example.com', curso: 'Sistemas de Informação' },
    {
      nome: 'Carlos',
      email: 'carlos@example.com',
      curso: 'Ciência da Computação',
    },
  ];
  for (const aluno of alunos) {
    await prisma.aluno.upsert({
      where: { email: aluno.email },
      update: {},
      create: {
        nome: aluno.nome,
        email: aluno.email,
        cursoDetalhes: {
          connectOrCreate: {
            where: { nome: aluno.curso },
            create: { nome: aluno.curso },
          },
        },
      },
    });
  }
}

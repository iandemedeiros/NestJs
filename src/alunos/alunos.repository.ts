import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ListAlunosDto } from './dto/list-alunos.dto.js';

type AlunoChanges = { nome?: string; email?: string; curso?: string };

@Injectable()
export class AlunosRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: ListAlunosDto) {
    return this.prisma.aluno.findMany({
      where: {
        curso: query.curso,
        nome: query.nome === undefined ? undefined : { contains: query.nome },
      },
      orderBy: { id: 'asc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
  }

  findById(id: number) {
    return this.prisma.aluno.findUnique({ where: { id } });
  }

  create(nome: string, email: string, curso: string) {
    return this.prisma.aluno.create({
      data: {
        nome,
        email,
        cursoDetalhes: {
          connectOrCreate: { where: { nome: curso }, create: { nome: curso } },
        },
      },
    });
  }

  update(id: number, nome: string, email: string, curso: string) {
    return this.patch(id, { nome, email, curso });
  }

  patch(id: number, data: AlunoChanges) {
    return this.prisma.aluno.update({
      where: { id },
      data: {
        nome: data.nome,
        email: data.email,
        cursoDetalhes:
          data.curso === undefined
            ? undefined
            : {
                connectOrCreate: {
                  where: { nome: data.curso },
                  create: { nome: data.curso },
                },
              },
      },
    });
  }

  async delete(id: number) {
    await this.prisma.aluno.delete({ where: { id } });
    return 1;
  }
}

import { Injectable } from '@nestjs/common';
import { Disciplina } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

// Mantém o contrato HTTP carga_horaria, enquanto o model usa cargaHoraria.
function toResponse(disciplina: Disciplina) {
  return {
    id: disciplina.id,
    nome: disciplina.nome,
    carga_horaria: disciplina.cargaHoraria,
  };
}

@Injectable()
export class DisciplinasRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return (
      await this.prisma.disciplina.findMany({ orderBy: { id: 'asc' } })
    ).map(toResponse);
  }

  async findById(id: number) {
    const disciplina = await this.prisma.disciplina.findUnique({
      where: { id },
    });
    return disciplina ? toResponse(disciplina) : null;
  }

  async create(nome: string, carga_horaria: number) {
    return toResponse(
      await this.prisma.disciplina.create({
        data: { nome, cargaHoraria: carga_horaria },
      }),
    );
  }

  async update(id: number, nome: string, carga_horaria: number) {
    return toResponse(
      await this.prisma.disciplina.update({
        where: { id },
        data: { nome, cargaHoraria: carga_horaria },
      }),
    );
  }

  async delete(id: number) {
    await this.prisma.disciplina.delete({ where: { id } });
    return 1;
  }
}

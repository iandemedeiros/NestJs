import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CursosRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.curso.findMany({
      orderBy: { id: 'asc' },
      include: { alunos: { orderBy: { id: 'asc' } } },
    });
  }
}

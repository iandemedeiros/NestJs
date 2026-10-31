import { Module } from '@nestjs/common';
import { AlunosController } from './alunos.controller.js';
import { AlunosService } from './alunos.service.js';
import { AlunosRepository } from './alunos.repository.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [AlunosController],
  providers: [AlunosService, AlunosRepository],
})
export class AlunosModule {}

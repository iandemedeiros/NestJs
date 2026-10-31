import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { DisciplinasController } from './disciplinas.controller.js';
import { DisciplinasRepository } from './disciplinas.repository.js';
import { DisciplinasService } from './disciplinas.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [DisciplinasController],
  providers: [DisciplinasService, DisciplinasRepository],
})
export class DisciplinasModule {}

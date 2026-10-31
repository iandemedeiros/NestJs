import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { CursosController } from './cursos.controller.js';
import { CursosRepository } from './cursos.repository.js';
import { CursosService } from './cursos.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [CursosController],
  providers: [CursosService, CursosRepository],
})
export class CursosModule {}

import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { DisciplinasController } from './disciplinas.controller.js';
import { DisciplinasRepository } from './disciplinas.repository.js';
import { DisciplinasService } from './disciplinas.service.js';

@Module({
  imports: [DatabaseModule],
  controllers: [DisciplinasController],
  providers: [DisciplinasService, DisciplinasRepository],
})
export class DisciplinasModule {}

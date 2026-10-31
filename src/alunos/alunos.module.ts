import { Module } from '@nestjs/common';
import { AlunosController } from './alunos.controller.js';
import { AlunosService } from './alunos.service.js';
import { AlunosRepository } from './alunos.repository.js';
import { DatabaseModule } from '../database/database.module.js';

@Module({
  imports: [DatabaseModule],
  controllers: [AlunosController],
  providers: [AlunosService, AlunosRepository],
})
export class AlunosModule {}

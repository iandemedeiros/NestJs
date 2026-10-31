import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AlunosModule } from './alunos/alunos.module.js';
import { ProfessoresModule } from './professores/professores.module.js';
import { DisciplinasModule } from './disciplinas/disciplinas.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AlunosModule,
    ProfessoresModule,
    DisciplinasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

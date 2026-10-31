import { Module } from '@nestjs/common';
import { ProfessoresController } from './professores.controller.js';
import { ProfessoresService } from './professores.service.js';

@Module({
  controllers: [ProfessoresController],
  providers: [ProfessoresService],
})
export class ProfessoresModule {}

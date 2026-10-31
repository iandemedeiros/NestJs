import { Controller, Get } from '@nestjs/common';
import { CursosService } from './cursos.service.js';

@Controller('cursos')
export class CursosController {
  constructor(private readonly service: CursosService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }
}

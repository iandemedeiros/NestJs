import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ProfessoresService } from './professores.service.js';

@Controller('professores')
export class ProfessoresController {
  constructor(private readonly service: ProfessoresService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }

  @Post()
  create(@Body() body: { nome: string; disciplina: string }) {
    return this.service.create(body.nome, body.disciplina);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { nome: string; disciplina: string },
  ) {
    return this.service.update(id, body.nome, body.disciplina);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}

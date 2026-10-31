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
import { AlunosService } from './alunos.service.js';

@Controller('alunos')
export class AlunosController {
  constructor(private readonly service: AlunosService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }

  @Post()
  create(@Body() body: { nome: string; curso: string }) {
    return this.service.create(body.nome, body.curso);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { nome: string; curso: string },
  ) {
    return this.service.update(id, body.nome, body.curso);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}

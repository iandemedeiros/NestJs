import { Injectable, NotFoundException } from '@nestjs/common';
import { DisciplinasRepository } from './disciplinas.repository.js';
import { CreateDisciplinaDto } from './dto/create-disciplina.dto.js';
import { UpdateDisciplinaDto } from './dto/update-disciplina.dto.js';

@Injectable()
export class DisciplinasService {
  constructor(private readonly disciplinasRepository: DisciplinasRepository) {}

  findAll() {
    return this.disciplinasRepository.findAll();
  }

  async findById(id: number) {
    const disciplina = await this.disciplinasRepository.findById(id);
    if (!disciplina) {
      throw new NotFoundException('Disciplina não encontrada');
    }
    return disciplina;
  }

  create(data: CreateDisciplinaDto) {
    return this.disciplinasRepository.create(data.nome, data.carga_horaria);
  }

  async update(id: number, data: UpdateDisciplinaDto) {
    await this.findById(id);
    await this.disciplinasRepository.update(id, data.nome, data.carga_horaria);
    return this.findById(id);
  }

  async delete(id: number) {
    await this.findById(id);
    const deleted = await this.disciplinasRepository.delete(id);
    if (deleted === 0) {
      throw new NotFoundException('Disciplina não encontrada');
    }
  }
}

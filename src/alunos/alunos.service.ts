import { Injectable, NotFoundException } from '@nestjs/common';
import { AlunosRepository } from './alunos.repository.js';
import { CreateAlunoDto } from './dto/create-aluno.dto.js';
import { UpdateAlunoDto } from './dto/update-aluno.dto.js';
import { PatchAlunoDto } from './dto/patch-aluno.dto.js';

@Injectable()
export class AlunosService {
  constructor(private readonly alunosRepository: AlunosRepository) {}

  findAll() {
    return this.alunosRepository.findAll();
  }

  async findById(id: number) {
    const aluno = await this.alunosRepository.findById(id);
    if (!aluno) {
      throw new NotFoundException('Aluno não encontrado');
    }
    return aluno;
  }

  create(data: CreateAlunoDto) {
    return this.alunosRepository.create(data.nome, data.email, data.curso);
  }

  async update(id: number, data: UpdateAlunoDto) {
    await this.findById(id);
    await this.alunosRepository.update(id, data.nome, data.email, data.curso);
    return this.findById(id);
  }

  async patch(id: number, data: PatchAlunoDto) {
    await this.findById(id);
    await this.alunosRepository.patch(id, data);
    return this.findById(id);
  }

  async delete(id: number) {
    await this.findById(id);
    const deleted = await this.alunosRepository.delete(id);
    if (deleted === 0) {
      throw new NotFoundException('Aluno não encontrado');
    }
  }
}

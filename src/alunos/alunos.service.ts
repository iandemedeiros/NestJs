import { Injectable } from '@nestjs/common';

@Injectable()
export class AlunosService {
  private alunos = [
    {
      id: 1,
      nome: 'Ana',
      curso: 'Sistemas de Informação',
    },
    {
      id: 2,
      nome: 'Carlos',
      curso: 'Ciência da Computação',
    },
  ];
  private nextId = 3;

  findAll() {
    return this.alunos;
  }

  findById(id: number) {
    return this.alunos.find((item) => item.id === id);
  }

  create(nome: string, curso: string) {
    const item = { id: this.nextId++, nome, curso };
    this.alunos.push(item);
    return item;
  }

  update(id: number, nome: string, curso: string) {
    const item = this.findById(id);
    if (!item) {
      return null;
    }
    item.nome = nome;
    item.curso = curso;
    return item;
  }

  delete(id: number) {
    const index = this.alunos.findIndex((item) => item.id === id);
    if (index === -1) {
      return false;
    }
    this.alunos.splice(index, 1);
    return true;
  }
}

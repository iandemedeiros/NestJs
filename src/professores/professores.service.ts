import { Injectable } from '@nestjs/common';

@Injectable()
export class ProfessoresService {
  private professores = [
    {
      id: 1,
      nome: 'Marcos',
      disciplina: 'Programação',
    },
    {
      id: 2,
      nome: 'Juliana',
      disciplina: 'Banco de Dados',
    },
  ];
  private nextId = 3;

  findAll() {
    return this.professores;
  }

  findById(id: number) {
    return this.professores.find((item) => item.id === id);
  }

  create(nome: string, disciplina: string) {
    const item = { id: this.nextId++, nome, disciplina };
    this.professores.push(item);
    return item;
  }

  update(id: number, nome: string, disciplina: string) {
    const item = this.findById(id);
    if (!item) {
      return null;
    }
    item.nome = nome;
    item.disciplina = disciplina;
    return item;
  }

  delete(id: number) {
    const index = this.professores.findIndex((item) => item.id === id);
    if (index === -1) {
      return false;
    }
    this.professores.splice(index, 1);
    return true;
  }
}

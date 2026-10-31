import { Injectable } from '@nestjs/common';
import { CursosRepository } from './cursos.repository.js';

@Injectable()
export class CursosService {
  constructor(private readonly repository: CursosRepository) {}

  findAll() {
    return this.repository.findAll();
  }
}

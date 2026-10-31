import { Injectable } from '@nestjs/common';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { DatabaseService } from '../database/database.service.js';

export interface DisciplinaRow extends RowDataPacket {
  id: number;
  nome: string;
  carga_horaria: number;
}

@Injectable()
export class DisciplinasRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll() {
    const [rows] = await this.databaseService.execute<DisciplinaRow[]>(
      'SELECT id, nome, carga_horaria FROM disciplinas ORDER BY id',
    );
    return rows;
  }

  async findById(id: number) {
    const [rows] = await this.databaseService.execute<DisciplinaRow[]>(
      'SELECT id, nome, carga_horaria FROM disciplinas WHERE id = ?',
      [id],
    );
    return rows[0] ?? null;
  }

  async create(nome: string, carga_horaria: number) {
    const [result] = await this.databaseService.execute<ResultSetHeader>(
      'INSERT INTO disciplinas (nome, carga_horaria) VALUES (?, ?)',
      [nome, carga_horaria],
    );
    return { id: result.insertId, nome, carga_horaria };
  }

  async update(id: number, nome: string, carga_horaria: number) {
    const [result] = await this.databaseService.execute<ResultSetHeader>(
      'UPDATE disciplinas SET nome = ?, carga_horaria = ? WHERE id = ?',
      [nome, carga_horaria, id],
    );
    return result.affectedRows;
  }

  async delete(id: number) {
    const [result] = await this.databaseService.execute<ResultSetHeader>(
      'DELETE FROM disciplinas WHERE id = ?',
      [id],
    );
    return result.affectedRows;
  }
}

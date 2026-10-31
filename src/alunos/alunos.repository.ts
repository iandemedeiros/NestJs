import { Injectable } from '@nestjs/common';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { DatabaseService } from '../database/database.service.js';

export interface AlunoRow extends RowDataPacket {
  id: number;
  nome: string;
  email: string;
  curso: string;
}

@Injectable()
export class AlunosRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll() {
    const [rows] = await this.databaseService.execute<AlunoRow[]>(
      'SELECT id, nome, email, curso FROM alunos ORDER BY id',
    );
    return rows;
  }

  async findById(id: number) {
    const [rows] = await this.databaseService.execute<AlunoRow[]>(
      'SELECT id, nome, email, curso FROM alunos WHERE id = ?',
      [id],
    );
    return rows[0] ?? null;
  }

  async create(nome: string, email: string, curso: string) {
    const [result] = await this.databaseService.execute<ResultSetHeader>(
      'INSERT INTO alunos (nome, email, curso) VALUES (?, ?, ?)',
      [nome, email, curso],
    );
    return { id: result.insertId, nome, email, curso };
  }

  async update(id: number, nome: string, email: string, curso: string) {
    const [result] = await this.databaseService.execute<ResultSetHeader>(
      'UPDATE alunos SET nome = ?, email = ?, curso = ? WHERE id = ?',
      [nome, email, curso, id],
    );
    return result.affectedRows;
  }

  async patch(
    id: number,
    data: Partial<Pick<AlunoRow, 'nome' | 'email' | 'curso'>>,
  ) {
    const fields = (['nome', 'email', 'curso'] as const).filter(
      (field) => data[field] !== undefined,
    );
    if (fields.length === 0) return 0;
    // Nomes de colunas vêm apenas da lista fixa; valores usam parâmetros.
    const assignments = fields.map((field) => `${field} = ?`).join(', ');
    const values = fields.map((field) => data[field]!);
    const [result] = await this.databaseService.execute<ResultSetHeader>(
      `UPDATE alunos SET ${assignments} WHERE id = ?`,
      [...values, id],
    );
    return result.affectedRows;
  }

  async delete(id: number) {
    const [result] = await this.databaseService.execute<ResultSetHeader>(
      'DELETE FROM alunos WHERE id = ?',
      [id],
    );
    return result.affectedRows;
  }
}

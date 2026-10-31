import { PartialType } from '@nestjs/mapped-types';
import { CreateAlunoDto } from './create-aluno.dto.js';

export class PatchAlunoDto extends PartialType(CreateAlunoDto, {
  skipNullProperties: false,
}) {}

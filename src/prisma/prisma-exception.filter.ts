import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '../generated/prisma/client.js';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const errors: Record<
      string,
      { statusCode: number; error: string; message: string }
    > = {
      P2002: {
        statusCode: 409,
        error: 'Conflict',
        message: 'Já existe um registro com esse valor único',
      },
      P2025: {
        statusCode: 404,
        error: 'Not Found',
        message: 'Registro não encontrado',
      },
      P2003: {
        statusCode: 409,
        error: 'Conflict',
        message: 'A operação viola um relacionamento entre registros',
      },
    };
    const body = errors[exception.code] ?? {
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Erro interno do servidor',
    };
    response.status(body.statusCode).json(body);
  }
}

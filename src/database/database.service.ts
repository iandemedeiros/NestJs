import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createPool,
  Pool,
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2/promise';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly pool: Pool;

  constructor(configService: ConfigService) {
    this.pool = createPool({
      host: configService.getOrThrow<string>('DB_HOST'),
      port: Number(configService.getOrThrow<string>('DB_PORT')),
      user: configService.getOrThrow<string>('DB_USER'),
      password: configService.getOrThrow<string>('DB_PASSWORD'),
      database: configService.getOrThrow<string>('DB_NAME'),
      charset: 'utf8mb4',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }

  execute<T extends RowDataPacket[] | ResultSetHeader>(
    sql: string,
    values: (string | number | null)[] = [],
  ) {
    return this.pool.execute<T>(sql, values);
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}

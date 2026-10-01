import {
  Global,
  Inject,
  Injectable,
  Logger,
  Module,
  OnApplicationShutdown,
} from '@nestjs/common';

import knex, { type Knex } from 'knex';

import { knexConfig } from './knex.config.js';
import { KNEX_CONNECTION } from './knex.constants.js';

@Injectable()
class DatabaseShutdownService implements OnApplicationShutdown {
  constructor(
    @Inject(KNEX_CONNECTION)
    private readonly db: Knex,
  ) {}

  async onApplicationShutdown(): Promise<void> {
    await this.db.destroy();

    Logger.log('Knex MySQL connection pool closed');
  }
}

@Global()
@Module({
  providers: [
    {
      provide: KNEX_CONNECTION,
      useFactory: (): Knex => {
        const db = knex(knexConfig);

        Logger.log('Knex MySQL connection pool initialized');

        return db;
      },
    },
    DatabaseShutdownService,
  ],
  exports: [KNEX_CONNECTION],
})
export class DatabaseModule {}
import 'dotenv/config';
import { Knex } from 'knex';

export const knexConfig: Knex.Config = {
  client: 'mysql2',

  connection: {
    host: process.env.DB_HOST || '192.168.0.148',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'srsnova',
    database: process.env.DB_NAME || 'srspos_compal_test',
  },

  pool: {
    min: 2,
    max: 10,
  },
};
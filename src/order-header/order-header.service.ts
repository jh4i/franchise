import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';

import { KNEX_CONNECTION } from '../database/knex.constants.js';

@Injectable()
export class OrderHeaderService {
  constructor(
    @Inject(KNEX_CONNECTION)
    private readonly db: Knex,
  ) {}

  async findById(id: number) {
    return this.db('order_header_franchisee')
      .where('id', id)
      .first();
  }
}
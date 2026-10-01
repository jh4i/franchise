import {
  Inject,
  Injectable,
} from '@nestjs/common';

import type { Knex } from 'knex';

import { KNEX_CONNECTION } from '../database/knex.constants.js';

@Injectable()
export class OrderDetailsService {

  constructor(
    @Inject(KNEX_CONNECTION)
    private readonly db: Knex,
  ) {}

  async findByOrderId(orderId: number) {

    return this.db('order_details_franchisee')
      .select('*')
      .where('order_id', orderId);
  }
}

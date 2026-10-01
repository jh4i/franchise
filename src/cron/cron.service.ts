import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import type { Knex } from 'knex';

import { KNEX_CONNECTION } from '../database/knex.constants.js';
import { OrderTransferService } from '../order-transfer/order-transfer.service.js';

interface OrderHeader {
  id: number;
  order_id: number;
  order_date?: string;
  customer_code?: string;
  customer_name?: string;
  total_sales?: number;
  with_shipping_fee?: number;
  picker_name?: string | null;
  no_of_parcels?: number | null;
}

interface OrderDetail {
  id: number;
  order_id: number;
  barcode?: string;
  description?: string;
  qty?: number;
  srp?: number;
  subtotal?: number;
}

@Injectable()
export class CronService {
  private lastProcessedHeaderId = 0;

  constructor(
    @Inject(KNEX_CONNECTION)
    private readonly db: Knex,
    private readonly orderTransferService: OrderTransferService,
  ) {}

  // Runs every 1 minute and processes only one order.
  @Cron('* * * * *')
  async processOrders(): Promise<void> {
    const currentLastProcessedId =
      this.lastProcessedHeaderId;

    const trx = await this.db.transaction();

    try {
      // 1. Find one order that has not yet been transferred
      let orderHeaders: OrderHeader[];

      try {
        orderHeaders = await trx<OrderHeader>(
          'order_header_franchisee',
        )
          .select([
            'id',
            'order_id',
            'order_date',
            'customer_code',
            'customer_name',
            'total_sales',
            'with_shipping_fee',
            'picker_name',
            'no_of_parcels',
          ])
          .whereNotExists(
            this.orderTransferService
              .transferHeaderQuery(trx)
              .whereRaw(
                '?? = ??',
                [
                  '0_transfer_header.source_order_header_id',
                  'order_header_franchisee.id',
                ],
              ),
          )
          .orderByRaw(
            'CASE WHEN ?? > ? THEN 0 ELSE 1 END',
            [
              'order_header_franchisee.id',
              currentLastProcessedId,
            ],
          )
          .orderBy(
            'order_header_franchisee.id',
            'asc',
          )
          .limit(1);
      } catch (error) {
        throw new Error(
          'Failed to select order headers.',
          { cause: error },
        );
      }

      console.log(
        `Found ${orderHeaders.length} order header(s)`,
      );

      // 2. Stop if there are no orders
      if (orderHeaders.length === 0) {
        await trx.commit();

        console.log('No new orders found.');

        return;
      }

      const orderHeader = orderHeaders[0];

      console.log('ORDER HEADER FROM DATABASE:');
      console.table([orderHeader]);

      // 3. Get order details
      let orderDetails: OrderDetail[];

      try {
        orderDetails = await trx<OrderDetail>(
          'order_details_franchisee',
        )
          .select([
            'id',
            'order_id',
            'barcode',
            'description',
            'qty',
            'srp',
            'subtotal',
          ])
          .where(
            'order_id',
            orderHeader.order_id,
          );
      } catch (error) {
        throw new Error(
          'Failed to select order details.',
          { cause: error },
        );
      }

      console.log(
        `Found ${orderDetails.length} order detail(s)`,
      );

      // 4. Get today's date
      const today = new Date()
        .toISOString()
        .split('T')[0];

      // 5. Prepare header only for logging
      const headerTr =
        this.orderTransferService.prepareTransferHeader(
          orderHeader,
          today,
        );

      console.log('TRANSFER HEADER:');
      console.table([headerTr]);

      // 6. Transfer the order
      const transferId =
        await this.orderTransferService.transferOrder(
          trx,
          orderHeader,
          orderDetails,
          today,
        );

      console.log(
        `Inserted transfer header ID: ${transferId}`,
      );

      // 7. Prepare details only for logging
      const detailTr =
        this.orderTransferService.prepareTransferDetails(
          transferId,
          orderDetails,
        );

      console.log('TRANSFER DETAILS:');
      console.table(detailTr);

      // 8. Commit everything
      await trx.commit();

      // 9. Only update this after successful commit
      this.lastProcessedHeaderId =
        orderHeader.id;

      console.log(
        `Processed header ID: ${this.lastProcessedHeaderId}`,
      );

      console.log('COMMIT SUCCESS');
    } catch (error) {
      // 10. Roll back everything if any step fails
      await trx.rollback();

      console.error(
        'ROLLBACK - Error while processing orders',
        error,
      );

      throw new Error(
        'Failed to process orders.',
        { cause: error },
      );
    }
  }
}
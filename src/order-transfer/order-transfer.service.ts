import { Injectable } from '@nestjs/common';
import type { Knex } from 'knex';

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
export class OrderTransferService {
  prepareTransferHeader(orderHeader: OrderHeader, today: string) {
    const branchCodeIn = process.env.BRANCH_USE?.trim() || null;
    const localBranch = process.env.LOCAL_BRANCH?.trim() || null;

    return {
      date_created: today,
      delivery_date: orderHeader.order_date,
      br_code_out: 'srsn',
      aria_type_out: '70',
      aria_trans_no_out: orderHeader.id,
      source_order_header_id: orderHeader.id,
      name_out: 'NOVALICHES',
      m_code_out: 'STO',
      m_id_out: orderHeader.order_id,
      m_no_out: orderHeader.order_id,
      transfer_out_date: today,
      br_code_in: branchCodeIn,
      memo_: localBranch,
      aria_type_in: '0',
      m_code_in: 'STI',
      picker_name: orderHeader.picker_name,
      no_of_parcels: orderHeader.no_of_parcels,
      status: 1,
      
    };
  }

  prepareTransferDetails(
    transferId: number,
    orderDetails: OrderDetail[],
  ) {
    return orderDetails.map((orderDetail) => ({
      transfer_id: transferId,
      source_order_detail_id: orderDetail.id,
      description: orderDetail.description,
      barcode: orderDetail.barcode,
      cost: orderDetail.srp,
      qty_out: orderDetail.qty,
      actual_qty_out: orderDetail.qty,
      status: 1,
    }));
  }

  transferHeaderQuery(trx: Knex.Transaction) {
    return trx('0_transfer_header')
      .withSchema(this.transferDatabaseName())
      .select('id');
  }

  async transferOrder(
    trx: Knex.Transaction,
    orderHeader: OrderHeader,
    orderDetails: OrderDetail[],
    today: string,
  ): Promise<number> {
    const transferHeader = this.prepareTransferHeader(
      orderHeader,
      today,
    );

    const insertResult = await this.runDatabaseOperation(
      () =>
        trx('0_transfer_header')
          .withSchema(this.transferDatabaseName())
          .insert(transferHeader),
      'Failed to insert transfer header.',
    );
    const transferId = Number(
      Array.isArray(insertResult) ? insertResult[0] : insertResult,
    );

    if (!Number.isInteger(transferId) || transferId < 1) {
      throw new Error('Transfer header insert did not return a valid ID.');
    }

    const transferDetails = this.prepareTransferDetails(
      transferId,
      orderDetails,
    );

    if (transferDetails.length > 0) {
      await this.runDatabaseOperation(
        () =>
          trx('0_transfer_details')
            .withSchema(this.transferDatabaseName())
            .insert(transferDetails),
        'Failed to insert transfer details.',
      );

      const updatedDetails = await this.runDatabaseOperation(
        () =>
          trx('order_details_franchisee')
            .whereIn(
              'id',
              orderDetails.map((orderDetail) => orderDetail.id),
            )
            .update({ transferstatus: 1 }),
        'Failed to update order detail transfer status.',
      );

      if (Number(updatedDetails) !== orderDetails.length) {
        throw new Error(
          'Order detail transfer status update did not update every detail.',
        );
      }
    }

    const updatedHeaders = await this.runDatabaseOperation(
      () =>
        trx('order_header_franchisee')
          .where('id', orderHeader.id)
          .update({ transferstatus: 1 }),
      'Failed to update order header transfer status.',
    );

    if (Number(updatedHeaders) !== 1) {
      throw new Error(
        'Order header transfer status update did not update one header.',
      );
    }

    return transferId;
  }

  private transferDatabaseName(): string {
    return process.env.TRANSFER_DB_NAME ?? 'transfer_compal_test';
  }

  private async runDatabaseOperation<T>(
    operation: () => PromiseLike<T>,
    errorMessage: string,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      throw new Error(errorMessage, { cause: error });
    }
  }
}
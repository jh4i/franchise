import type { Knex } from 'knex';
import { OrderTransferService } from './order-transfer.service.js';

describe('OrderTransferService', () => {
  it('links inserted transfer details to the generated header ID', async () => {
    const service = new OrderTransferService();
    vi.stubEnv('BRANCH_USE', '');
    vi.stubEnv('LOCAL_BRANCH', '');
    const orderHeader = {
      id: 5,
      order_id: 300,
      picker_name: 'Picker A',
      no_of_parcels: 2,
    };
    const orderDetails = [
      { id: 21, order_id: 300, description: 'Item A', qty: 2, srp: 10 },
      { id: 22, order_id: 300, description: 'Item B', qty: 1, srp: 20 },
    ];
    const insertHeader = vi.fn().mockResolvedValue([1]);
    const insertDetails = vi.fn().mockResolvedValue([1, 2]);
    const updateDetails = vi.fn().mockResolvedValue(2);
    const updateHeader = vi.fn().mockResolvedValue(1);
    const transaction = vi.fn((table: string) => {
      if (table === '0_transfer_header') {
        return {
          withSchema: vi.fn().mockReturnValue({ insert: insertHeader }),
        };
      }
      if (table === '0_transfer_details') {
        return {
          withSchema: vi.fn().mockReturnValue({ insert: insertDetails }),
        };
      }
      if (table === 'order_details_franchisee') {
        return {
          whereIn: vi.fn().mockReturnValue({ update: updateDetails }),
        };
      }
      return {
        where: vi.fn().mockReturnValue({ update: updateHeader }),
      };
    }) as unknown as Knex.Transaction;

    const transferId = await service.transferOrder(
      transaction,
      orderHeader,
      orderDetails,
      '2026-10-01',
    );

    expect(transferId).toBe(1);
    expect(insertHeader).toHaveBeenCalledOnce();
    expect(insertHeader.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        status: 1,
        source_order_header_id: 5,
        br_code_in: null,
        memo_: null,
        picker_name: 'Picker A',
        no_of_parcels: 2,
      }),
    );
    expect(insertDetails).toHaveBeenCalledWith([
      expect.objectContaining({
        transfer_id: 1,
        source_order_detail_id: 21,
        status: 1,
      }),
      expect.objectContaining({
        transfer_id: 1,
        source_order_detail_id: 22,
        status: 1,
      }),
    ]);
    expect(insertDetails.mock.calls[0][0][0]).not.toHaveProperty('stock_id');
    expect(insertDetails.mock.calls[0][0][0]).not.toHaveProperty('uom');
    expect(insertDetails.mock.calls[0][0][0]).not.toHaveProperty('net_of_vat');
    expect(updateDetails).toHaveBeenCalledWith({ transferstatus: 1 });
    expect(updateHeader).toHaveBeenCalledWith({ transferstatus: 1 });
  });
});
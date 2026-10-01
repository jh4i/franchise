import { Module } from '@nestjs/common';
import { OrderTransferService } from './order-transfer.service.js';

@Module({
  providers: [OrderTransferService],
  exports: [OrderTransferService],
})
export class OrderTransferModule {}
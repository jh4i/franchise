import { Module } from '@nestjs/common';
import { CronService } from './cron.service.js';
import { OrderTransferModule } from '../order-transfer/order-transfer.module.js';

@Module({
  imports: [OrderTransferModule],
  providers: [CronService],
})
export class CronModule {}

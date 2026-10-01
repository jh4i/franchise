import { Module } from '@nestjs/common';
import { OrderHeaderService } from './order-header.service.js';
import { OrderHeaderController } from './order-header.controller.js';

@Module({
  controllers: [OrderHeaderController],
  providers: [OrderHeaderService],
})
export class OrderHeaderModule {}

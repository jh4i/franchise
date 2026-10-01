import { Module } from '@nestjs/common';

import { OrderDetailsService } from './order-details.service.js';
import { OrderDetailsController } from './order-details.controller.js';

@Module({
  controllers: [OrderDetailsController],
  providers: [OrderDetailsService],
})
export class OrderDetailsModule {}
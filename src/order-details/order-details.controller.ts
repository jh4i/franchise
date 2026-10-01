import { Controller, Get, Param } from '@nestjs/common';

import { OrderDetailsService } from './order-details.service.js';

@Controller('order-details')
export class OrderDetailsController {
  constructor(
    private readonly orderDetailsService: OrderDetailsService,
  ) {}

  @Get('order/:orderId')
  async getOrderDetails(
    @Param('orderId') orderId: string,
  ) {
    return this.orderDetailsService.findByOrderId(
      Number(orderId),
    );
  }
}


import { Controller, Get, Param } from '@nestjs/common';

import { OrderHeaderService } from './order-header.service.js';

@Controller('order-header')
export class OrderHeaderController {
  constructor(
    private readonly orderHeaderService: OrderHeaderService,
  ) {}

  @Get(':id')
  async getOrderHeader(
    @Param('id') id: string,
  ) {
    return this.orderHeaderService.findById(Number(id));
  }
}
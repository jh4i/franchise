import { Test, TestingModule } from '@nestjs/testing';
import { OrderDetailsController } from './order-details.controller.js';
import { OrderDetailsService } from './order-details.service.js';

describe('OrderDetailsController', () => {
  let controller: OrderDetailsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderDetailsController],
      providers: [{ provide: OrderDetailsService, useValue: {} }],
    }).compile();

    controller = module.get<OrderDetailsController>(OrderDetailsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

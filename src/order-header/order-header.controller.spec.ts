import { Test, TestingModule } from '@nestjs/testing';
import { OrderHeaderController } from './order-header.controller.js';
import { OrderHeaderService } from './order-header.service.js';

describe('OrderHeaderController', () => {
  let controller: OrderHeaderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderHeaderController],
      providers: [{ provide: OrderHeaderService, useValue: {} }],
    }).compile();

    controller = module.get<OrderHeaderController>(OrderHeaderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

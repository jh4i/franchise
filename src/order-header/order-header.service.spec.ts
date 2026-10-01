import { Test, TestingModule } from '@nestjs/testing';
import { OrderHeaderService } from './order-header.service.js';
import { KNEX_CONNECTION } from '../database/knex.constants.js';

describe('OrderHeaderService', () => {
  let service: OrderHeaderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderHeaderService,
        { provide: KNEX_CONNECTION, useValue: {} },
      ],
    }).compile();

    service = module.get<OrderHeaderService>(OrderHeaderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

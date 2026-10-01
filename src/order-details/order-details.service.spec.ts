import { Test, TestingModule } from '@nestjs/testing';
import { OrderDetailsService } from './order-details.service.js';
import { KNEX_CONNECTION } from '../database/knex.constants.js';


describe('OrderDetailsService', () => {
  let service: OrderDetailsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderDetailsService,
        { provide: KNEX_CONNECTION, useValue: {} },
      ],
    }).compile();

    service = module.get<OrderDetailsService>(OrderDetailsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

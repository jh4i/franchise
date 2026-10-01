import { Test, TestingModule } from '@nestjs/testing';
import { CronService } from './cron.service.js';
import { KNEX_CONNECTION } from '../database/knex.constants.js';
import { OrderTransferService } from '../order-transfer/order-transfer.service.js';

describe('CronService', () => {
  let service: CronService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CronService,
        OrderTransferService,
        { provide: KNEX_CONNECTION, useValue: {} },
      ],
    }).compile();

    service = module.get<CronService>(CronService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

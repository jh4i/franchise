import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { DatabaseModule } from './database/database.module.js';
import { OrderHeaderModule } from './order-header/order-header.module.js';
import { OrderDetailsModule } from './order-details/order-details.module.js';
import { CronModule } from './cron/cron.module.js';

@Module({
  imports: [
    ScheduleModule.forRoot(),

    DatabaseModule,

    OrderHeaderModule,

    OrderDetailsModule,

    CronModule,
  ],
})
export class AppModule {}
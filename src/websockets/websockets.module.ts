import { Module } from '@nestjs/common';
import { FinanceGateway } from './finance.gateway';

@Module({
  providers: [FinanceGateway],
  exports: [FinanceGateway],
})
export class WebsocketsModule {}

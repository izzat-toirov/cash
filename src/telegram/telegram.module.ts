import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TransactionsController } from './telegram.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [TransactionsController],
  providers: [TelegramService],
})
export class TelegramModule {}

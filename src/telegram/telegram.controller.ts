import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { TelegramAuthGuard } from './guards/telegram-auth.guard';
import { TelegramService } from './telegram.service';

interface RequestWithUser extends Request {
  telegramUser?: any;
}

@Controller('api/telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  // ✅ Telegram webhook — POST /api/telegram/webhook
  @Post('webhook')
  async handleWebhook(@Body() body: any) {
    await this.telegramService.handleWebhook(body);
    return { ok: true };
  }
}

// ✅ Transactions controller o'zgarmaydi
import { Controller as NestController, Get as NestGet, UseGuards as NestUseGuards, Req as NestReq } from '@nestjs/common';

@NestController('api/transactions')
export class TransactionsController {
  @NestGet()
  @NestUseGuards(TelegramAuthGuard)
  findAll(@NestReq() req: RequestWithUser) {
    const user = req.telegramUser;
    return { message: `Foydalanuvchi ID: ${user?.id}` };
  }
}
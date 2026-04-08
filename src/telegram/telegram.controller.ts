import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express'; // Express Request-ni import qiling
import { TelegramAuthGuard } from './guards/telegram-auth.guard';

// TypeScript-ga Request ichida telegramUser borligini bildirish uchun interface
interface RequestWithUser extends Request {
  telegramUser?: any; // Yoki aniqroq foydalanuvchi turini yozishingiz mumkin
}

@Controller('api/transactions')
export class TransactionsController {
  
  @Get()
  @UseGuards(TelegramAuthGuard)
  findAll(@Req() req: RequestWithUser) { // 'any' o'rniga yangi interfaceni ko'rsatamiz
    const user = req.telegramUser;
    return { message: `Foydalanuvchi ID: ${user?.id}` };
  }
}
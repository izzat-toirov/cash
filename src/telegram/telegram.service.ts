import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Markup } from 'telegraf';

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private bot: Telegraf;

  constructor(private configService: ConfigService) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN') || '';
    this.bot = new Telegraf(token);
  }

  onModuleInit() {
    this.initBot();
  }

  onModuleDestroy() {
    this.bot.stop();
  }

  private initBot() {
    const webAppUrl = this.configService.get<string>('WEB_APP_URL') || '';
    const allowedAdminsStr = this.configService.get<string>('ALLOWED_ADMINS') || '';

    // /start bosilganda tekshirish
    this.bot.command('start', (ctx) => {
      const allowedAdmins = allowedAdminsStr.split(',');
      const userId = ctx.from.id.toString();

      if (allowedAdmins.includes(userId)) {
        return ctx.reply('Xush kelibsiz! Siz uchun Web App ochiq:', 
          Markup.inlineKeyboard([
            [Markup.button.webApp('Ilovani ochish', webAppUrl)]
          ])
        );
      } else {
        // Agar ro'yxatda bo'lmasa - Tugmasiz oddiy xabar
        return ctx.reply('Xush kelibsiz! (Sizga ilovadan foydalanishga ruxsat berilmagan)');
      }
    });

    // /admin komandasi (ixtiyoriy, bu ham faqat adminlarga)
    this.bot.command('admin', (ctx) => {
      const allowedAdmins = allowedAdminsStr.split(',');
      if (allowedAdmins.includes(ctx.from.id.toString())) {
        return ctx.reply('Admin Panel:', 
          Markup.inlineKeyboard([
            [Markup.button.webApp('Admin Panelni ochish', `${webAppUrl}/admin`)]
          ])
        );
      }
      return ctx.reply('Kechirasiz, siz admin emassiz.');
    });

    this.bot.launch().catch(err => console.error('Bot launch error:', err));
  }

  // CRUD metodlari (Controller xato bermasligi uchun)
  create() { return 'added'; }
  findAll() { return 'all'; }
  findOne(id: number) { return id; }
  update() { return 'updated'; }
  remove() { return 'removed'; }
}
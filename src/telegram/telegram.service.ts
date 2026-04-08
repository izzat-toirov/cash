import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Markup } from 'telegraf';

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private bot: Telegraf;

  constructor(private configService: ConfigService) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN') || '';
    this.bot = new Telegraf(token);
    this.initBotCommands();
  }

  async onModuleInit() {
    const webhookUrl = this.configService.get<string>('WEBHOOK_URL'); // https://yourdomain.vercel.app

    if (webhookUrl) {
      // ✅ Vercel (production) — webhook
      await this.bot.telegram.setWebhook(`${webhookUrl}/api/telegram/webhook`);
      console.log('Webhook set:', `${webhookUrl}/api/telegram/webhook`);
    } else {
      // ✅ Local — long polling
      this.bot.launch().catch(err => console.error('Bot launch error:', err));
      console.log('Bot started with long polling');
    }
  }

  onModuleDestroy() {
    // Webhook rejimida stop kerak emas, local da kerak
    const webhookUrl = this.configService.get<string>('WEBHOOK_URL');
    if (!webhookUrl) {
      this.bot.stop();
    }
  }

  private initBotCommands() {
    const webAppUrl = this.configService.get<string>('WEB_APP_URL') || '';
    const allowedAdminsStr = this.configService.get<string>('ALLOWED_ADMINS') || '';
    const allowedAdmins = allowedAdminsStr.split(',');

    this.bot.command('start', (ctx) => {
      const userId = ctx.from.id.toString();

      if (allowedAdmins.includes(userId)) {
        return ctx.reply('Xush kelibsiz! Siz uchun Web App ochiq:',
          Markup.inlineKeyboard([
            [Markup.button.webApp('Ilovani ochish', webAppUrl)]
          ])
        );
      }
      return ctx.reply('Xush kelibsiz! (Sizga ilovadan foydalanishga ruxsat berilmagan)');
    });

    this.bot.command('admin', (ctx) => {
      const userId = ctx.from.id.toString();
      if (allowedAdmins.includes(userId)) {
        return ctx.reply('Admin Panel:',
          Markup.inlineKeyboard([
            [Markup.button.webApp('Admin Panelni ochish', `${webAppUrl}/admin`)]
          ])
        );
      }
      return ctx.reply('Kechirasiz, siz admin emassiz.');
    });
  }

  // ✅ Webhook endpoint uchun — Controller chaqiradi
  async handleWebhook(body: any) {
    await this.bot.handleUpdate(body);
  }

  // CRUD metodlari
  create() { return 'added'; }
  findAll() { return 'all'; }
  findOne(id: number) { return id; }
  update() { return 'updated'; }
  remove() { return 'removed'; }
}
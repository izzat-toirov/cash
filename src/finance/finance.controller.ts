import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FinanceService } from './finance.service';
import {
  CreateFinanceRecordDto,
  UpdateFinanceRecordDto,
} from './dto/finance-record.dto';
import { ApiKeyGuard } from '../auth/api-key.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiHeader,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

@Controller('finance')
@UseGuards(ApiKeyGuard)
@ApiTags('Finance — Moliyaviy yozuvlar')
@ApiHeader({
  name: 'x-api-key',
  description: 'API kalit — autentifikatsiya uchun (.env dagi API_KEY)',
  required: true,
})
@ApiBearerAuth('x-api-key')
export class FinanceController {
  constructor(private financeService: FinanceService) {}


  @Post()
  @ApiOperation({
    summary: "Yangi moliyaviy yozuv qo'shish",
    description: `
Daromad yoki xarajat qo'shadi. \`date\` maydonidan avtomatik sheet nomi aniqlanadi.

- \`type: "income"\` → G:J ustunlariga yoziladi
- \`type: "expense"\` → B:E ustunlariga yoziladi
    `.trim(),
  })
  @ApiBody({ type: CreateFinanceRecordDto })
  @ApiResponse({
    status: 201,
    description: "Yozuv muvaffaqiyatli qo'shildi",
    schema: {
      example: {
        message: "Ma'lumot muvaffaqiyatli saqlandi",
        data: null,
      },
    },
  })
  @ApiResponse({ status: 400, description: "Noto'g'ri so'rov ma'lumotlari" })
  @ApiResponse({
    status: 401,
    description: "Autentifikatsiya xatosi (x-api-key noto'g'ri)",
  })
  async addRecord(@Body() dto: CreateFinanceRecordDto) {
    const result = await this.financeService.addFinanceRecord(dto);
    return { message: "Ma'lumot muvaffaqiyatli saqlandi", data: result };
  }


  @Get()
  @ApiOperation({
    summary: 'Joriy oy yozuvlarini olish',
    description:
      "Joriy oy va yil bo'yicha Google Sheets'dan barcha yozuvlarni qaytaradi.",
  })
  @ApiResponse({
    status: 200,
    description: 'Joriy oy yozuvlari',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: 'expense-row-5',
            date: '2026-04-01',
            amount: 50000,
            description: 'Taksi',
            category: 'Transport',
            type: 'expense',
          },
          {
            id: 'income-row-5',
            date: '2026-04-01',
            amount: 5000000,
            description: 'Maosh',
            category: 'Maosh',
            type: 'income',
          },
        ],
      },
    },
  })
  async getCurrentMonthRecords() {
    return this.financeService.getCurrentMonthRecords();
  }


  @Get('balance')
  @ApiOperation({
    summary: 'Balansni hisoblash',
    description:
      'Joriy oy uchun jami daromad, xarajat va sof balansni qaytaradi.',
  })
  @ApiQuery({
    name: 'year',
    required: false,
    type: Number,
    description: 'Yil. Default: joriy yil',
    example: 2026,
  })
  @ApiQuery({
    name: 'month',
    required: false,
    type: Number,
    description: 'Oy (1–12). Default: joriy oy',
    example: 4,
  })
  @ApiResponse({
    status: 200,
    description: "Balans ma'lumotlari",
    schema: {
      example: {
        totalIncome: 1500000,
        totalExpense: 1000000,
        balance: 500000,
      },
    },
  })
  async getBalance(
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    return this.financeService.calculateBalance(
      year ? parseInt(year) : undefined,
      month ? parseInt(month) : undefined,
    );
  }


  @Get('categories')
  @ApiOperation({
    summary: "Kategoriyalar ro'yxati",
    description: "Google Sheets'dagi \"Kategoriyalar\" varag'idan o'qiydi.",
  })
  @ApiResponse({
    status: 200,
    description: 'Kategoriyalar',
    schema: {
      example: [
        { name: 'Maosh', type: 'income' },
        { name: 'Transport', type: 'expense' },
      ],
    },
  })
  async getCategories() {
    return this.financeService.getCategories();
  }


  @Get('records')
  @ApiOperation({
    summary: "Filter bo'yicha yozuvlarni olish",
    description: `
- \`year\` + \`month\` → o'sha oyning yozuvlari
- Faqat \`year\` → butun yilning barcha oylari
- Hech narsa yo'q → joriy oy
    `.trim(),
  })
  @ApiQuery({
    name: 'year',
    required: false,
    type: Number,
    description: 'Yil',
    example: 2026,
  })
  @ApiQuery({
    name: 'month',
    required: false,
    type: Number,
    description: 'Oy (1–12)',
    example: 4,
  })
  @ApiResponse({ status: 200, description: 'Filtrlangan yozuvlar' })
  async getFilteredRecords(
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    return this.financeService.getFilteredRecords(
      year ? parseInt(year) : undefined,
      month ? parseInt(month) : undefined,
    );
  }

  // ── GET /finance/month ────────────────────────────────────────────────────────

  @Get('month')
  @ApiOperation({
    summary: 'Aniq bir oy yozuvlarini olish',
  })
  @ApiQuery({
    name: 'year',
    type: Number,
    required: true,
    description: 'Yil',
    example: 2026,
  })
  @ApiQuery({
    name: 'month',
    type: Number,
    required: true,
    description: 'Oy (1–12)',
    example: 4,
  })
  @ApiResponse({ status: 200, description: "So'ralgan oy yozuvlari" })
  @ApiResponse({ status: 400, description: "Noto'g'ri yil/oy parametrlari" })
  async getMonthRecords(
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.financeService.getMonthRecords(parseInt(year), parseInt(month));
  }

  // ── PUT /finance/:id ──────────────────────────────────────────────────────────

  @Put(':id')
  @ApiOperation({
    summary: 'Moliyaviy yozuvni yangilash',
    description: `
\`id\` formati: \`expense-row-5\` yoki \`income-row-7\`

Bu id \`GET /finance\` endpointidan qaytgan \`id\` maydonidir.
    `.trim(),
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Yozuv ID si',
    example: 'expense-row-5',
  })
  @ApiQuery({
    name: 'year',
    required: false,
    type: Number,
    description: 'Sheet yili.  Default: joriy yil',
    example: 2026,
  })
  @ApiQuery({
    name: 'month',
    required: false,
    type: Number,
    description: 'Sheet oyi.   Default: joriy oy',
    example: 4,
  })
  @ApiBody({ type: UpdateFinanceRecordDto })
  @ApiResponse({ status: 200, description: 'Yozuv muvaffaqiyatli yangilandi' })
  @ApiResponse({ status: 400, description: "Noto'g'ri id format" })
  @ApiResponse({ status: 404, description: 'Yozuv topilmadi' })
  async updateRecord(
    @Param('id') id: string,
    @Body() dto: UpdateFinanceRecordDto,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    await this.financeService.updateFinanceRecord(
      id,
      dto,
      year ? parseInt(year) : undefined,
      month ? parseInt(month) : undefined,
    );
    return { message: 'Yozuv muvaffaqiyatli yangilandi', id };
  }

  // ── DELETE /finance/:id ───────────────────────────────────────────────────────

  @Delete(':id')
  @ApiOperation({
    summary: "Moliyaviy yozuvni o'chirish",
    description: `
\`id\` formati: \`expense-row-5\` yoki \`income-row-7\`

Google Sheets\'dan o\'sha qatorni to\'liq o\'chiradi.
    `.trim(),
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Yozuv ID si',
    example: 'income-row-7',
  })
  @ApiQuery({
    name: 'year',
    required: false,
    type: Number,
    description: 'Sheet yili. Default: joriy yil',
    example: 2026,
  })
  @ApiQuery({
    name: 'month',
    required: false,
    type: Number,
    description: 'Sheet oyi.  Default: joriy oy',
    example: 4,
  })
  @ApiResponse({ status: 200, description: "Yozuv muvaffaqiyatli o'chirildi" })
  @ApiResponse({ status: 400, description: "Noto'g'ri id format" })
  @ApiResponse({ status: 404, description: 'Yozuv topilmadi' })
  async deleteRecord(
    @Param('id') id: string,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    await this.financeService.deleteFinanceRecord(
      id,
      year ? parseInt(year) : undefined,
      month ? parseInt(month) : undefined,
    );
    return { message: "Yozuv muvaffaqiyatli o'chirildi", id };
  }
}

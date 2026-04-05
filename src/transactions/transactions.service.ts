import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { GoogleSheetsService } from '../google-sheets/google-sheets.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(private readonly sheetsService: GoogleSheetsService) {}

  // ─── POST /transactions ───────────────────────────────────────────────────────

  async create(dto: CreateTransactionDto) {
    const year = dto.year ?? new Date().getFullYear();
    const month = dto.month ?? new Date().getMonth() + 1;
    const sheetName = this.sheetsService.getSheetName(year, month);

    if (dto.type === 'expense') {
      // ✅ SVODKA FORMULA: B=date, C=amount, D=description, E=category
      // =SUMIF(Sheet!E:E; $B27; Sheet!C:C) → E=kategoriya, C=summa
      await this.sheetsService.addExpenseRow(sheetName, [
        dto.date,                    // B = date
        String(dto.amount),          // C = amount ✅ summa
        dto.description ?? '',       // D = description
        dto.category,                // E = category ✅ SUMIF shu ustundan qidiradi
      ]);
    } else {
      // ✅ SVODKA FORMULA: H=date, I=description, J=category, K=amount
      // =SUMIF(Sheet!J:J; $H27; Sheet!K:K) → J=kategoriya, K=summa
      await this.sheetsService.addIncomeRow(sheetName, [
        dto.date,                    // H = date
        dto.description ?? '',       // I = description
        dto.category,                // J = category ✅ SUMIF shu ustundan qidiradi
        String(dto.amount),          // K = amount ✅ summa
      ]);
    }

    return { success: true, data: { ...dto, sheetName } };
  }

  // ─── PATCH /transactions/:id ──────────────────────────────────────────────────

  async update(id: string, dto: UpdateTransactionDto) {
    const { type, rowIndex, sheetName } = this.parseId(id, dto);

    const records = await this.sheetsService.getFinanceRecords(sheetName);
    const existing = records.find((r) => r.id === id);
    if (!existing) throw new NotFoundException(`Transaction "${id}" topilmadi`);

    if (type === 'expense') {
      // ✅ B:E: [date, amount, description, category]
      await this.sheetsService.updateRow(
        sheetName,
        rowIndex,
        [
          dto.date ?? existing.date,
          String(dto.amount ?? existing.amount),
          dto.description ?? existing.description ?? '',
          dto.category ?? existing.category,
        ],
        'expense',
      );
    } else {
      // ✅ H:K: [date, description, category, amount]
      await this.sheetsService.updateRow(
        sheetName,
        rowIndex,
        [
          dto.date ?? existing.date,
          String(dto.amount ?? existing.amount),
          dto.description ?? existing.description ?? '',
          dto.category ?? existing.category,
        ],
        'income',
      );
    }

    return { success: true, id };
  }

  // ─── GET /transactions?month=5&year=2026 ─────────────────────────────────────

  async findByMonth(month: number, year: number) {
    const sheetName = this.sheetsService.getSheetName(year, month);
    const records = await this.sheetsService.getFinanceRecords(sheetName);
    return { success: true, data: records };
  }

  // ─── GET /transactions/:id ────────────────────────────────────────────────────

  async findOne(id: string, month?: number, year?: number) {
    const m = month ?? new Date().getMonth() + 1;
    const y = year ?? new Date().getFullYear();
    const sheetName = this.sheetsService.getSheetName(y, m);

    const records = await this.sheetsService.getFinanceRecords(sheetName);
    const record = records.find((r) => r.id === id);

    if (!record) throw new NotFoundException(`Transaction "${id}" topilmadi`);
    return { success: true, data: record };
  }

  // ─── DELETE /transactions/:id ─────────────────────────────────────────────────

  async remove(id: string, month?: number, year?: number) {
    const { rowIndex, sheetName } = this.parseId(id, { month, year });
    await this.sheetsService.deleteRow(sheetName, rowIndex);
    return { success: true, message: "Transaction o'chirildi", id };
  }

  // ─── HELPER ───────────────────────────────────────────────────────────────────

  private parseId(
    id: string,
    opts: { month?: number; year?: number },
  ): { type: 'income' | 'expense'; rowIndex: number; sheetName: string } {
    const match = id.match(/^(income|expense)-row-(\d+)$/);
    if (!match) throw new NotFoundException(`Noto'g'ri transaction id: "${id}"`);

    const type = match[1] as 'income' | 'expense';
    const rowIndex = Number(match[2]);
    const year = opts.year ?? new Date().getFullYear();
    const month = opts.month ?? new Date().getMonth() + 1;
    const sheetName = this.sheetsService.getSheetName(year, month);

    return { type, rowIndex, sheetName };
  }
}
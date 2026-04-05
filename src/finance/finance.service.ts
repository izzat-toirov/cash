import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { GoogleSheetsService } from '../google-sheets/google-sheets.service';
import { FinanceRecord } from '../common/types/finance.types';
import { SHEET_CONSTANTS } from '../common/constants/sheets.constants';

@Injectable()
export class FinanceService {
  private readonly logger = new Logger(FinanceService.name);

  constructor(private googleSheetsService: GoogleSheetsService) {}

  // ─── ADD ──────────────────────────────────────────────────────────────────────

  async addFinanceRecord(record: Omit<FinanceRecord, 'id'>): Promise<void> {
    try {
      const sheetName = this.getSheetNameFromDate(record.date);
  
      if (record.type === 'expense') {
        // Xarajat: B=date, C=amount, D=description, E=category
        const rowData = [
          record.date,
          record.amount.toString(),
          record.description || '',
          record.category,
        ];
        await this.googleSheetsService.addExpenseRow(sheetName, rowData);
  
      } else {
        // Daromad: H=date, I=description, J=category, K=amount
        const rowData = [
          record.date,
          record.description || '',
          record.category,
          record.amount.toString(),
        ];
        await this.googleSheetsService.addIncomeRow(sheetName, rowData);
      }
  
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Xatolik: ${message}`);
      throw new BadRequestException('Finance record qo\'shishda xatolik');
    }
  }

  // --- SVODKA MA'LUMOTLARINI OLISH ---
  async getSvodkaReport() {
    const sheet = SHEET_CONSTANTS.SVODKA_SHEET_NAME;
    const ranges = [
      `${sheet}!${SHEET_CONSTANTS.RANGES.SVODKA.CURRENT_MONTH}`,
      `${sheet}!${SHEET_CONSTANTS.RANGES.SVODKA.INITIAL_AMOUNT}`,
      `${sheet}!${SHEET_CONSTANTS.RANGES.SVODKA.EXPENSE_CATEGORIES}`,
      `${sheet}!${SHEET_CONSTANTS.RANGES.SVODKA.INCOME_CATEGORIES}`,
    ];

    const data = await this.googleSheetsService.getBatchData(ranges);
    
    return {
      currentMonth: data[0]?.[0]?.[0],
      savings: data[1]?.[0]?.[0],
      expenses: data[2],
      income: data[3]
    };
  }

  // ─── READ ─────────────────────────────────────────────────────────────────────

  async getCurrentMonthRecords(): Promise<FinanceRecord[]> {
    try {
      const sheetName = this.googleSheetsService.getCurrentMonthSheetName();
      return await this.googleSheetsService.getFinanceRecords(sheetName);
    } catch (error: any) {
      this.logger.error(
        `Error fetching current month records: ${error.message}`,
      );
      throw new BadRequestException('Failed to fetch records');
    }
  }

  async getMonthRecords(year: number, month: number): Promise<FinanceRecord[]> {
    try {
      const sheetName = this.googleSheetsService.getSheetName(year, month);
      return await this.googleSheetsService.getFinanceRecords(sheetName);
    } catch (error: any) {
      this.logger.error(`Error fetching month records: ${error.message}`);
      throw new BadRequestException('Failed to fetch month records');
    }
  }

  async getFilteredRecords(
    year?: number,
    month?: number,
  ): Promise<FinanceRecord[]> {
    try {
      if (year && month) {
        const sheetName = this.googleSheetsService.getSheetName(year, month);
        return await this.googleSheetsService.getFinanceRecords(sheetName);
      }
      if (year && !month) {
        return await this.getYearRecords(year);
      }
      const sheetName = this.googleSheetsService.getCurrentMonthSheetName();
      return await this.googleSheetsService.getFinanceRecords(sheetName);
    } catch (error: any) {
      this.logger.error(`Error fetching filtered records: ${error.message}`);
      throw new BadRequestException('Failed to fetch filtered records');
    }
  }

  private async getYearRecords(year: number): Promise<FinanceRecord[]> {
    const sheetPromises: Promise<FinanceRecord[]>[] = [];
    
    for (let month = 1; month <= 12; month++) {
      const sheetName = this.googleSheetsService.getSheetName(year, month);
      const promise = this.googleSheetsService.getFinanceRecords(sheetName)
        .catch(() => {
          this.logger.warn(`Sheet "${sheetName}" not found for ${year}-${month}`);
          return [] as FinanceRecord[];
        });
      sheetPromises.push(promise);
    }
    
    const results = await Promise.all(sheetPromises);
    return results.flat();
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────────

  /**
   * @param id  - "expense-row-5" yoki "income-row-7" formatida
   * @param record - O'zgartiriladigan maydonlar (partial)
   * @param year  - Sheet yili (default: joriy yil)
   * @param month - Sheet oyi (default: joriy oy)
   */
  async updateFinanceRecord(
    id: string,
    record: Partial<FinanceRecord>,
    year?: number,
    month?: number,
  ): Promise<void> {
    try {
      // 1. id ni parse qilish: "expense-row-5" → type="expense", rowIndex=5
      const match = id.match(/^(income|expense)-row-(\d+)$/);
      if (!match) {
        throw new BadRequestException(`Noto'g'ri id format: "${id}"`);
      }
      const type = match[1] as 'income' | 'expense';
      const rowIndex = Number(match[2]);

      // 2. Sheet nomini aniqlash
      const y = year ?? new Date().getFullYear();
      const m = month ?? new Date().getMonth() + 1;
      const sheetName = this.googleSheetsService.getSheetName(y, m);

      // 3. Mavjud recordni olish
      const records =
        await this.googleSheetsService.getFinanceRecords(sheetName);
      const existing = records.find((r) => r.id === id);
      if (!existing) {
        throw new NotFoundException(`Record "${id}" topilmadi`);
      }

      // 4. Yangilangan qatorni tuzish
      const rowData = [
        record.date ?? existing.date,
        String(record.amount ?? existing.amount),
        record.description ?? existing.description,
        record.category ?? existing.category,
      ];

      // 5. To'g'ri ustunlarga yozish (expense→B:E, income→G:J)
      await this.googleSheetsService.updateRow(
        sheetName,
        rowIndex,
        rowData,
        type,
      );
      this.logger.log(`Updated "${id}" in sheet "${sheetName}"`);
    } catch (error: any) {
      this.logger.error(`Error updating finance record: ${error.message}`);
      if (error instanceof NotFoundException) throw error;
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Failed to update finance record');
    }
  }

  // ─── DELETE ───────────────────────────────────────────────────────────────────

  /**
   * @param id    - "expense-row-5" yoki "income-row-7"
   * @param year  - Sheet yili (default: joriy yil)
   * @param month - Sheet oyi (default: joriy oy)
   */
  async deleteFinanceRecord(
    id: string,
    year?: number,
    month?: number,
  ): Promise<void> {
    try {
      const match = id.match(/^(income|expense)-row-(\d+)$/);
      if (!match) {
        throw new BadRequestException(`Noto'g'ri id format: "${id}"`);
      }
      const rowIndex = Number(match[2]);

      const y = year ?? new Date().getFullYear();
      const m = month ?? new Date().getMonth() + 1;
      const sheetName = this.googleSheetsService.getSheetName(y, m);

      await this.googleSheetsService.deleteRow(sheetName, rowIndex);
      this.logger.log(`Deleted "${id}" from sheet "${sheetName}"`);
    } catch (error: any) {
      this.logger.error(`Error deleting finance record: ${error.message}`);
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Failed to delete finance record');
    }
  }

  // ─── BALANCE ──────────────────────────────────────────────────────────────────

  async calculateBalance(
    year?: number,
    month?: number,
  ): Promise<{
    totalIncome: number;
    totalExpense: number;
    balance: number;
  }> {
    try {
      const y = year ?? new Date().getFullYear();
      const m = month ?? new Date().getMonth() + 1;
      const sheetName = this.googleSheetsService.getSheetName(y, m);
      const records =
        await this.googleSheetsService.getFinanceRecords(sheetName);

      const totalIncome = records
        .filter((r) => r.type === 'income')
        .reduce((sum, r) => sum + r.amount, 0);

      const totalExpense = records
        .filter((r) => r.type === 'expense')
        .reduce((sum, r) => sum + r.amount, 0);

      const balance = totalIncome - totalExpense;
      this.logger.log(
        `Balance: income=${totalIncome}, expense=${totalExpense}, balance=${balance}`,
      );
      return { totalIncome, totalExpense, balance };
    } catch (error: any) {
      this.logger.error(`Error calculating balance: ${error.message}`);
      throw new BadRequestException('Failed to calculate balance');
    }
  }

  // ─── CATEGORIES ───────────────────────────────────────────────────────────────

  async getCategories() {
    try {
      return await this.googleSheetsService.getCategories();
    } catch (error: any) {
      this.logger.error(`Error fetching categories: ${error.message}`);
      throw new BadRequestException('Failed to fetch categories');
    }
  }

  // ─── PRIVATE HELPERS ──────────────────────────────────────────────────────────

  private getSheetNameFromDate(date: string): string {
    let year: number;
    let month: number;

    try {
      if (date.includes('-') && date.indexOf('-') === 4) {
        // YYYY-MM-DD
        const parts = date.split('-');
        year = parseInt(parts[0]);
        month = parseInt(parts[1]);
      } else if (date.includes('.')) {
        // DD.MM.YYYY
        const parts = date.split('.');
        year = parseInt(parts[2]);
        month = parseInt(parts[1]);
      } else {
        return this.googleSheetsService.getCurrentMonthSheetName();
      }

      // Validate parsed values
      if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        this.logger.warn(`Invalid date format: ${date}, using current month`);
        return this.googleSheetsService.getCurrentMonthSheetName();
      }

      return this.googleSheetsService.getSheetName(year, month);
    } catch (error) {
      this.logger.error(`Error parsing date "${date}": ${error instanceof Error ? error.message : String(error)}`);
      return this.googleSheetsService.getCurrentMonthSheetName();
    }
  }
}

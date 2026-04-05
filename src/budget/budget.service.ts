// import { Injectable, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
// import { GoogleSheetsService } from '../google-sheets/google-sheets.service';
// import {
//   FinanceRecord,
//   BudgetSummary,
//   CategoryData,
//   SvodkaData,
// } from '../common/types/finance.types';

// @Injectable()
// export class BudgetService {
//   private readonly logger = new Logger(BudgetService.name);
//   constructor(private readonly sheetsService: GoogleSheetsService) {}

//   async getSummary(
//     month: number,
//     year: number,
//   ): Promise<{ success: boolean; data: BudgetSummary }> {
//     const sheetName = this.sheetsService.getSheetName(year, month);

//     // ✅ OPTIMIZATSIYA: "Сводка" varag'idagi tayyor formulalarni o'qiymiz
//     // mergeCategories va qo'lda hisoblashni olib tashladik
//     const [initialAmount, svodkaData] = await Promise.all([
//       this.sheetsService.getInitialAmount(),
//       this.sheetsService.readSvodka(),
//     ]);

//     // ✅ SVODKADAGI FORMULALAR HISOBKITOBIDAN FOYDALANAMIZ
//     // Sheets-dagi SUMIF formulalari aniqrog'i
//     const actualIncome = svodkaData.incomeActual;
//     const actualExpense = svodkaData.expenseActual;

//     // ✅ Kategoriyalar - Sheets-dan tayyor o'qiladi
//     const expenseCategories = svodkaData.expenseCategories;
//     const incomeCategories = svodkaData.incomeCategories;

//     const endBalance = initialAmount + actualIncome - actualExpense;
//     const saved = endBalance - initialAmount;
//     const savedPercent =
//       initialAmount > 0 ? Math.round((saved / initialAmount) * 100) : 0;

//     return {
//       success: true,
//       data: {
//         month,
//         year,
//         sheetName,
//         initialAmount,
//         endBalance,
//         saved,
//         savedPercent: `${saved >= 0 ? '+' : ''}${savedPercent}%`,
//         expenses: {
//           planned: svodkaData.expensePlanned,
//           actual: actualExpense,
//           diff: actualExpense - svodkaData.expensePlanned,
//         },
//         income: {
//           planned: svodkaData.incomePlanned,
//           actual: actualIncome,
//           diff: actualIncome - svodkaData.incomePlanned,
//         },
//         expenseCategories,
//         incomeCategories,
//       },
//     };
//   }

//   private mergeCategories(
//     plannedList: CategoryData[],
//     actuals: FinanceRecord[],
//     headerName: string,
//   ): CategoryData[] {
//     const map = new Map<string, CategoryData>();

//     // 1. Sheets-dagi rejalarni map-ga yuklash
//     plannedList.forEach((item) => {
//       map.set(item.category, { ...item, actual: 0, diff: -item.planned });
//     });

//     // 2. Haqiqiy xarajatlarni qo'shish
//     actuals.forEach((rec) => {
//       const existing = map.get(rec.category);
//       if (existing) {
//         existing.actual += rec.amount;
//         existing.diff = existing.actual - existing.planned;
//       } else {
//         // Agar rejalashtirilmagan kategoriya bo'lsa
//         map.set(rec.category, {
//           category: rec.category,
//           planned: 0,
//           actual: rec.amount,
//           diff: rec.amount,
//         });
//       }
//     });

//     const result = Array.from(map.values());

//     // 3. Sarlavha qatorini qo'shish (Siz so'ragan sarlavha)
//     result.unshift({
//       category: headerName,
//       planned: null,
//       actual: null,
//       diff: null,
//     } as any);

//     return result;
//   }

//   async addCategory(name: string, type: 'income' | 'expense') {
//     try {
//       const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
//       await this.sheetsService.addCategoryToTable(type, formattedName);

//       return {
//         success: true,
//         message: `"${formattedName}" kategoriyasi Svodka jadvaliga qo'shildi.`,
//       };
//     } catch (error) {
//       // 2. Endi bu yerda this.logger xatosiz ishlaydi
//       this.logger.error(`Kategoriya qo'shishda xato: ${error.message}`);
//       throw new BadRequestException(
//         `Google Sheets-ga yozishda xato: ${error.message}`,
//       );
//     }
//   }

//   async getFullSvodka() {
//     const sheet = 'Сводка'; // Bu yerdagi nom Sheets-dagi bilan 100% bir xil bo'lishi shart
//     const ranges = [
//       `${sheet}!I14`,
//       `${sheet}!I17`,
//       `${sheet}!J12`,
//       `${sheet}!B28:E45`,
//       `${sheet}!G28:J45`,
//     ];

//     const data = await this.sheetsService.getBatchData(ranges);

//     return {
//       success: true,
//       summary: {
//         initialAmount: data[0][0][0] || 0,
//         endBalance: data[1][0][0] || 0,
//         savedPercent: data[2][0][0] || '0%',
//       },
//       expenses: this.formatTable(data[3]),
//       income: this.formatTable(data[4]),
//     };
//   }

//   async getOnlyFormulas() {
//     const range = 'Сводка!A1:M44';
//     const rawFormulas: any[][] = await this.sheetsService.getValuesWithFormulas(range);
  
//     const formulasOnly:any[] = [];
  
//     for (let r = 0; r < 44; r++) {
//       for (let c = 0; c < 13; c++) {
//         const val = rawFormulas[r]?.[c];
        
//         // Faqat '=' bilan boshlangan kataklarni olamiz
//         if (val && String(val).startsWith('=')) {
//           const cell = `${String.fromCharCode(65 + c)}${r + 1}`;
//           formulasOnly.push({
//             cell: cell,
//             formula: val
//           });
//         }
//       }
//     }
//     return formulasOnly;
//   }

//   private formatTable(rows: any[][]) {
//     if (!rows) return [];
//     return rows
//       .filter((row) => row[0] && isNaN(Number(row[0]))) // Faqat sarlavha bo'lmagan, nomi bor qatorlar
//       .map((row) => ({
//         category: row[0],
//         planned: this.parseNumber(row[1]),
//         actual: this.parseNumber(row[2]),
//         diff: this.parseNumber(row[3]),
//       }));
//   }

//   private parseNumber(value: any): number {
//     if (!value) return 0;

//     // ✅ DEBUG LOGDA MATN QAYTGAN HOLATLAR UCHUN: "На столько увеличились..."
//     // Agar matn raqam bo'lmasa va #N/A xatosi bo'lsa, 0 qaytaramiz
//     const strValue = String(value);

//     // #N/A error check
//     if (strValue.includes('#N/A') || strValue.includes('N/A')) {
//       this.logger.warn(
//         `#N/A error detected in cell value: "${strValue}" - returning 0`,
//       );
//       return 0;
//     }

//     // "1 000 P" ko'rinishidagi matndan faqat raqamni ajratib olish
//     const cleaned = strValue.replace(/[^0-9.-]/g, '');
//     const parsed = parseFloat(cleaned);

//     if (isNaN(parsed)) {
//       this.logger.warn(`Invalid number format: "${strValue}" - returning 0`);
//       return 0;
//     }

//     return parsed;
//   }

//   async debugFormulas() {
//     const sheet = 'Сводка'; // Varaq nomi to'g'riligiga e'tibor bering

//     // Asosiy hisob-kitob katakchalarini tekshiramiz
//     const formulaRanges = [
//       `${sheet}!D28`, // Birinchi xarajatning formulasi
//       `${sheet}!I15`, // Summa (Nachalnaya) formulasi
//       `${sheet}!I16`, // Ostatok formulasi
//       `${sheet}!B28:E30`, // Jadvalning bir qismi
//     ];

//     const results = {};

//     for (const range of formulaRanges) {
//       results[range] = await this.sheetsService.getCellFormulas(range);
//     }

//     return {
//       message: 'Formulalar tahlili',
//       data: results,
//     };
//   }

//   async getRawSheetData() {
//     const sheet = 'Сводка';

//     // Tekshirishimiz kerak bo'lgan barcha diapazonlar
//     const ranges = {
//       oyTanlovi: `${sheet}!D10`,
//       jamiTejamkorlik: `${sheet}!I15`,
//       holatMatni: `${sheet}!I16`,
//       umumiyQoldiq: `${sheet}!I17`,
//       xarajatlarJadvali: `${sheet}!B28:E45`,
//       daromadlarJadvali: `${sheet}!G28:J45`,
//     };

//     const results = {};

//     try {
//       for (const [key, range] of Object.entries(ranges)) {
//         // 1. Shu diapazondagi formulalarni olamiz
//         const formulas = await this.sheetsService.getCellFormulas(range);

//         // 2. Shu diapazondagi yakuniy qiymatlarni olamiz
//         const values = await this.sheetsService.getBatchData([range]);

//         results[key] = {
//           range: range,
//           formulas: formulas || [],
//           calculatedValues: values[0] || [],
//         };
//       }

//       return {
//         success: true,
//         timestamp: new Date().toISOString(),
//         fullDebugData: results,
//       };
//     } catch (error) {
//       this.logger.error(`Debug ma'lumotlarini olishda xato: ${error.message}`);
//       throw new BadRequestException(`Sheets o'qishda xato: ${error.message}`);
//     }
//   }

//   async getValidCategoriesFromSheets(): Promise<{
//     success: boolean;
//     data: { expenses: string[]; income: string[] };
//   }> {
//     try {
//       const svodkaData = await this.sheetsService.readSvodka();

//       // ✅ SHEETS-DAGI ORIGINAL NOMLARNI O'QIMIZ (bo'sh joylar va case-sensitive)
//       // Debug logdan: "Питание", "Подарки", "Здоровье/медицина", "Дом" (950 ₽), etc.
//       const expenseCategories = svodkaData.expenseCategories
//         .map((c) => c.category)
//         .filter((name) => name && name.trim().length > 0);

//       const incomeCategories = svodkaData.incomeCategories
//         .map((c) => c.category)
//         .filter((name) => name && name.trim().length > 0);

//       this.logger.log(
//         `Loaded ${expenseCategories.length} expense categories, ${incomeCategories.length} income categories`,
//       );

//       return {
//         success: true,
//         data: {
//           expenses: expenseCategories,
//           income: incomeCategories,
//         },
//       };
//     } catch (error: any) {
//       this.logger.error(`Kategoriyalarni o'qishda xato: ${error.message}`);
//       throw new BadRequestException(
//         `Sheets-dan kategoriyalarni o'qishda xato: ${error.message}`,
//       );
//     }
//   }

//   /**
//    * ✅ CATEGORY VALIDATION: Foydalanuvchi kiritgan nomni Sheets-dagi original bilan solishtiradi
//    * Case-sensitive + bo'sh joylarni hisobga oladi
//    */
//   async validateAndFormatCategory(
//     name: string,
//     type: 'income' | 'expense',
//   ): Promise<string> {
//     const validCategories = await this.getValidCategoriesFromSheets();
//     const categoryList =
//       type === 'expense'
//         ? validCategories.data.expenses
//         : validCategories.data.income;

//     // ✅ NORMALIZATION: Trim + case-insensitive comparison
//     const normalizedInput = name.trim();

//     // Exact match qidiramiz (case-sensitive)
//     const exactMatch = categoryList.find((cat) => cat === normalizedInput);
//     if (exactMatch) {
//       this.logger.log(`Exact match found: "${normalizedInput}"`);
//       return exactMatch;
//     }

//     // Case-insensitive match qidiramiz
//     const lowerCaseInput = normalizedInput.toLowerCase();
//     const caseInsensitiveMatch = categoryList.find(
//       (cat) => cat.toLowerCase() === lowerCaseInput,
//     );

//     if (caseInsensitiveMatch) {
//       this.logger.warn(
//         `Case mismatch: "${normalizedInput}" -> "${caseInsensitiveMatch}"`,
//       );
//       return caseInsensitiveMatch; // Sheets-dagi original caseni qaytaramiz
//     }

//     // Agar hech qanday mos kelmasa
//     throw new BadRequestException(
//       `"${name}" kategoriyasi Sheets-da topilmadi. Ruxsat etilgan kategoriyalar: ${categoryList.join(', ')}`,
//     );
//   }

//   async getFullAuditData() {
//   const sheet = 'Сводка';
//   const range = `${sheet}!A1:M44`;

//   try {
//     // 1. Hisoblangan qiymatlarni olish
//     const calculatedValuesResult = await this.sheetsService.getBatchData([range]);
//     const calculatedValues: any[][] = calculatedValuesResult[0] || [];
    
//     // 2. Xom formulalarni olish
//     const rawFormulas: any[][] = (await this.sheetsService.getValuesWithFormulas(range)) || [];

//     // 3. Massiv turini any[] deb belgilaymiz (ts(2345) xatosini yechimi)
//     const auditReport: any[] = [];

//     for (let r = 0; r < 44; r++) {
//       for (let c = 0; c < 13; c++) {
//         const calcValue = calculatedValues[r] ? calculatedValues[r][c] : undefined;
//         const rawValue = rawFormulas[r] ? rawFormulas[r][c] : undefined;
        
//         if (calcValue !== undefined || rawValue !== undefined) {
//           const cellAddress = `${String.fromCharCode(65 + c)}${r + 1}`;
          
//           let type: 'FORMULA' | 'NUMBER' | 'TEXT' | 'ERROR' | 'EMPTY' = 'TEXT';
//           const strRaw = String(rawValue || '');
//           const strCalc = String(calcValue || '');

//           if (strRaw.startsWith('=')) type = 'FORMULA';
//           else if (strCalc.includes('#N/A')) type = 'ERROR';
//           else if (!isNaN(Number(strCalc)) && strCalc !== '') type = 'NUMBER';
//           else if (strCalc === '') type = 'EMPTY';

//           auditReport.push({
//             cell: cellAddress,
//             row: r + 1,
//             col: String.fromCharCode(65 + c),
//             type: type,
//             formula: type === 'FORMULA' ? rawValue : null,
//             displayValue: calcValue,
//             isError: strCalc.includes('#N/A'),
//             suggestion: strCalc.includes('#N/A') ? "Varaq nomi yoki kategoriya mos kelmayapti" : "OK"
//           });
//         }
//       }
//     }

//     return {
//       success: true,
//       totalCellsAnalyzed: auditReport.length,
//       sheetInfo: { name: sheet, range: range },
//       data: auditReport
//     };
//   } catch (error: any) {
//     this.logger.error(`Full Audit xatosi: ${error.message}`);
//     throw new BadRequestException(`Audit o'tkazishda xato: ${error.message}`);
//   }
// }
// }

// import {
//   Body,
//   Controller,
//   Get,
//   HttpCode,
//   HttpStatus,
//   Post,
//   Query,
// } from '@nestjs/common';
// import {
//   ApiBearerAuth,
//   ApiBody,
//   ApiOperation,
//   ApiQuery,
//   ApiResponse,
//   ApiTags,
// } from '@nestjs/swagger';
// import { BudgetService } from './budget.service';
// import { BudgetQueryDto, SetInitialAmountDto } from './dto/create-budget.dto';


// const CategorySchema = {
//   type: 'object',
//   properties: {
//     category: { type: 'string', example: 'Питание' },
//     planned: { type: 'number', example: 950000 },
//     actual: { type: 'number', example: 1000000 },
//     diff: { type: 'number', example: -50000, description: 'actual - planned' },
//   },
// };

// const SummaryResponseSchema = {
//   example: {
//     success: true,
//     data: {
//       month: 4,
//       year: 2026,
//       sheetName: 'Aprel 2026',
//       initialAmount: 1000000,
//       endBalance: 1500000,
//       saved: 500000,
//       savedPercent: '+50%',
//       expenses: {
//         planned: 950000,
//         actual: 1000000,
//         diff: -50000,
//       },
//       income: {
//         planned: 1450000,
//         actual: 1500000,
//         diff: 50000,
//       },
//       expenseCategories: [
//         { category: 'Питание', planned: 0, actual: 0, diff: 0 },
//         { category: 'Дом', planned: 950000, actual: 1000000, diff: -50000 },
//         { category: 'Транспорт', planned: 0, actual: 0, diff: 0 },
//       ],
//       incomeCategories: [
//         {
//           category: 'Зарплата',
//           planned: 1450000,
//           actual: 1500000,
//           diff: 50000,
//         },
//         { category: 'Премия', planned: 0, actual: 0, diff: 0 },
//       ],
//     },
//   },
//   schema: {
//     type: 'object',
//     properties: {
//       success: { type: 'boolean' },
//       data: {
//         type: 'object',
//         properties: {
//           month: { type: 'integer' },
//           year: { type: 'integer' },
//           sheetName: { type: 'string' },
//           initialAmount: { type: 'number' },
//           endBalance: { type: 'number' },
//           saved: { type: 'number' },
//           savedPercent: { type: 'string' },
//           expenses: {
//             type: 'object',
//             properties: {
//               planned: { type: 'number' },
//               actual: { type: 'number' },
//               diff: { type: 'number', description: 'Manfiy = tejaldi' },
//             },
//           },
//           income: {
//             type: 'object',
//             properties: {
//               planned: { type: 'number' },
//               actual: { type: 'number' },
//               diff: { type: 'number', description: "Musbat = ko'proq tushdi" },
//             },
//           },
//           expenseCategories: { type: 'array', items: CategorySchema },
//           incomeCategories: { type: 'array', items: CategorySchema },
//         },
//       },
//     },
//   },
// };


// // ... tepadagi importlar va schemalar o'z joyida qoladi

// // ... oldingi importlar ...
// import { CreateCategoryDto } from './dto/create-category.dto'; // turiga qarab tekshiring

// @ApiTags('Budget — Byudjet xulosasi')
// @Controller('budget')
// export class BudgetController {
//   constructor(private readonly budgetService: BudgetService) {}

//   /**
//    * 1. Mavjud ruxsat etilgan kategoriyalarni olish
//    */
//   @Get('categories')
//   @ApiOperation({ 
//     summary: "Mavjud kategoriyalar ro'yxatini olish", 
//     description: "Svodka varag'idan barcha xarajat va daromad kategoriyalarini dinamik o'qiydi." 
//   })
//   @ApiResponse({ 
//     status: 200, 
//     description: "Kategoriyalar ro'yxati",
//     schema: {
//       example: {
//         success: true,
//         data: {
//           expenses: ["Питание", "Транспорт", "Дом"],
//           income: ["Зарплата", "Премия"]
//         }
//       }
//     }
//   })
//   async getCategories() {
//     return await this.budgetService.getValidCategoriesFromSheets();
//   }

//   /**
//    * 2. Kategoriyani tekshirish va formatlash (Test uchun)
//    */
//   @Get('validate-category')
//   @ApiOperation({ 
//     summary: "Kategoriyani tekshirish", 
//     description: "Kiritilgan matnni Sheets-dagi original kategoriya nomiga mosligini tekshiradi." 
//   })
//   @ApiQuery({ name: 'name', example: 'питание' })
//   @ApiQuery({ name: 'type', enum: ['income', 'expense'] })
//   async validateCategory(
//     @Query('name') name: string,
//     @Query('type') type: 'income' | 'expense'
//   ) {
//     const validatedName = await this.budgetService.validateAndFormatCategory(name, type);
//     return { success: true, originalName: validatedName };
//   }

//   @Post('category')
//   @ApiOperation({ 
//     summary: "Yangi kategoriya qo'shish", 
//     description: "Svodka varag'iga yangi xarajat yoki daromad kategoriyasini yozadi." 
//   })
//   @ApiResponse({ status: 201, description: "Kategoriya muvaffaqiyatli qo'shildi" })
//   async addCategory(@Body() dto: CreateCategoryDto) {
//     return this.budgetService.addCategory(dto.name, dto.type);
//   }

//   @Get('summary')
//   @ApiOperation({ summary: 'Oylik byudjet xulosasi' })
//   @ApiResponse({ status: 200, ...SummaryResponseSchema })
//   getSummary(@Query() query: BudgetQueryDto) {
//     const now = new Date();
//     const month = query.month ?? now.getMonth() + 1;
//     const year = query.year ?? now.getFullYear();
//     return this.budgetService.getSummary(month, year);
//   }

//   @Get('full-report')
//   @ApiOperation({ 
//     summary: "Svodka varag'idagi barcha raqamlarni olish",
//     description: "Google Sheets-dagi formulalar hisoblab bergan tayyor natijalarni qaytaradi."
//   })
//   @ApiResponse({ status: 200, description: "Barcha ma'lumotlar muvaffaqiyatli olindi" })
//   async getFullReport() {
//     return await this.budgetService.getFullSvodka();
//   }

//   @Get('debug-formulas')
//   @ApiOperation({ summary: "Sheets formulalarini ko'rish (Faqat tahlil uchun)" })
//   async debug() {
//     return await this.budgetService.debugFormulas();
//   }

//   @Get('debug/full-raw-data')
//   @ApiOperation({ summary: "Xom ma'lumotlar va formulalar tahlili" })
//   async getFullRawData() {
//     return await this.budgetService.getRawSheetData();
//   }

//   @Get('full-audit')
//   @ApiOperation({ 
//     summary: "Svodka varag'ini to'liq tahlil qilish (A1:M44)", 
//     description: "Har bir katakning formulasi, turi va xatosini ko'rsatadi. Debug uchun eng kuchli metod." 
//   })
//   async getFullAudit() {
//     return await this.budgetService.getFullAuditData();
//   }

//   @Get('formulas-list')
// async getFormulasList() {
//   // Faqat [{cell: "D12", formula: "=..."}, ...] ko'rinishida qaytadi
//   return await this.budgetService.getOnlyFormulas();
// }
// }

# Personal Finance Tracking Backend - Project Overview

## 📁 Project Structure

```
web/
├── src/
│   ├── main.ts                          # Application entry point
│   ├── app.module.ts                    # Root module
│   │
│   ├── auth/                            # Authentication module
│   │   ├── api-key.guard.ts             # API Key authentication guard
│   │   ├── auth.controller.ts           # Auth endpoints
│   │   └── auth.module.ts               # Auth module definition
│   │
│   ├── common/                          # Shared utilities
│   │   ├── interfaces/
│   │   │   └── finance-record.interface.ts  # TypeScript interfaces
│   │   └── filters/
│   │       └── http-exception.filter.ts     # Global error handler
│   │
│   ├── finance/                       # Finance business logic
│   │   ├── dto/
│   │   │   └── finance-record.dto.ts      # Request validation DTOs
│   │   ├── finance.controller.ts          # Finance endpoints
│   │   ├── finance.service.ts             # Finance business logic
│   │   └── finance.module.ts              # Finance module definition
│   │
│   └── google-sheets/                 # Google Sheets integration
│       ├── google-sheets.service.ts       # Sheets API wrapper
│       └── google-sheets.module.ts        # Module definition
│
├── .env.example                       # Environment variables template
├── .env                               # Actual environment variables (gitignored)
├── SETUP.md                           # Detailed setup instructions
├── API.md                             # API documentation
└── package.json                       # Dependencies and scripts
```

## 🏗️ Architecture

### Modular Design

The application follows NestJS modular architecture with clear separation of concerns:

1. **AuthModule** - Handles API key authentication
2. **FinanceModule** - Manages income/expense operations
3. **GoogleSheetsModule** - Abstracts Google Sheets API interactions

### Data Flow

```
Client Request → ApiKeyGuard → Controller → Service → GoogleSheetsService → Google Sheets API
```

## 🔧 Core Components

### 1. GoogleSheetsService

**Location:** `src/google-sheets/google-sheets.service.ts`

**Responsibilities:**

- Direct Google Sheets API interaction
- Sheet creation and management
- CRUD operations on spreadsheet data
- Error handling and retry logic

**Key Methods:**

- `ensureSheetExists(sheetName)` - Auto-create monthly sheets
- `addRow(sheetName, rowData)` - Insert data
- `readSheet(sheetName)` - Fetch all data
- `updateRow(sheetName, rowIndex, rowData)` - Modify data
- `deleteRow(sheetName, rowIndex)` - Remove data
- `getFinanceRecords(sheetName)` - Parse rows to FinanceRecord objects
- `getCategories()` - Fetch categories from dedicated sheet

### 2. FinanceService

**Location:** `src/finance/finance.service.ts`

**Responsibilities:**

- Business logic for finance tracking
- Balance calculations
- Data validation and transformation

**Key Methods:**

- `addFinanceRecord(record)` - Add income/expense
- `getCurrentMonthRecords()` - Get current month data
- `getMonthRecords(year, month)` - Get specific month data
- `updateFinanceRecord(rowIndex, record)` - Update existing record
- `deleteFinanceRecord(rowIndex)` - Delete record
- `calculateBalance()` - Compute income - expense
- `getCategories()` - Retrieve category list

### 3. FinanceController

**Location:** `src/finance/finance.controller.ts`

**Endpoints:**

- `POST /api/finance` - Create record
- `GET /api/finance` - Current month records
- `GET /api/finance/month` - Specific month records
- `PUT /api/finance/:rowIndex` - Update record
- `DELETE /api/finance/:rowIndex` - Delete record
- `GET /api/finance/balance` - Balance summary
- `GET /api/finance/categories` - Categories list

### 4. ApiKeyGuard

**Location:** `src/auth/api-key.guard.ts`

**Purpose:** Simple authentication using API key in request headers

**Usage:**

```typescript
@UseGuards(ApiKeyGuard)
```

All finance endpoints are protected by this guard.

## 📊 Data Models

### FinanceRecord Interface

```typescript
{
  id: string;           // Auto-generated (row identifier)
  date: string;         // YYYY-MM-DD format
  amount: number;       // Positive number
  description: string;  // Transaction description
  category: string;     // e.g., "Salary", "Food"
  type: 'income' | 'expense';
  timestamp?: string;   // Optional creation timestamp
}
```

### Sheet Structure

**Monthly Sheets (YYYY-MM format):**

```
| Date       | Amount | Description    | Category | Type    |
|------------|--------|----------------|----------|---------|
| 2026-03-31 | 1000   | Monthly Salary | Salary   | income  |
| 2026-03-30 | 50     | Groceries      | Food     | expense |
```

**Categories Sheet:**

```
| Name       | Type     |
|------------|----------|
| Salary     | income   |
| Food       | expense  |
| Transport  | expense  |
```

## 🔐 Security

### API Key Authentication

- All endpoints require `x-api-key` header
- Key validated against `API_KEY` environment variable
- Simple but effective for single-admin use case

### Environment Variables

Stored in `.env` (never committed to git):

- `GOOGLE_SHEET_ID` - Target spreadsheet ID
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` - Service account email
- `GOOGLE_PRIVATE_KEY` - Service account private key
- `PORT` - Server port (default: 3000)
- `API_KEY` - Authentication key

## ⚠️ Error Handling

### Global Exception Filter

**Location:** `src/common/filters/http-exception.filter.ts`

Handles all uncaught exceptions and returns consistent error format:

```json
{
  "statusCode": 400,
  "timestamp": "2026-03-31T12:00:00.000Z",
  "path": "/api/finance",
  "message": "Failed to add finance record"
}
```

### Error Types Handled

- Google Sheets API errors
- Network failures
- Validation errors
- Not found errors
- Authentication errors

## 🔄 Dynamic Sheet Management

### Auto-Creation Logic

When accessing a monthly sheet:

1. Check if sheet exists (e.g., "2026-03")
2. If not, create it automatically
3. Add standard headers: Date, Amount, Description, Category, Type
4. Proceed with the requested operation

This ensures seamless month-to-month transitions without manual setup.

## 📝 Validation

### DTOs (Data Transfer Objects)

**Location:** `src/finance/dto/finance-record.dto.ts`

**CreateFinanceRecordDto:**

- `date`: required string
- `amount`: required number
- `description`: required string
- `category`: required string
- `type`: required enum ('income' | 'expense')

**UpdateFinanceRecordDto:**

- All fields optional (partial update)
- Same type constraints as create DTO

Validation powered by `class-validator` with global pipes in `main.ts`.

## 🚀 Getting Started

### Quick Start

1. Set up Google Cloud credentials (see SETUP.md)
2. Configure `.env` file
3. Install dependencies: `npm install`
4. Start dev server: `npm run start:dev`
5. Test with: `curl http://localhost:3000/api/finance -H "x-api-key: your_key"`

### Development Commands

```bash
npm run start       # Start production server
npm run start:dev   # Start with hot reload
npm run start:debug # Start with debug mode
npm run build       # Compile TypeScript
npm run test        # Run tests
npm run lint        # Fix code style
```

## 📦 Dependencies

### Production

- `@nestjs/common` - Core framework
- `@nestjs/core` - Core framework
- `@nestjs/config` - Configuration management
- `@nestjs/platform-express` - HTTP server
- `googleapis` - Google Sheets API client
- `class-validator` - Runtime validation
- `class-transformer` - Object transformation
- `dotenv` - Environment variables
- `rxjs` - Reactive extensions

### Development

- `@types/express` - Express type definitions
- `typescript` - Language support
- `ts-node` - TypeScript execution
- `jest` - Testing framework

## 🎯 Key Features

✅ **Modular Architecture** - Clean separation of concerns  
✅ **Type Safety** - Full TypeScript coverage  
✅ **Input Validation** - DTO-based validation  
✅ **Error Handling** - Global exception filter  
✅ **Auto Sheet Creation** - Dynamic monthly sheets  
✅ **Balance Calculation** - Real-time financial summary  
✅ **Category Management** - Dedicated categories sheet  
✅ **API Security** - Key-based authentication  
✅ **CORS Enabled** - Frontend integration ready  
✅ **Environment Config** - Easy deployment

## 🔮 Future Enhancements

Potential additions for scaling:

- Database migration option (PostgreSQL/MongoDB)
- User authentication with JWT
- Role-based access control
- Transaction categorization with ML
- Budget alerts and notifications
- Data export (CSV/PDF)
- Charts and analytics dashboard
- Multi-currency support
- Recurring transactions
- Bank API integration

## 📞 Support

For detailed setup instructions, see [SETUP.md](./SETUP.md)  
For API documentation, see [API.md](./API.md)

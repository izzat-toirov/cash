# Personal Finance Tracking API - To'liq Qo'llanma

## 📋 Loyiha haqida

Bu NestJS asosidagi backend API shaxsiy moliyani boshqarish uchun mo'ljallangan. Google Sheets bilan integratsiya orqali daromad va xarajatlarni hisobga oladi, byudjetlarni boshqaradi va moliyaviy hisobotlar tayyorlaydi.

## 🏗️ Arxitektura

### Modullar tuzilishi:

```
src/
├── auth/              # API kalit orqali autentifikatsiya
├── finance/           # Moliyaviy operatsiyalar (CRUD)
├── transactions/      # Tranzaksiyalar boshqaruvi
├── budget/           # Byudjet va svodka hisobotlari
├── google-sheets/    # Google Sheets API integratsiyasi
├── health/           # API salomatlik tekshiruvi
├── common/           # Umumiy interfeyslar va filterlar
└── app.module.ts     # Asosiy modul
```

## 🚀 Tezkor boshlash

### 1. O'rnatish
```bash
npm install
```

### 2. Muhit sozlash
`.env.example` faylini `.env` ga nusxalang va quyidagilarni to'ldiring:
```bash
cp .env.example .env
```

### 3. Ishga tushirish
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

### 4. Hujjatlar
Swagger hujjatlari: `http://localhost:3000/docs`

## 🔐 Autentifikatsiya

Barcha API endpointlari API kalit talab qiladi. So'rovga `x-api-key` header qo'shing:

```bash
curl -H "x-api-key: sizingiz_api_kaliti" http://localhost:3000/api/finance
```

## 📊 API Endpointlari

### Health Check
- `GET /api/health` - API ishlayotganini tekshirish

### Finance (Moliya)
- `GET /api/finance` - Joriy oy yozuvlari
- `POST /api/finance` - Yangi yozuv qo'shish
- `GET /api/finance/balance` - Balans hisobi
- `GET /api/finance/categories` - Kategoriyalar ro'yxati
- `GET /api/finance/records` - Filterlangan yozuvlar
- `GET /api/finance/month` - Aniq oy yozuvlari
- `PUT /api/finance/:id` - Yozuvni yangilash
- `DELETE /api/finance/:id` - Yozuvni o'chirish

### Transactions (Tranzaksiyalar)
- `POST /api/transactions` - Tranzaksiya yaratish
- `GET /api/transactions` - Tranzaksiyalarni olish (oy/ko'rsatkich bo'yicha)
- `GET /api/transactions/:id` - Bitta tranzaksiya
- `PATCH /api/transactions/:id` - Tranzaksiyani yangilash
- `DELETE /api/transactions/:id` - Tranzaksiyani o'chirish

### Budget (Byudjet)
- `GET /api/budget/summary` - Byudjet xulosasi
- `POST /api/budget/initial` - Boshlang'ich summa

## 📝 Ma'lumotlar tuzilishi

### FinanceRecord
```typescript
{
  id: string;           // "expense-row-5" formatida
  date: string;         // "YYYY-MM-DD"
  amount: number;       // Musbat son
  description: string;  // Tavsif
  category: string;     // Kategoriya
  type: 'income' | 'expense';
}
```

### Google Sheets tuzilishi
- **Oylik varaqlar**: "Yanvar 2026", "Fevral 2026" ...
- **Xarajatlar**: B:E ustunlari
- **Daromadlar**: G:J ustunlari
- **Svodka**: Umumiy byudjet xulosasi
- **Kategoriyalar**: Toifalar ro'yxati

## 🔧 Xususiyatlar

✅ **To'liq CRUD operatsiyalari**  
✅ **Google Sheets bilan avtomatik sinxronizatsiya**  
✅ **Oylik byudjet hisobotlari**  
✅ **Kategoriya boshqaruvi**  
✅ **API kalit bilan xavfsizlik**  
✅ **Swagger hujjatlari**  
✅ **CORS qo'llab-quvvatlashi**  
✅ **Global xatolikni boshqarish**  
✅ **Ma'lumotlarni validatsiya qilish**  

## 🛠️ Development

### Foydali buyruqlar
```bash
# Build
npm run build

# Test
npm run test

# Lint
npm run lint

# Format
npm run format
```

### Debug mode
```bash
npm run start:debug
```

## 📈 Monitoring

### Loglar
Ilova loglarini console'da kuzatishingiz mumkin. Har bir operatsiya qayd qilinadi.

### Health check
```bash
curl http://localhost:3000/api/health
```

## 🔮 Kelajakdagi imkoniyatlar

- User authentication with JWT
- Role-based access control
- Database integration option
- Real-time notifications
- Advanced analytics
- Mobile app support
- Export to PDF/Excel
- Recurring transactions
- Investment tracking

## 📞 Yordam

Qo'shimcha ma'lumot uchun:
- [API Documentation](./API.md)
- [Setup Guide](./SETUP.md)
- [Project Overview](./PROJECT_OVERVIEW.md)

## 📄 Litsenziya

Private project - All rights reserved.

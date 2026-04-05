# Quick Start Commands

## Prerequisites Check

```bash
# Verify Node.js version (should be 16+)
node --version

# Verify npm is working
npm --version
```

## Installation

```bash
# Install all dependencies
npm install

# Build the project
npm run build
```

## Environment Setup

```bash
# Copy environment template (if not done)
cp .env.example .env

# Edit .env with your credentials
# - GOOGLE_SHEET_ID
# - GOOGLE_SERVICE_ACCOUNT_EMAIL
# - GOOGLE_PRIVATE_KEY
# - API_KEY
```

## Running the Application

### Development Mode (with hot reload)

```bash
npm run start:dev
```

### Production Mode

```bash
npm run build
npm run start:prod
```

### Debug Mode

```bash
npm run start:debug
```

## Testing the API

### 1. Test Authentication

```bash
curl http://localhost:3000/api/auth/verify \
  -H "x-api-key: your_api_key_here"
```

Expected response: `{"authenticated": true}`

### 2. Add Income Record

```bash
curl -X POST http://localhost:3000/api/finance \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key_here" \
  -d '{
    "date": "2026-03-31",
    "amount": 2000,
    "description": "Monthly Salary",
    "category": "Salary",
    "type": "income"
  }'
```

### 3. Add Expense Record

```bash
curl -X POST http://localhost:3000/api/finance \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key_here" \
  -d '{
    "date": "2026-03-31",
    "amount": 50,
    "description": "Groceries",
    "category": "Food",
    "type": "expense"
  }'
```

### 4. Get All Records (Current Month)

```bash
curl http://localhost:3000/api/finance \
  -H "x-api-key: your_api_key_here"
```

### 5. Get Balance

```bash
curl http://localhost:3000/api/finance/balance \
  -H "x-api-key: your_api_key_here"
```

Expected response:

```json
{
  "totalIncome": 2000,
  "totalExpense": 50,
  "balance": 1950
}
```

### 6. Get Categories

```bash
curl http://localhost:3000/api/finance/categories \
  -H "x-api-key: your_api_key_here"
```

### 7. Update a Record

```bash
curl -X PUT http://localhost:3000/api/finance/2 \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key_here" \
  -d '{
    "amount": 75,
    "description": "Updated groceries"
  }'
```

### 8. Delete a Record

```bash
curl -X DELETE http://localhost:3000/api/finance/2 \
  -H "x-api-key: your_api_key_here"
```

### 9. Get Specific Month

```bash
curl "http://localhost:3000/api/finance/month?year=2026&month=3" \
  -H "x-api-key: your_api_key_here"
```

## Useful Commands

### Code Formatting

```bash
npm run format
```

### Linting

```bash
npm run lint
```

### Running Tests

```bash
npm run test
```

### End-to-End Tests

```bash
npm run test:e2e
```

### Test Coverage

```bash
npm run test:cov
```

## Clean Build

```bash
# Remove dist folder and rebuild
rm -rf dist
npm run build
```

## View Project Structure

```bash
# On Windows (Git Bash)
find src -type f -name "*.ts" | head -20

# On Linux/Mac
tree src -I 'node_modules|dist'
```

## Monitoring

### Watch Logs

The app logs to console. In development mode, you'll see:

- Server startup message
- Each request logged by NestJS
- Service-level logs (sheet operations)
- Error logs with details

### Expected Startup Output

```
Application is running on: http://localhost:3000
[Nest] XXXXX  - MM/DD/YYYY, HH:MM:SS AM     LOG [NestFactory] Starting Nest application...
[Nest] XXXXX  - MM/DD/YYYY, HH:MM:SS AM     LOG [InstanceLoader] AppModule dependencies initialized
[Nest] XXXXX  - MM/DD/YYYY, HH:MM:SS AM     LOG [InstanceLoader] FinanceModule dependencies initialized
[Nest] XXXXX  - MM/DD/YYYY, HH:MM:SS AM     LOG [InstanceLoader] GoogleSheetsModule dependencies initialized
```

## Common Issues

### Port Already in Use

```bash
# Change PORT in .env file
PORT=3001

# Or kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Module Not Found Errors

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

```bash
# Check TypeScript errors
npx tsc --noEmit

# Clean and rebuild
rm -rf dist
npm run build
```

## Next Steps

1. ✅ Set up Google Cloud credentials (see SETUP.md)
2. ✅ Configure Google Sheet (see GOOGLE_SHEET_SETUP.md)
3. ✅ Update .env file with your credentials
4. ✅ Run `npm install`
5. ✅ Run `npm run start:dev`
6. ✅ Test with curl commands above
7. ✅ Read API.md for complete endpoint documentation

## Additional Resources

- **SETUP.md** - Detailed Google Cloud setup
- **GOOGLE_SHEET_SETUP.md** - Sheet configuration
- **API.md** - Complete API documentation
- **PROJECT_OVERVIEW.md** - Architecture and features

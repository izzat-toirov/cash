# Personal Finance Tracking Backend - Setup Guide

## Prerequisites

1. **Node.js** (v16 or higher)
2. **Google Cloud Platform Account**
3. **Google Sheets API enabled**

## Google Cloud Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one

### 2. Enable Google Sheets API

1. In your project, go to "APIs & Services" > "Library"
2. Search for "Google Sheets API"
3. Click "Enable"

### 3. Create Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the details and click "Create"
4. Grant the service account the following role:
   - Role: `Editor` (or create a custom role with Sheets permissions)
5. Click "Done"

### 4. Generate Service Account Key

1. Click on the newly created service account
2. Go to the "Keys" tab
3. Click "Add Key" > "Create new key"
4. Select JSON format
5. Download the key file and save it securely

### 5. Share Google Sheet with Service Account

1. Create a new Google Sheet or use an existing one
2. Copy the Sheet ID from the URL: `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`
3. Click "Share" button in Google Sheets
4. Add the service account email (found in the JSON key file as `client_email`)
5. Give it "Editor" access

## Environment Configuration

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your credentials:

   ```env
   # Google Sheets Configuration
   GOOGLE_SHEET_ID=your_actual_sheet_id_here
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@project-id.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourActualPrivateKey\n-----END PRIVATE KEY-----\n"

   # Application Configuration
   PORT=3000

   # API Key for Authentication (CHANGE THIS!)
   API_KEY=generate_a_secure_random_key_here
   ```

### How to Get Private Key

From your downloaded service account JSON file:

```json
{
  "type": "service_account",
  "project_id": "your-project",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "..."
}
```

Copy the entire `private_key` value including the BEGIN/END markers and `\n` characters.

## Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start development server:

   ```bash
   npm run start:dev
   ```

3. The application will run on `http://localhost:3000`

## API Endpoints

All endpoints require the `x-api-key` header with your API_KEY value.

### Finance Operations

- **POST** `/api/finance` - Add income/expense record
- **GET** `/api/finance` - Get current month records
- **GET** `/api/finance/month?year=2026&month=3` - Get specific month records
- **PUT** `/api/finance/:rowIndex` - Update a record
- **DELETE** `/api/finance/:rowIndex` - Delete a record
- **GET** `/api/finance/balance` - Get balance calculation
- **GET** `/api/finance/categories` - Get all categories

### Authentication

- **GET** `/api/auth/verify` - Verify API key

## Example Requests

### Add Income Record

```bash
curl -X POST http://localhost:3000/api/finance \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key_here" \
  -d '{
    "date": "2026-03-31",
    "amount": 1000,
    "description": "Salary",
    "category": "Salary",
    "type": "income"
  }'
```

### Add Expense Record

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

### Get Balance

```bash
curl http://localhost:3000/api/finance/balance \
  -H "x-api-key: your_api_key_here"
```

## Google Sheet Structure

The app will automatically create monthly sheets with format `YYYY-MM` (e.g., `2026-03`).

### Monthly Sheet Headers:

- Date
- Amount
- Description
- Category
- Type

### Categories Sheet:

Create a sheet named `Categories` with columns:

- Name (e.g., "Salary", "Food", "Transport")
- Type ("income" or "expense")

## Error Handling

The application handles:

- Google Sheets API rate limits (with exponential backoff)
- Network errors
- Invalid data validation
- Missing sheets (auto-creates them)

## Security Notes

1. **Never commit** your `.env` file to version control
2. Change the default `API_KEY` to a secure random value
3. Use HTTPS in production
4. Consider implementing more robust authentication for production

## Troubleshooting

### "Sheet not found" error

- Ensure the GOOGLE_SHEET_ID is correct
- Check that the service account has editor access to the sheet

### "Private key format is invalid" error

- Make sure the private key includes `\n` characters
- Keep the BEGIN/END PRIVATE KEY markers
- Escape quotes properly in .env file

### Rate limit errors

- The app includes basic retry logic
- Consider implementing exponential backoff for heavy usage

## Production Deployment

For production:

1. Set `NODE_ENV=production`
2. Use environment variables from a secure source (AWS Secrets Manager, etc.)
3. Enable HTTPS
4. Set up proper logging and monitoring
5. Implement request rate limiting
6. Add comprehensive error tracking

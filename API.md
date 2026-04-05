# Personal Finance Tracking API

Base URL: `http://localhost:3000/api`

All endpoints require authentication via API Key in the header:

```
x-api-key: your_api_key_here
```

## Authentication

### Verify API Key

```http
GET /api/auth/verify
Headers:
  x-api-key: your_api_key_here
```

**Response:**

```json
{
  "authenticated": true
}
```

---

## Finance Endpoints

### Add Finance Record (Income/Expense)

```http
POST /api/finance
Headers:
  Content-Type: application/json
  x-api-key: your_api_key_here
Body:
  {
    "date": "2026-03-31",
    "amount": 1000,
    "description": "Monthly Salary",
    "category": "Salary",
    "type": "income"
  }
```

**Response:** `201 Created`

**Validation:**

- `date`: string (required) - Format: YYYY-MM-DD
- `amount`: number (required) - Positive number
- `description`: string (required)
- `category`: string (required)
- `type`: "income" | "expense" (required)

---

### Get Current Month Records

```http
GET /api/finance
Headers:
  x-api-key: your_api_key_here
```

**Response:**

```json
[
  {
    "id": "row-2",
    "date": "2026-03-31",
    "amount": 1000,
    "description": "Monthly Salary",
    "category": "Salary",
    "type": "income"
  },
  {
    "id": "row-3",
    "date": "2026-03-30",
    "amount": 50,
    "description": "Groceries",
    "category": "Food",
    "type": "expense"
  }
]
```

---

### Get Specific Month Records

```http
GET /api/finance/month?year=2026&month=3
Headers:
  x-api-key: your_api_key_here
```

**Query Parameters:**

- `year`: number (required) - e.g., 2026
- `month`: number (required) - e.g., 3 for March

**Response:** Same as "Get Current Month Records"

---

### Update Finance Record

```http
PUT /api/finance/:rowIndex
Headers:
  Content-Type: application/json
  x-api-key: your_api_key_here
Body:
  {
    "amount": 75,
    "description": "Updated groceries"
  }
```

**Path Parameters:**

- `rowIndex`: number (required) - The row number in the sheet (starting from 2, as row 1 is headers)

**Response:** `200 OK`

**Note:** Only include fields you want to update. Unspecified fields remain unchanged.

---

### Delete Finance Record

```http
DELETE /api/finance/:rowIndex
Headers:
  x-api-key: your_api_key_here
```

**Path Parameters:**

- `rowIndex`: number (required) - The row number in the sheet (starting from 2)

**Response:** `200 OK`

---

### Get Balance Calculation

```http
GET /api/finance/balance
Headers:
  x-api-key: your_api_key_here
```

**Response:**

```json
{
  "totalIncome": 1500,
  "totalExpense": 450,
  "balance": 1050
}
```

**Fields:**

- `totalIncome`: Total income for current month
- `totalExpense`: Total expense for current month
- `balance`: `totalIncome - totalExpense`

---

### Get Categories

```http
GET /api/finance/categories
Headers:
  x-api-key: your_api_key_here
```

**Response:**

```json
[
  {
    "name": "Salary",
    "type": "income"
  },
  {
    "name": "Food",
    "type": "expense"
  },
  {
    "name": "Transport",
    "type": "expense"
  }
]
```

**Note:** Categories are fetched from a dedicated "Categories" sheet in your Google Sheet.

---

## Error Responses

### 400 Bad Request

```json
{
  "statusCode": 400,
  "timestamp": "2026-03-31T12:00:00.000Z",
  "path": "/api/finance",
  "message": "Failed to add finance record"
}
```

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "timestamp": "2026-03-31T12:00:00.000Z",
  "path": "/api/finance",
  "message": "Unauthorized"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "timestamp": "2026-03-31T12:00:00.000Z",
  "path": "/api/finance/999",
  "message": "Record not found"
}
```

### 500 Internal Server Error

```json
{
  "statusCode": 500,
  "timestamp": "2026-03-31T12:00:00.000Z",
  "path": "/api/finance",
  "message": "Internal server error"
}
```

---

## Rate Limiting

The Google Sheets API has rate limits. The application handles retries automatically, but for heavy usage:

- Free tier: 100 requests per 100 seconds
- G Suite: 500 requests per 100 seconds

Consider implementing request queuing for bulk operations.

---

## Example Usage with cURL

### Add Income

```bash
curl -X POST http://localhost:3000/api/finance \
  -H "Content-Type: application/json" \
  -H "x-api-key: my_secure_key" \
  -d '{
    "date": "2026-03-31",
    "amount": 2000,
    "description": "Freelance work",
    "category": "Freelance",
    "type": "income"
  }'
```

### Add Expense

```bash
curl -X POST http://localhost:3000/api/finance \
  -H "Content-Type: application/json" \
  -H "x-api-key: my_secure_key" \
  -d '{
    "date": "2026-03-31",
    "amount": 25,
    "description": "Bus ticket",
    "category": "Transport",
    "type": "expense"
  }'
```

### Get Balance

```bash
curl http://localhost:3000/api/finance/balance \
  -H "x-api-key: my_secure_key"
```

### Get All Records

```bash
curl http://localhost:3000/api/finance \
  -H "x-api-key: my_secure_key"
```

### Update Record

```bash
curl -X PUT http://localhost:3000/api/finance/3 \
  -H "Content-Type: application/json" \
  -H "x-api-key: my_secure_key" \
  -d '{
    "amount": 30,
    "description": "Updated bus fare"
  }'
```

### Delete Record

```bash
curl -X DELETE http://localhost:3000/api/finance/3 \
  -H "x-api-key: my_secure_key"
```

# Google Sheets Setup Guide

## Quick Setup Steps

### 1. Create Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click "+ Blank" to create a new spreadsheet
3. Name it something like "Personal Finance Tracker"
4. Copy the Sheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/1aBcDeFgHiJkLmNoPqRsTuVwXyZ/edit
                                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                       This is your SHEET_ID
   ```

### 2. Create Categories Sheet

1. In your spreadsheet, click the "+" button at the bottom to add a new sheet
2. Rename it to `Categories` (exactly as written)
3. Add the following headers in row 1:
   - A1: `Name`
   - B1: `Type`

4. Add sample categories:
   ```
   | Name       | Type     |
   |------------|----------|
   | Salary     | income   |
   | Freelance  | income   |
   | Investments| income   |
   | Food       | expense  |
   | Transport  | expense  |
   | Utilities  | expense  |
   | Entertainment | expense |
   | Shopping   | expense  |
   | Health     | expense  |
   ```

### 3. Monthly Sheets (Auto-Created)

The app will automatically create monthly sheets with format `YYYY-MM` (e.g., `2026-03`).

Each monthly sheet will have these headers:

```
| Date       | Amount | Description    | Category | Type    |
|------------|--------|----------------|----------|---------|
| 2026-03-31 | 1000   | Monthly Salary | Salary   | income  |
```

You don't need to create these manually - the app handles it!

### 4. Share with Service Account

1. Click the "Share" button in your Google Sheet
2. Add your service account email:
   ```
   your-service-account@your-project-id.iam.gserviceaccount.com
   ```
3. Give it "Editor" access
4. Click "Done"

### 5. Update .env File

Add your Sheet ID to the `.env` file:

```env
GOOGLE_SHEET_ID=1aBcDeFgHiJkLmNoPqRsTuVwXyZ
```

## Example Structure

Your final spreadsheet should look like this:

**Tabs (at bottom):**

- `Categories` (you create this)
- `2026-03` (auto-created by app when you add first record)
- `2026-04` (auto-created next month)
- etc.

## Testing the Setup

After completing the setup, test with this curl command:

```bash
curl -X POST http://localhost:3000/api/finance \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key_here" \
  -d '{
    "date": "2026-03-31",
    "amount": 100,
    "description": "Test transaction",
    "category": "Food",
    "type": "expense"
  }'
```

Then check your Google Sheet - you should see:

1. A new sheet named `2026-03` was created automatically
2. Headers were added: Date, Amount, Description, Category, Type
3. Your test data was added in row 2

## Troubleshooting

### "Sheet not found" error

- ✅ Check that GOOGLE_SHEET_ID in .env matches your sheet's ID
- ✅ Verify the service account has Editor access
- ✅ Make sure the sheet is shared with the correct service account email

### "Permission denied" error

- ✅ Ensure the service account has at least "Editor" access
- ✅ Try removing and re-adding the service account with proper permissions

### No data appearing in sheet

- ✅ Check that your .env file has the correct private key format
- ✅ Verify the service account email matches the one you shared the sheet with
- ✅ Check the app logs for specific error messages

### Monthly sheet not auto-creating

- ✅ The app creates sheets on-demand when you add the first record
- ✅ Try adding a finance record via the API
- ✅ Check app logs for any Google API errors

## Best Practices

1. **Don't edit monthly sheets manually** - Let the app manage them
2. **Keep Categories sheet updated** - Add/remove categories as needed
3. **Backup regularly** - Export your sheet periodically (File → Download)
4. **Don't delete headers** - The app expects specific column structure
5. **Use consistent date format** - YYYY-MM-DD works best

## Advanced: Pre-create Monthly Sheets

If you want to pre-create sheets for future months:

1. Click "+" to add a new sheet
2. Name it with format `YYYY-MM` (e.g., `2026-04`)
3. Add headers in row 1:
   - A1: `Date`
   - B1: `Amount`
   - C1: `Description`
   - D1: `Category`
   - E1: `Type`

But remember, the app will do this automatically when needed!

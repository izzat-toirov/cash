export interface FinanceRecord {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  timestamp?: string;
  isPlanned?: boolean;
}

export interface SheetData {
  sheetName: string;
  headers: string[];
  rows: any[][];
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
}

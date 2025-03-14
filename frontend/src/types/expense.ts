export type ExpenseCategory = 
  | 'Food & Dining'
  | 'Transportation'
  | 'Utilities'
  | 'Housing'
  | 'Entertainment'
  | 'Healthcare'
  | 'Shopping'
  | 'Personal Care'
  | 'Education'
  | 'Travel'
  | 'Other';

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: ExpenseCategory;
  date: string; // ISO format date string
  createdAt: string; // ISO format date string
}

export interface ExpenseFilter {
  startDate?: string;
  endDate?: string;
  category?: ExpenseCategory;
  minAmount?: number;
  maxAmount?: number;
  searchText?: string;
}
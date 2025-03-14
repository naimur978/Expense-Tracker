import { Expense } from '../types/expense';

const EXPENSES_STORAGE_KEY = 'expense-tracker-expenses';

/**
 * Save expenses to local storage
 * @param expenses Array of expense objects to save
 */
export const saveExpenses = (expenses: Expense[]): void => {
  try {
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
  } catch (error) {
    console.error('Failed to save expenses to local storage:', error);
  }
};

/**
 * Load expenses from local storage
 * @returns Array of expenses or empty array if none found
 */
export const loadExpenses = (): Expense[] => {
  try {
    const expensesJson = localStorage.getItem(EXPENSES_STORAGE_KEY);
    if (!expensesJson) return [];
    return JSON.parse(expensesJson);
  } catch (error) {
    console.error('Failed to load expenses from local storage:', error);
    return [];
  }
};

/**
 * Clear all expenses from local storage
 */
export const clearExpenses = (): void => {
  try {
    localStorage.removeItem(EXPENSES_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear expenses from local storage:', error);
  }
};
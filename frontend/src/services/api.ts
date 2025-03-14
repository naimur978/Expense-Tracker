import { Expense } from '../types/expense';

const API_BASE_URL = 'http://localhost:8001/api';

export const api = {
  async getExpenses() {
    try {
      const response = await fetch(`${API_BASE_URL}/expenses/`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      // Convert string amounts to numbers
      return data.results.map((expense: any) => ({
        ...expense,
        amount: Number(expense.amount)
      }));
    } catch (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }
  },

  async createExpense(expense: Omit<Expense, 'id' | 'createdAt'>) {
    // Format the amount as a string with 2 decimal places
    const formattedExpense = {
      ...expense,
      amount: expense.amount.toFixed(2),
      // Date is already in YYYY-MM-DD format from the form
    };

    const response = await fetch(`${API_BASE_URL}/expenses/`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedExpense),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || 'Failed to create expense');
    }
    
    const data = await response.json();
    // Convert amount to number when receiving response
    return {
      ...data,
      amount: Number(data.amount)
    };
  },

  async updateExpense(id: string, expense: Omit<Expense, 'id' | 'createdAt'>) {
    // Format the amount as a string with 2 decimal places
    const formattedExpense = {
      ...expense,
      amount: expense.amount.toFixed(2),
      // Date is already in YYYY-MM-DD format from the form
    };

    const response = await fetch(`${API_BASE_URL}/expenses/${id}/`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedExpense),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || 'Failed to update expense');
    }
    
    const data = await response.json();
    // Convert amount to number when receiving response
    return {
      ...data,
      amount: Number(data.amount)
    };
  },

  async deleteExpense(id: string) {
    const response = await fetch(`${API_BASE_URL}/expenses/${id}/`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || 'Failed to delete expense');
    }
  },

  async getExpenseSummary(timeframe: 'weekly' | 'monthly' | 'yearly' = 'monthly') {
    const response = await fetch(`${API_BASE_URL}/expenses/summary/?timeframe=${timeframe}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || 'Failed to fetch expense summary');
    }
    
    const data = await response.json();
    // Convert amounts to numbers in summary data
    return {
      ...data,
      category_totals: data.category_totals.map((item: any) => ({
        ...item,
        total: Number(item.total)
      })),
      time_series: data.time_series.map((item: any) => ({
        ...item,
        total: Number(item.total)
      }))
    };
  }
};
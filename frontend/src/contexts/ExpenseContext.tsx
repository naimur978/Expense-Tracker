import React, { createContext, useReducer, useContext, ReactNode, useEffect } from 'react';
import { Expense, ExpenseFilter } from '../types/expense';
import { api } from '../services/api';

// Define the state structure
interface ExpenseState {
  expenses: Expense[];
  filteredExpenses: Expense[];
  filter: ExpenseFilter;
  loading: boolean;
  error: string | null;
}

// Define action types
type ExpenseAction =
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'EDIT_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'SET_FILTER'; payload: ExpenseFilter }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOAD_EXPENSES'; payload: Expense[] };

// Initial state
const initialState: ExpenseState = {
  expenses: [],
  filteredExpenses: [],
  filter: {},
  loading: false,
  error: null
};

// Create context
export const ExpenseContext = createContext<{
  state: ExpenseState;
  dispatch: React.Dispatch<ExpenseAction>;
  loadExpenses: () => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
}>({
  state: initialState,
  dispatch: () => null,
  loadExpenses: async () => {},
  addExpense: async () => {},
  updateExpense: async () => {},
  deleteExpense: async () => {}
});

// Expense reducer
const expenseReducer = (state: ExpenseState, action: ExpenseAction): ExpenseState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'ADD_EXPENSE':
      const updatedExpenses = [...state.expenses, action.payload];
      return {
        ...state,
        expenses: updatedExpenses,
        filteredExpenses: applyFilter(updatedExpenses, state.filter)
      };
    case 'EDIT_EXPENSE':
      const editedExpenses = state.expenses.map(expense => 
        expense.id === action.payload.id ? action.payload : expense
      );
      return {
        ...state,
        expenses: editedExpenses,
        filteredExpenses: applyFilter(editedExpenses, state.filter)
      };
    case 'DELETE_EXPENSE':
      const remainingExpenses = state.expenses.filter(expense => expense.id !== action.payload);
      return {
        ...state,
        expenses: remainingExpenses,
        filteredExpenses: applyFilter(remainingExpenses, state.filter)
      };
    case 'SET_FILTER':
      return {
        ...state,
        filter: action.payload,
        filteredExpenses: applyFilter(state.expenses, action.payload)
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'LOAD_EXPENSES':
      return {
        ...state,
        expenses: action.payload,
        filteredExpenses: applyFilter(action.payload, state.filter),
        loading: false
      };
    default:
      return state;
  }
};

// Helper function to apply filters
const applyFilter = (expenses: Expense[], filter: ExpenseFilter): Expense[] => {
  return expenses.filter(expense => {
    if (filter.startDate && new Date(expense.date) < new Date(filter.startDate)) {
      return false;
    }
    if (filter.endDate && new Date(expense.date) > new Date(filter.endDate)) {
      return false;
    }
    if (filter.category && expense.category !== filter.category) {
      return false;
    }
    if (filter.minAmount !== undefined && expense.amount < filter.minAmount) {
      return false;
    }
    if (filter.maxAmount !== undefined && expense.amount > filter.maxAmount) {
      return false;
    }
    if (filter.searchText && !expense.description.toLowerCase().includes(filter.searchText.toLowerCase())) {
      return false;
    }
    return true;
  });
};

// Provider component
export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(expenseReducer, initialState);

  const loadExpenses = async () => {
    if (state.loading) return; // Prevent multiple simultaneous loads
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await api.getExpenses();
      // Handle paginated response
      const expenses = Array.isArray(response) ? response : response.results || [];
      dispatch({ type: 'LOAD_EXPENSES', payload: expenses });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load expenses' });
    }
  };

  const addExpense = async (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    try {
      const newExpense = await api.createExpense(expense);
      dispatch({ type: 'ADD_EXPENSE', payload: newExpense });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add expense' });
    }
  };

  const updateExpense = async (expense: Expense) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    try {
      const updatedExpense = await api.updateExpense(expense.id, expense);
      dispatch({ type: 'EDIT_EXPENSE', payload: updatedExpense });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update expense' });
    }
  };

  const deleteExpense = async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    try {
      await api.deleteExpense(id);
      dispatch({ type: 'DELETE_EXPENSE', payload: id });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete expense' });
    }
  };

  // Load expenses when component mounts
  useEffect(() => {
    loadExpenses();
  }, []);

  return (
    <ExpenseContext.Provider value={{ 
      state, 
      dispatch,
      loadExpenses,
      addExpense,
      updateExpense,
      deleteExpense
    }}>
      {children}
    </ExpenseContext.Provider>
  );
};

// Custom hook for using the expense context
export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};
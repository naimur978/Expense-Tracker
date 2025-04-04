import React from 'react';
import { render, screen, waitFor } from '../utils/test-utils';
import '@testing-library/jest-dom';
import { useExpense } from './ExpenseContext';
import { api } from '../services/api';
import userEvent from '@testing-library/user-event';

// Mock the API
jest.mock('../services/api', () => ({
  api: {
    getExpenses: jest.fn(),
    createExpense: jest.fn(),
    updateExpense: jest.fn(),
    deleteExpense: jest.fn(),
    getExpenseSummary: jest.fn()
  }
}));

const mockExpense = {
  id: '1',
  amount: 100,
  description: 'Test Expense',
  category: 'Food & Dining' as const,
  date: '2024-01-01',
  createdAt: '2024-01-01T00:00:00.000Z'
};

// Test component that uses the context
const TestComponent: React.FC = () => {
  const { state, loadExpenses, addExpense, updateExpense, deleteExpense, dispatch } = useExpense();
  
  return (
    <div>
      <div data-testid="loading">{state.loading.toString()}</div>
      <div data-testid="error">{state.error || 'no error'}</div>
      <div data-testid="expense-count">{state.expenses.length}</div>
      <div data-testid="filtered-count">{state.filteredExpenses.length}</div>
      <button onClick={() => loadExpenses()}>Load</button>
      <button onClick={() => addExpense(mockExpense)}>Add</button>
      <button onClick={() => updateExpense(mockExpense)}>Update</button>
      <button onClick={() => deleteExpense('1')}>Delete</button>
      <button onClick={() => dispatch({ type: 'SET_FILTER', payload: { category: 'Food & Dining' } })}>
        Filter
      </button>
      <button onClick={() => dispatch({ type: 'CLEAR_ERROR' })}>Clear Error</button>
    </div>
  );
};

describe('ExpenseContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('access_token', 'test-token');
    (api.getExpenses as jest.Mock).mockResolvedValue([]);
  });

  it('provides initial state', async () => {
    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('error')).toHaveTextContent('no error');
      expect(screen.getByTestId('expense-count')).toHaveTextContent('0');
      expect(screen.getByTestId('filtered-count')).toHaveTextContent('0');
    });
  });

  it('loads expenses successfully', async () => {
    (api.getExpenses as jest.Mock).mockResolvedValueOnce([mockExpense]);
    
    render(<TestComponent />);
    
    await waitFor(() => {
      expect(screen.getByTestId('expense-count')).toHaveTextContent('1');
      expect(screen.getByTestId('filtered-count')).toHaveTextContent('1');
    });
  });

  it('handles load expenses error', async () => {
    const errorMessage = 'Failed to load expenses';
    (api.getExpenses as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));
    
    render(<TestComponent />);
    
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent(errorMessage);
    });
  });

  it('adds expense successfully', async () => {
    (api.createExpense as jest.Mock).mockResolvedValueOnce(mockExpense);
    const user = userEvent.setup();
    
    render(<TestComponent />);
    await user.click(screen.getByText('Add'));
    
    await waitFor(() => {
      expect(api.createExpense).toHaveBeenCalledWith(mockExpense);
      expect(screen.getByTestId('expense-count')).toHaveTextContent('1');
    });
  });

  it('updates expense successfully', async () => {
    (api.updateExpense as jest.Mock).mockResolvedValueOnce(mockExpense);
    (api.getExpenses as jest.Mock).mockResolvedValueOnce([mockExpense]);
    
    const user = userEvent.setup();
    render(<TestComponent />);
    
    await waitFor(() => {
      expect(screen.getByTestId('expense-count')).toHaveTextContent('1');
    });
    
    await user.click(screen.getByText('Update'));
    expect(api.updateExpense).toHaveBeenCalledWith(mockExpense.id, mockExpense);
  });

  it('deletes expense successfully', async () => {
    (api.deleteExpense as jest.Mock).mockResolvedValueOnce(undefined);
    (api.getExpenses as jest.Mock).mockResolvedValueOnce([mockExpense]);
    
    const user = userEvent.setup();
    render(<TestComponent />);
    
    await waitFor(() => {
      expect(screen.getByTestId('expense-count')).toHaveTextContent('1');
    });
    
    await user.click(screen.getByText('Delete'));
    expect(api.deleteExpense).toHaveBeenCalledWith('1');
  });

  it('filters expenses correctly', async () => {
    const expenses = [
      mockExpense,
      { 
        ...mockExpense, 
        id: '2',
        category: 'Transportation',
        description: 'Test Expense 2'
      }
    ];
    
    (api.getExpenses as jest.Mock).mockResolvedValueOnce(expenses);
    
    const user = userEvent.setup();
    render(<TestComponent />);
    
    await waitFor(() => {
      expect(screen.getByTestId('expense-count')).toHaveTextContent('2');
      expect(screen.getByTestId('filtered-count')).toHaveTextContent('2');
    });
    
    await user.click(screen.getByText('Filter'));
    
    await waitFor(() => {
      expect(screen.getByTestId('filtered-count')).toHaveTextContent('1');
    });
  });

  it('clears error state', async () => {
    const errorMessage = 'Failed to load expenses';
    (api.getExpenses as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));
    
    const user = userEvent.setup();
    render(<TestComponent />);
    
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent(errorMessage);
    });
    
    await user.click(screen.getByText('Clear Error'));
    
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('no error');
    });
  });
});
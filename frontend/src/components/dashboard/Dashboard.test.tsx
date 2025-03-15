import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { ExpenseProvider } from '../../contexts/ExpenseContext';
import Dashboard from './Dashboard';
import { api } from '../../services/api';

// Mock the API module
jest.mock('../../services/api');

const mockExpenses = [
  {
    id: '1',
    description: 'Test Expense 1',
    amount: 100,
    date: '2023-06-15',
    category: 'Food & Dining',
    createdAt: '2023-06-15T12:00:00Z'
  },
  {
    id: '2',
    description: 'Test Expense 2',
    amount: 200,
    date: '2023-06-14',
    category: 'Transportation',
    createdAt: '2023-06-14T12:00:00Z'
  }
];

const mockSummaryData = {
  category_totals: [
    { category: 'Food & Dining', total: 100 },
    { category: 'Transportation', total: 200 }
  ],
  time_series: []
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup API mock implementations
    (api.getExpenses as jest.Mock).mockResolvedValue(mockExpenses);
    (api.getExpenseSummary as jest.Mock).mockResolvedValue(mockSummaryData);
  });

  it('renders loading state initially', async () => {
    await act(async () => {
      render(
        <ExpenseProvider>
          <Dashboard />
        </ExpenseProvider>
      );
    });

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('displays expense summary after loading', async () => {
    await act(async () => {
      render(
        <ExpenseProvider>
          <Dashboard />
        </ExpenseProvider>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Total Expenses')).toBeInTheDocument();
      expect(screen.getByText('$300.00')).toBeInTheDocument(); // Sum of mock expenses
    });
  });

  it('displays error message when API fails', async () => {
    // Mock API error
    (api.getExpenseSummary as jest.Mock).mockRejectedValue(new Error('API Error'));

    await act(async () => {
      render(
        <ExpenseProvider>
          <Dashboard />
        </ExpenseProvider>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to load expense summary')).toBeInTheDocument();
    });
  });

  it('shows top spending categories', async () => {
    await act(async () => {
      render(
        <ExpenseProvider>
          <Dashboard />
        </ExpenseProvider>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Transportation')).toBeInTheDocument();
      expect(screen.getByText('Food & Dining')).toBeInTheDocument();
    });
  });
});
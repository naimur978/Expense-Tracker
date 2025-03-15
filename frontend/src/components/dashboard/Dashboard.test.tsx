import React from 'react';
import { render, screen, waitFor } from '../../utils/test-utils';
import Dashboard from './Dashboard';
import { api } from '../../services/api';

jest.mock('../../services/api', () => ({
  api: {
    getExpenses: jest.fn(),
    createExpense: jest.fn(),
    updateExpense: jest.fn(),
    deleteExpense: jest.fn(),
    getExpenseSummary: jest.fn()
  }
}));

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
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('access_token', 'test-token');
    (api.getExpenses as jest.Mock).mockResolvedValue(mockExpenses);
    (api.getExpenseSummary as jest.Mock).mockResolvedValue(mockSummaryData);
  });

  it('renders loading state initially', async () => {
    render(<Dashboard />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('displays expense summary after loading', async () => {
    const { rerender } = render(<Dashboard />);

    // Wait for expense data to load
    await waitFor(() => {
      expect(screen.getByText('Total Expenses')).toBeInTheDocument();
    });

    // Rerender to ensure state updates are applied
    rerender(<Dashboard />);

    // Now check for specific values
    await waitFor(() => {
      const totalElement = screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === 'h3' && content.includes('300.00');
      });
      expect(totalElement).toBeInTheDocument();
      expect(screen.getByText('Transportation')).toBeInTheDocument();
      expect(screen.getByText('Food & Dining')).toBeInTheDocument();
    });
  });

  it('displays error message when API fails', async () => {
    (api.getExpenseSummary as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load expense summary')).toBeInTheDocument();
    });
  });

  it('shows transaction count', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });
});
import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExpenseList from './ExpenseList';
import { render } from '../../utils/test-utils';

// Mock the useExpense hook
jest.mock('../../contexts/ExpenseContext', () => {
  const originalModule = jest.requireActual('../../contexts/ExpenseContext');
  return {
    __esModule: true,
    ...originalModule,
    useExpense: () => ({
      state: {
        expenses: [
          {
            id: '1',
            amount: 100,
            description: 'Test Expense 1',
            category: 'Food & Dining',
            date: '2024-01-01',
            createdAt: '2024-01-01T00:00:00.000Z'
          },
          {
            id: '2',
            amount: 200,
            description: 'Test Expense 2',
            category: 'Transportation',
            date: '2024-01-02',
            createdAt: '2024-01-02T00:00:00.000Z'
          }
        ],
        filteredExpenses: [
          {
            id: '1',
            amount: 100,
            description: 'Test Expense 1',
            category: 'Food & Dining',
            date: '2024-01-01',
            createdAt: '2024-01-01T00:00:00.000Z'
          },
          {
            id: '2',
            amount: 200,
            description: 'Test Expense 2',
            category: 'Transportation',
            date: '2024-01-02',
            createdAt: '2024-01-02T00:00:00.000Z'
          }
        ],
        filter: {},
        loading: false,
        error: null
      },
      dispatch: jest.fn()
    })
  };
});

describe('ExpenseList Component', () => {
  test('renders expense list with data', () => {
    render(<ExpenseList />);

    expect(screen.getByText('Expenses')).toBeInTheDocument();
    expect(screen.getByText('Test Expense 1')).toBeInTheDocument();
    expect(screen.getByText('Test Expense 2')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.getByText('$200.00')).toBeInTheDocument();
  });

  test('renders filter section', () => {
    render(<ExpenseList />);

    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByLabelText(/Search/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Start Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/End Date/i)).toBeInTheDocument();
  });

  test('opens expense form when Add Expense button is clicked', () => {
    render(<ExpenseList />);

    const addButton = screen.getByText('Add Expense');
    fireEvent.click(addButton);

    expect(screen.getByText('Add New Expense')).toBeInTheDocument();
  });

  test('renders empty state when no expenses', () => {
    jest.spyOn(React, 'useContext').mockImplementation(() => ({
      state: {
        expenses: [],
        filteredExpenses: [],
        filter: {},
        loading: false,
        error: null
      },
      dispatch: jest.fn()
    }));

    render(<ExpenseList />);

    expect(screen.getByText('No expenses found. Add a new expense to get started!')).toBeInTheDocument();
  });
});
import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import ExpenseList from './ExpenseList';
import { ExpenseContext } from '../../contexts/ExpenseContext';
import { Expense } from '../../types/expense';

// Mock the ExpenseContext
const mockExpenses: Expense[] = [
  {
    id: '1',
    description: 'Groceries',
    amount: 50.75,
    date: '2023-06-15',
    category: 'Food & Dining',
    createdAt: '2023-06-15T12:00:00Z'
  },
  {
    id: '2',
    description: 'Gas',
    amount: 35.50,
    date: '2023-06-14',
    category: 'Transportation',
    createdAt: '2023-06-14T14:30:00Z'
  }
];

const mockDeleteExpense = jest.fn();
const mockDispatch = jest.fn();
const mockLoadExpenses = jest.fn();
const mockAddExpense = jest.fn();
const mockUpdateExpense = jest.fn();
const mockState = {
  expenses: mockExpenses,
  filteredExpenses: mockExpenses,
  filter: {},
  loading: false,
  error: null
};

// Custom render with context provider
const customRender = (ui: React.ReactElement, { providerProps = { 
  state: mockState, 
  dispatch: mockDispatch, 
  deleteExpense: mockDeleteExpense,
  loadExpenses: mockLoadExpenses,
  addExpense: mockAddExpense,
  updateExpense: mockUpdateExpense
} as any, ...renderOptions } = {}) => {
  return render(
    <ExpenseContext.Provider value={providerProps}>
      {ui}
    </ExpenseContext.Provider>,
    renderOptions
  );
};

describe('ExpenseList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders expense list title', () => {
    customRender(<ExpenseList />);
    expect(screen.getByText('Expenses')).toBeInTheDocument();
  });

  test('renders add expense button', () => {
    customRender(<ExpenseList />);
    expect(screen.getByText('Add Expense')).toBeInTheDocument();
  });

  test('displays expenses in the table', () => {
    customRender(<ExpenseList />);
    
    // Check if both expense descriptions are visible
    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('Gas')).toBeInTheDocument();
    
    // Check if amounts are displayed correctly
    expect(screen.getByText('$50.75')).toBeInTheDocument();
    expect(screen.getByText('$35.50')).toBeInTheDocument();
    
    // Check if categories are displayed
    expect(screen.getByText('Food & Dining')).toBeInTheDocument();
    expect(screen.getByText('Transportation')).toBeInTheDocument();
  });

  test('shows no expenses message when list is empty', () => {
    const emptyState = {
      ...mockState,
      expenses: [],
      filteredExpenses: []
    };
    
    customRender(<ExpenseList />, { 
      providerProps: { 
        state: emptyState, 
        dispatch: mockDispatch,
        deleteExpense: mockDeleteExpense,
        loadExpenses: mockLoadExpenses,
        addExpense: mockAddExpense,
        updateExpense: mockUpdateExpense
      }
    });
    
    expect(screen.getByText('No expenses found. Add a new expense to get started!')).toBeInTheDocument();
  });

  test('applies filters when filter button is clicked', () => {
    customRender(<ExpenseList />);
    
    // Enter a search term
    const searchInput = screen.getByLabelText('Search');
    fireEvent.change(searchInput, { target: { value: 'Groceries' } });
    
    // Click apply filters button
    const applyButton = screen.getByText('Apply');
    fireEvent.click(applyButton);
    
    // Verify dispatch was called with correct filter
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_FILTER',
      payload: expect.objectContaining({
        searchText: 'Groceries'
      })
    });
  });

  test('resets filters when reset button is clicked', () => {
    customRender(<ExpenseList />);
    
    // First set a filter
    const searchInput = screen.getByLabelText('Search');
    fireEvent.change(searchInput, { target: { value: 'Groceries' } });
    
    // Then reset the filter
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);
    
    // Verify the search field is cleared
    expect(searchInput).toHaveValue('');
    
    // Verify dispatch was called with empty filter
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_FILTER',
      payload: {}
    });
  });
});
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExpenseForm from './ExpenseForm';
import { ExpenseContext } from '../../contexts/ExpenseContext';
import { Expense } from '../../types/expense';

const mockAddExpense = jest.fn();
const mockUpdateExpense = jest.fn();
const mockOnClose = jest.fn();

const mockState = {
  expenses: [],
  filteredExpenses: [],
  filter: {},
  loading: false,
  error: null
};

const mockExpense: Expense = {
  id: '1',
  description: 'Groceries',
  amount: 50.75,
  date: '2023-06-15',
  category: 'Food & Dining',
  createdAt: '2023-06-15T12:00:00Z'
};

// Custom render with context provider
const customRender = (ui: React.ReactElement, { providerProps = { state: mockState, addExpense: mockAddExpense, updateExpense: mockUpdateExpense } as any, ...renderOptions } = {}) => {
  return render(
    <ExpenseContext.Provider value={providerProps}>
      {ui}
    </ExpenseContext.Provider>,
    renderOptions
  );
};

describe('ExpenseForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders Add Expense form correctly', () => {
    customRender(
      <ExpenseForm open={true} onClose={mockOnClose} mode="add" expense={null} />
    );

    // Check for form title
    expect(screen.getByText('Add New Expense')).toBeInTheDocument();
    
    // Check for form fields
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date/i)).toBeInTheDocument();
    
    // Check buttons
    expect(screen.getByRole('button', { name: /Add Expense/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });

  test('renders Edit Expense form correctly with expense data', () => {
    customRender(
      <ExpenseForm 
        open={true} 
        onClose={mockOnClose} 
        mode="edit" 
        expense={mockExpense} 
      />
    );

    // Check for form title
    expect(screen.getByText('Edit Expense')).toBeInTheDocument();
    
    // Check if fields are populated with expense data
    expect(screen.getByLabelText(/Description/i)).toHaveValue('Groceries');
    expect(screen.getByLabelText(/Amount/i)).toHaveValue('50.75');
    
    // Check buttons
    expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
  });

  test('validates form inputs', async () => {
    customRender(
      <ExpenseForm open={true} onClose={mockOnClose} mode="add" expense={null} />
    );

    // Try to submit with empty description
    const descriptionInput = screen.getByLabelText(/Description/i);
    fireEvent.change(descriptionInput, { target: { value: '' } });
    
    const amountInput = screen.getByLabelText(/Amount/i);
    fireEvent.change(amountInput, { target: { value: '50' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Add Expense/i });
    fireEvent.click(submitButton);

    // Validation error should be displayed
    await waitFor(() => {
      expect(screen.getByText('Description is required')).toBeInTheDocument();
    });

    // Amount validation
    fireEvent.change(descriptionInput, { target: { value: 'Test Expense' } });
    fireEvent.change(amountInput, { target: { value: '' } });
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Amount must be greater than 0')).toBeInTheDocument();
    });
    
    // No call should be made to addExpense due to validation failures
    expect(mockAddExpense).not.toHaveBeenCalled();
  });

  test('submits form with valid data for new expense', async () => {
    const today = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD format

    customRender(
      <ExpenseForm open={true} onClose={mockOnClose} mode="add" expense={null} />
    );

    // Fill in form
    fireEvent.change(screen.getByLabelText(/Description/i), { 
      target: { value: 'New Test Expense' } 
    });
    
    fireEvent.change(screen.getByLabelText(/Amount/i), { 
      target: { value: '75.50' } 
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Add Expense/i }));

    // Check if addExpense was called with correct data
    await waitFor(() => {
      expect(mockAddExpense).toHaveBeenCalledWith({
        description: 'New Test Expense',
        amount: 75.5,
        category: 'Other', // Default value
        date: expect.any(String)
      });
    });

    // Verify modal was closed
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('submits form for editing an expense', async () => {
    customRender(
      <ExpenseForm 
        open={true} 
        onClose={mockOnClose} 
        mode="edit" 
        expense={mockExpense} 
      />
    );

    // Modify the description
    fireEvent.change(screen.getByLabelText(/Description/i), { 
      target: { value: 'Updated Groceries' } 
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    // Check if updateExpense was called with updated data
    await waitFor(() => {
      expect(mockUpdateExpense).toHaveBeenCalledWith({
        ...mockExpense,
        description: 'Updated Groceries',
      });
    });

    // Verify modal was closed
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('closes the form when cancel is clicked', () => {
    customRender(
      <ExpenseForm open={true} onClose={mockOnClose} mode="add" expense={null} />
    );
    
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    
    expect(mockOnClose).toHaveBeenCalled();
  });
});
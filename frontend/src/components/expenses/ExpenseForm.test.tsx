import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExpenseForm from './ExpenseForm';
import { ExpenseProvider } from '../../contexts/ExpenseContext';

const mockOnClose = jest.fn();

const renderWithProvider = (ui: React.ReactElement) => {
  return render(
    <ExpenseProvider>{ui}</ExpenseProvider>
  );
};

describe('ExpenseForm Component', () => {
  beforeEach(() => {
    mockOnClose.mockClear();
  });

  test('renders add expense form correctly', () => {
    renderWithProvider(
      <ExpenseForm 
        open={true} 
        onClose={mockOnClose} 
        mode="add"
      />
    );

    expect(screen.getByText('Add New Expense')).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date/i)).toBeInTheDocument();
  });

  test('renders edit expense form with pre-filled data', () => {
    const mockExpense = {
      id: '1',
      amount: 100,
      description: 'Test Expense',
      category: 'Food & Dining' as const,
      date: '2024-01-01',
      createdAt: '2024-01-01T00:00:00.000Z'
    };

    renderWithProvider(
      <ExpenseForm 
        open={true} 
        onClose={mockOnClose} 
        mode="edit"
        expense={mockExpense}
      />
    );

    expect(screen.getByText('Edit Expense')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Expense')).toBeInTheDocument();
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-01-01')).toBeInTheDocument();
  });

  test('validates required fields', async () => {
    renderWithProvider(
      <ExpenseForm 
        open={true} 
        onClose={mockOnClose} 
        mode="add"
      />
    );

    // Try to submit with empty description
    const submitButton = screen.getByText('Add Expense');
    fireEvent.click(submitButton);

    expect(screen.getByText('Description is required')).toBeInTheDocument();
    expect(screen.getByText('Amount must be greater than 0')).toBeInTheDocument();
  });

  test('calls onClose when cancel is clicked', () => {
    renderWithProvider(
      <ExpenseForm 
        open={true} 
        onClose={mockOnClose} 
        mode="add"
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
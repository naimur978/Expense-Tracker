import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Reports from './Reports';
import { ExpenseProvider } from '../../contexts/ExpenseContext';

// Mock the Chart.js components
jest.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="mock-bar-chart">Bar Chart</div>,
  Pie: () => <div data-testid="mock-pie-chart">Pie Chart</div>,
  Line: () => <div data-testid="mock-line-chart">Line Chart</div>,
}));

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
        ]
      }
    })
  };
});

describe('Reports Component', () => {
  test('renders reports page with title', () => {
    render(
      <ExpenseProvider>
        <Reports />
      </ExpenseProvider>
    );

    expect(screen.getByText('Expense Reports')).toBeInTheDocument();
  });

  test('renders time frame selector', () => {
    render(
      <ExpenseProvider>
        <Reports />
      </ExpenseProvider>
    );

    expect(screen.getByLabelText('Time Frame')).toBeInTheDocument();
    expect(screen.getByText('Weekly')).toBeInTheDocument();
    expect(screen.getByText('Monthly')).toBeInTheDocument();
    expect(screen.getByText('Yearly')).toBeInTheDocument();
  });

  test('renders all chart components', () => {
    render(
      <ExpenseProvider>
        <Reports />
      </ExpenseProvider>
    );

    expect(screen.getByTestId('mock-line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('mock-bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('mock-pie-chart')).toBeInTheDocument();
  });

  test('changes time frame when selector is changed', () => {
    render(
      <ExpenseProvider>
        <Reports />
      </ExpenseProvider>
    );

    const timeFrameSelect = screen.getByLabelText('Time Frame');
    fireEvent.mouseDown(timeFrameSelect);
    fireEvent.click(screen.getByText('Weekly'));

    expect(screen.getByText('Expense Trend (Weekly)')).toBeInTheDocument();
  });

  test('renders empty state when no expenses', () => {
    jest.spyOn(React, 'useContext').mockImplementation(() => ({
      state: {
        expenses: []
      }
    }));

    render(
      <ExpenseProvider>
        <Reports />
      </ExpenseProvider>
    );

    expect(screen.getByText('No expense data available. Add some expenses to see your trends!')).toBeInTheDocument();
  });
});
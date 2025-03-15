import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ExpenseProvider } from '../contexts/ExpenseContext';
import CssBaseline from '@mui/material/CssBaseline';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';

const theme = createTheme();

// Create Emotion cache for testing
const createEmotionCache = () => {
  return createCache({
    key: 'css',
    prepend: true,
  });
};

const cache = createEmotionCache();

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

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ExpenseProvider>
          {children}
        </ExpenseProvider>
      </ThemeProvider>
    </CacheProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
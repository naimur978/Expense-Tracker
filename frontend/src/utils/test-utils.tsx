import React from 'react';
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
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
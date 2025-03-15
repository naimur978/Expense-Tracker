import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { useExpense } from '../../contexts/ExpenseContext';
import { Expense, ExpenseCategory } from '../../types/expense';
import { api } from '../../services/api';

const Dashboard: React.FC = () => {
  const { state } = useExpense();
  const { expenses, loading, error } = state;
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [totalExpense, setTotalExpense] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState<Record<ExpenseCategory, number>>({} as Record<ExpenseCategory, number>);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<any>(null);

  // Calculate totals effect
  useEffect(() => {
    if (!expenses.length) return;

    const total = expenses.reduce((sum, expense) => Number(sum) + Number(expense.amount), 0);
    setTotalExpense(total);

    const sortedExpenses = [...expenses].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setRecentExpenses(sortedExpenses.slice(0, 5));
  }, [expenses]);

  // Fetch summary data from API
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    let isMounted = true;
    const fetchSummary = async () => {
      setSummaryLoading(true);
      try {
        const summaryData = await api.getExpenseSummary('monthly');
        if (!isMounted) return;
        
        setSummary(summaryData);
        
        // Process category totals from the API response
        const categoryMap: Record<ExpenseCategory, number> = {
          'Food & Dining': 0,
          'Transportation': 0,
          'Utilities': 0,
          'Housing': 0,
          'Entertainment': 0,
          'Healthcare': 0,
          'Shopping': 0,
          'Personal Care': 0,
          'Education': 0,
          'Travel': 0,
          'Other': 0
        };
        
        if (summaryData.category_totals) {
          summaryData.category_totals.forEach((item: { category: ExpenseCategory; total: number }) => {
            categoryMap[item.category] = item.total;
          });
        }
        
        if (isMounted) {
          setCategoryTotals(categoryMap);
          setSummaryError(null);
        }
      } catch (err) {
        if (isMounted) {
          setSummaryError('Failed to load expense summary');
          console.error('Failed to fetch summary:', err);
        }
      } finally {
        if (isMounted) {
          setSummaryLoading(false);
        }
      }
    };

    fetchSummary();
    return () => {
      isMounted = false;
    };
  }, []);

  // Get top spending categories
  const topCategories = Object.entries(categoryTotals)
    .sort(([, amountA], [, amountB]) => amountB - amountA)
    .slice(0, 3);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {(error || summaryError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || summaryError}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Total Expenses */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              backgroundColor: 'primary.light',
              color: 'primary.contrastText'
            }}
          >
            <Typography variant="h6">Total Expenses</Typography>
            {summaryLoading ? (
              <CircularProgress size={24} sx={{ my: 2 }} />
            ) : (
              <Typography variant="h3">${totalExpense.toFixed(2)}</Typography>
            )}
          </Paper>
        </Grid>

        {/* This Month Expenses */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              textAlign: 'center', 
              backgroundColor: 'secondary.light',
              color: 'secondary.contrastText'
            }}
          >
            <Typography variant="h6">This Month</Typography>
            {summaryLoading ? (
              <CircularProgress size={24} sx={{ my: 2 }} />
            ) : (
              <Typography variant="h3">
                ${Number(expenses
                  .filter(expense => {
                    const today = new Date();
                    const expenseDate = new Date(expense.date);
                    return (
                      expenseDate.getMonth() === today.getMonth() &&
                      expenseDate.getFullYear() === today.getFullYear()
                    );
                  })
                  .reduce((sum, expense) => Number(sum) + Number(expense.amount), 0))
                  .toFixed(2)}
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Number of Expenses */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              backgroundColor: 'info.light',
              color: 'info.contrastText'
            }}
          >
            <Typography variant="h6">Number of Expenses</Typography>
            <Typography variant="h3">{expenses.length}</Typography>
          </Paper>
        </Grid>

        {/* Top Categories */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top Spending Categories
            </Typography>
            {summaryLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              topCategories.map(([category, amount], index) => (
                <Box key={category} sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1">{category}</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    ${amount.toFixed(2)}
                  </Typography>
                </Box>
              ))
            )}
          </Paper>
        </Grid>

        {/* Recent Expenses */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Expenses
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              recentExpenses.map(expense => (
                <Box key={expense.id} sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">
                    {new Date(expense.date).toLocaleDateString()} - {expense.description}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    ${Number(expense.amount).toFixed(2)}
                  </Typography>
                </Box>
              ))
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
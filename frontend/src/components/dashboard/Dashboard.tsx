import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { useExpense } from '../../contexts/ExpenseContext';
import { Expense, ExpenseCategory } from '../../types/expense';
import { api } from '../../services/api';

const Dashboard: React.FC = () => {
  const { state } = useExpense();
  const { expenses } = state;
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [totalExpense, setTotalExpense] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState<Record<ExpenseCategory, number>>({} as Record<ExpenseCategory, number>);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);

  // Calculate totals and fetch summary data
  useEffect(() => {
    const fetchData = async () => {
      setSummaryLoading(true);
      try {
        const summaryData = await api.getExpenseSummary('monthly');
        
        // Calculate totals from expenses
        const total = expenses.reduce((sum, expense) => Number(sum) + Number(expense.amount), 0);
        setTotalExpense(total);

        // Calculate monthly expenses
        const today = new Date();
        const monthlyTotal = expenses
          .filter(expense => {
            const expenseDate = new Date(expense.date);
            return (
              expenseDate.getMonth() === today.getMonth() &&
              expenseDate.getFullYear() === today.getFullYear()
            );
          })
          .reduce((sum, expense) => Number(sum) + Number(expense.amount), 0);
        setMonthlyExpense(monthlyTotal);

        // Sort recent expenses
        const sortedExpenses = [...expenses].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setRecentExpenses(sortedExpenses.slice(0, 5));

        // Process category totals from the API response
        if (summaryData?.category_totals) {
          const categoryMap = summaryData.category_totals.reduce((acc: Record<ExpenseCategory, number>, item: { category: ExpenseCategory; total: number }) => {
            acc[item.category] = item.total;
            return acc;
          }, {} as Record<ExpenseCategory, number>);
          
          setCategoryTotals(categoryMap);
        }
        
        setSummaryError(null);
      } catch (err) {
        setSummaryError('Failed to load expense summary');
        console.error('Failed to fetch summary:', err);
      } finally {
        setSummaryLoading(false);
      }
    };

    fetchData();
  }, [expenses]);

  // Get top spending categories
  const topCategories = Object.entries(categoryTotals)
    .sort(([, amountA], [, amountB]) => amountB - amountA)
    .slice(0, 3);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {summaryError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {summaryError}
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
            <Typography variant="h3">${totalExpense.toFixed(2)}</Typography>
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
            <Typography variant="h3">${monthlyExpense.toFixed(2)}</Typography>
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
            {topCategories.length > 0 ? (
              topCategories.map(([category, amount]) => (
                <Box key={category} sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1">{category}</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    ${amount.toFixed(2)}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2">No spending data available</Typography>
            )}
          </Paper>
        </Grid>

        {/* Recent Expenses */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Expenses
            </Typography>
            {recentExpenses.length > 0 ? (
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
            ) : (
              <Typography variant="body2">No recent expenses</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Grid, Paper, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert } from '@mui/material';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend, 
  ArcElement
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { useExpense } from '../../contexts/ExpenseContext';
import { api } from '../../services/api';
import type { ChartData, ChartOptions } from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Reports: React.FC = () => {
  const { state } = useExpense();
  const { loading, error } = state;
  const [timeFrame, setTimeFrame] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Define colors for charts
  const colors = useMemo(() => ({
    primary: '#1976d2',
    secondary: '#dc004e',
    success: '#4caf50',
    background: [
      '#1976d2',
      '#dc004e',
      '#4caf50',
      '#ff9800',
      '#9c27b0',
      '#795548',
      '#607d8b',
      '#e91e63',
      '#673ab7',
      '#009688'
    ]
  }), []);

  // Data for category distribution
  const [categoryData, setCategoryData] = useState<{
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string[];
      borderColor: string[];
      borderWidth: number;
    }[];
  }>({
    labels: [],
    datasets: [
      {
        label: 'Amount',
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1,
      },
    ],
  });

  // Data for time series
  const [timeSeriesData, setTimeSeriesData] = useState<{
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
      tension: number;
    }[];
  }>({
    labels: [],
    datasets: [
      {
        label: 'Expenses',
        data: [],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        tension: 0.3,
      },
    ],
  });

  // Fetch and process data from API
  useEffect(() => {
    const fetchSummaryData = async () => {
      setSummaryLoading(true);
      try {
        const summaryData = await api.getExpenseSummary(timeFrame);
        
        // Process category data
        const categories = summaryData.category_totals.map((item: any) => item.category);
        const amounts = summaryData.category_totals.map((item: any) => item.total);
        const backgroundColors = categories.map((_: any, index: number) => colors.background[index % colors.background.length]);
        const borderColors = backgroundColors.map((color: string) => color.replace('0.8', '1'));
        
        setCategoryData({
          labels: categories,
          datasets: [
            {
              label: 'Amount',
              data: amounts,
              backgroundColor: backgroundColors,
              borderColor: borderColors,
              borderWidth: 1,
            },
          ],
        });

        // Process time series data
        const timeLabels = summaryData.time_series.map((item: any) => {
          const date = new Date(item.period);
          if (timeFrame === 'weekly') {
            return `Week ${date.getDate()}/${date.getMonth() + 1}`;
          } else if (timeFrame === 'monthly') {
            return date.toLocaleString('default', { month: 'short', year: 'numeric' });
          }
          return date.getFullYear().toString();
        });
        
        setTimeSeriesData({
          labels: timeLabels,
          datasets: [
            {
              label: 'Expenses',
              data: summaryData.time_series.map((item: any) => item.total),
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 2,
              tension: 0.3,
            },
          ],
        });

        setSummaryError(null);
      } catch (err) {
        setSummaryError('Failed to load expense summary');
        console.error('Failed to fetch summary:', err);
      } finally {
        setSummaryLoading(false);
      }
    };

    fetchSummaryData();
  }, [timeFrame, colors]);

  // Update charts on window resize
  useEffect(() => {
    const handleResize = () => {
      ChartJS.defaults.responsive = true;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); // No need for colors dependency as it's not used in this effect

  // Chart options
  const categoryOptions = {
    plugins: {
      title: {
        display: true,
        text: 'Expenses by Category',
        font: {
          size: 16,
        },
      },
    },
  };

  const timeSeriesOptions = {
    plugins: {
      title: {
        display: true,
        text: `Expense Trend (${timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)})`,
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount ($)',
        },
      },
    },
  };

  if (loading || summaryLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Expense Reports
      </Typography>

      {(error || summaryError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || summaryError}
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="time-frame-select-label">Time Frame</InputLabel>
          <Select
            labelId="time-frame-select-label"
            id="time-frame-select"
            value={timeFrame}
            label="Time Frame"
            onChange={(e) => setTimeFrame(e.target.value as 'weekly' | 'monthly' | 'yearly')}
          >
            <MenuItem value="weekly">Weekly</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
            <MenuItem value="yearly">Yearly</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={4}>
        {/* Time Series Chart */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            {categoryData.labels.length > 0 ? (
              <Line options={timeSeriesOptions} data={timeSeriesData} />
            ) : (
              <Typography variant="body1" align="center" sx={{ py: 5 }}>
                No expense data available. Add some expenses to see your trends!
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Category Distribution */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            {categoryData.labels.length > 0 ? (
              <Bar options={categoryOptions} data={categoryData} />
            ) : (
              <Typography variant="body1" align="center" sx={{ py: 5 }}>
                No expense data available.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Pie Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            {categoryData.labels.length > 0 ? (
              <Box>
                <Typography variant="h6" align="center" gutterBottom>
                  Expense Distribution
                </Typography>
                <Pie data={categoryData} />
              </Box>
            ) : (
              <Typography variant="body1" align="center" sx={{ py: 5 }}>
                No expense data available.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;
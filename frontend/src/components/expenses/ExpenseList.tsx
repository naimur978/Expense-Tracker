import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useExpense } from '../../contexts/ExpenseContext';
import { Expense, ExpenseCategory } from '../../types/expense';
import ExpenseForm from './ExpenseForm';

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food & Dining',
  'Transportation',
  'Utilities',
  'Housing',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Personal Care',
  'Education',
  'Travel',
  'Other'
];

const ExpenseList: React.FC = () => {
  const { state, deleteExpense, dispatch } = useExpense();
  const { filteredExpenses, loading, error } = state;
  const [open, setOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  
  // States for dialog and pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  
  // Filter state
  const [searchText, setSearchText] = useState('');
  const [category, setCategory] = useState<ExpenseCategory | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Handle opening the form for adding a new expense
  const handleAddExpense = () => {
    setSelectedExpense(null);
    setFormMode('add');
    setOpen(true);
  };

  // Handle opening the form for editing an expense
  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setFormMode('edit');
    setOpen(true);
  };

  // Handle deleting an expense
  const handleDeleteExpense = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(id);
      } catch (error) {
        console.error('Failed to delete expense:', error);
      }
    }
  };

  // Handle closing the form dialog
  const handleCloseForm = () => {
    setOpen(false);
  };

  // Handle pagination changes
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle filter changes
  const handleFilterChange = () => {
    dispatch({ 
      type: 'SET_FILTER', 
      payload: {
        searchText: searchText || undefined,
        category: category || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      }
    });
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchText('');
    setCategory('');
    setStartDate('');
    setEndDate('');
    dispatch({ type: 'SET_FILTER', payload: {} });
  };

  // Get expenses for current page
  const currentExpenses = filteredExpenses.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4">Expenses</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddExpense}
          disabled={loading}
        >
          Add Expense
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filter Section */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Filters</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel id="category-filter-label">Category</InputLabel>
              <Select
                labelId="category-filter-label"
                id="category-filter"
                value={category}
                label="Category"
                onChange={(e) => setCategory(e.target.value as ExpenseCategory | '')}
              >
                <MenuItem value="">
                  <em>All Categories</em>
                </MenuItem>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleFilterChange}
              fullWidth
            >
              Apply
            </Button>
            <Button
              variant="outlined"
              onClick={handleResetFilters}
              fullWidth
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Expenses Table */}
      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentExpenses.length > 0 ? (
                  currentExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell align="right">${Number(expense.amount).toFixed(2)}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit">
                          <IconButton 
                            color="primary" 
                            onClick={() => handleEditExpense(expense)}
                            disabled={loading}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            color="error" 
                            onClick={() => handleDeleteExpense(expense.id)}
                            disabled={loading}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No expenses found. Add a new expense to get started!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredExpenses.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </TableContainer>

      {/* Expense Form Dialog */}
      <ExpenseForm
        open={open}
        onClose={handleCloseForm}
        expense={selectedExpense}
        mode={formMode}
      />
    </Box>
  );
};

export default ExpenseList;
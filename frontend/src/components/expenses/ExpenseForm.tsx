import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle,
  SelectChangeEvent,
  CircularProgress,
  Alert
} from '@mui/material';
import { useExpense } from '../../contexts/ExpenseContext';
import { Expense, ExpenseCategory } from '../../types/expense';

interface ExpenseFormProps {
  open: boolean;
  onClose: () => void;
  expense?: Expense;
  mode: 'add' | 'edit';
}

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

const ExpenseForm: React.FC<ExpenseFormProps> = ({ open, onClose, expense, mode }) => {
  const { addExpense, updateExpense, state } = useExpense();
  const { loading, error } = state;
  
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: 'Other' as ExpenseCategory,
    date: new Date().toISOString().split('T')[0]
  });
  const [formErrors, setFormErrors] = useState({
    amount: false,
    description: false,
    date: false
  });

  useEffect(() => {
    if (expense && mode === 'edit') {
      setFormData({
        amount: expense.amount.toString(),
        description: expense.description,
        category: expense.category,
        date: new Date(expense.date).toISOString().split('T')[0]
      });
    } else {
      setFormData({
        amount: '',
        description: '',
        category: 'Other' as ExpenseCategory,
        date: new Date().toISOString().split('T')[0]
      });
    }
  }, [expense, mode, open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name) {
      // For amount, only allow numbers and decimal point
      if (name === 'amount' && value !== '') {
        const regex = /^\d*\.?\d{0,2}$/;
        if (!regex.test(value)) return;
      }
      
      setFormData({
        ...formData,
        [name]: value
      });
      
      if (name in formErrors) {
        setFormErrors({
          ...formErrors,
          [name]: false
        });
      }
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<ExpenseCategory>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({
        ...formData,
        [name]: value as ExpenseCategory
      });
    }
  };

  const validateForm = (): boolean => {
    const amount = parseFloat(formData.amount);
    const newErrors = {
      amount: isNaN(amount) || amount <= 0,
      description: formData.description.trim() === '',
      date: !formData.date
    };
    
    setFormErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (mode === 'add') {
        await addExpense({
          ...formData,
          amount: parseFloat(formData.amount),
          date: formData.date // Use YYYY-MM-DD format directly
        });
      } else if (mode === 'edit' && expense) {
        await updateExpense({
          ...expense,
          ...formData,
          amount: parseFloat(formData.amount),
          date: formData.date // Use YYYY-MM-DD format directly
        });
      }
      onClose();
    } catch (err) {
      console.error('Failed to save expense:', err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{mode === 'add' ? 'Add New Expense' : 'Edit Expense'}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 1 }}>
            {error}
          </Alert>
        )}
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="description"
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            error={formErrors.description}
            helperText={formErrors.description ? 'Description is required' : ''}
            disabled={loading}
            autoFocus
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="amount"
            label="Amount"
            name="amount"
            type="text"
            value={formData.amount}
            onChange={handleInputChange}
            error={formErrors.amount}
            helperText={formErrors.amount ? 'Amount must be greater than 0' : ''}
            disabled={loading}
            placeholder="0.00"
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              id="category"
              name="category"
              value={formData.category}
              label="Category"
              onChange={handleSelectChange}
              disabled={loading}
            >
              {EXPENSE_CATEGORIES.map(category => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="date"
            label="Date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleInputChange}
            error={formErrors.date}
            helperText={formErrors.date ? 'Date is required' : ''}
            disabled={loading}
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : mode === 'add' ? 'Add Expense' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExpenseForm;
import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  Typography,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

function ExpenseList({ expenses, onAddExpense, onEditExpense, onDeleteExpense }) {
  const [openDialog, setOpenDialog] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    date: new Date(),
  });
  const [editingExpense, setEditingExpense] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);

  const handleAddExpense = () => {
    if (newExpense.description.trim() && newExpense.amount) {
      onAddExpense({
        ...newExpense,
        amount: parseFloat(newExpense.amount),
      });
      setNewExpense({
        description: '',
        amount: '',
        date: new Date(),
      });
      setOpenDialog(false);
    }
  };

  const handleEditExpense = () => {
    if (editingExpense && editingExpense.description.trim() && editingExpense.amount) {
      onEditExpense(editingExpense.id, {
        ...editingExpense,
        amount: parseFloat(editingExpense.amount),
      });
      setEditingExpense(null);
      setOpenDialog(false);
    }
  };

  const handleDeleteExpense = (expenseId) => {
    onDeleteExpense(expenseId);
    setMenuAnchor(null);
    setSelectedExpenseId(null);
  };

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const handleMenuOpen = (event, expenseId) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedExpenseId(expenseId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedExpenseId(null);
  };

  const handleEditClick = () => {
    const expenseToEdit = expenses.find(expense => expense.id === selectedExpenseId);
    if (expenseToEdit) {
      setEditingExpense(expenseToEdit);
      setNewExpense({
        description: expenseToEdit.description,
        amount: expenseToEdit.amount.toString(),
        date: new Date(expenseToEdit.date),
      });
      setOpenDialog(true);
    }
    handleMenuClose();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle1">Expenses</Typography>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingExpense(null);
            setNewExpense({
              description: '',
              amount: '',
              date: new Date(),
            });
            setOpenDialog(true);
          }}
        >
          Add Expense
        </Button>
      </Box>

      <List>
        {expenses.map(expense => (
          <ListItem
            key={expense.id}
            secondaryAction={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ mr: 2 }}>
                  ${expense.amount.toFixed(2)}
                </Typography>
                <IconButton onClick={(e) => handleMenuOpen(e, expense.id)}>
                  <MoreVertIcon />
                </IconButton>
              </Box>
            }
          >
            <ListItemText
              primary={expense.description}
              secondary={new Date(expense.date).toLocaleDateString()}
            />
          </ListItem>
        ))}
      </List>

      {expenses.length > 0 && (
        <Box sx={{ mt: 2, textAlign: 'right' }}>
          <Typography variant="subtitle1">
            Total: ${totalAmount.toFixed(2)}
          </Typography>
        </Box>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Description"
            fullWidth
            value={newExpense.description}
            onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            value={newExpense.amount}
            onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
          />
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Date"
              value={newExpense.date}
              onChange={(newDate) => setNewExpense({ ...newExpense, date: newDate })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  margin="dense"
                  fullWidth
                />
              )}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={editingExpense ? handleEditExpense : handleAddExpense} 
            variant="contained"
          >
            {editingExpense ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditClick}>Edit</MenuItem>
        <MenuItem onClick={() => handleDeleteExpense(selectedExpenseId)}>Delete</MenuItem>
      </Menu>
    </Box>
  );
}

export default ExpenseList; 
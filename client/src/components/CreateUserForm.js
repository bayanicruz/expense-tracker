import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Typography
} from '@mui/material';

function CreateUserForm({ open, onClose, onUserCreated }) {
  const [userData, setUserData] = useState({
    name: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!userData.name.trim()) {
      newErrors.name = 'Name is required';
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userData.name
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }

      const createdUser = await response.json();

      // Reset form
      setUserData({
        name: ''
      });
      setErrors({});
      
      // Notify parent and close
      if (onUserCreated) onUserCreated();
      onClose();
    } catch (error) {
      console.error('Error creating user:', error);
      setErrors({ submit: error.message });
    }
  };

  const handleClose = () => {
    setUserData({
      name: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New User</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="Full Name"
            fullWidth
            value={userData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            required
          />
          

          {errors.submit && (
            <Typography color="error" variant="body2">
              {errors.submit}
            </Typography>
          )}
        </Stack>
      </DialogContent>
      
      <DialogActions sx={{ flexDirection: 'column', gap: 1, p: 2 }}>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!userData.name}
          fullWidth
          size="large"
          sx={{ py: 2 }}
        >
          Create User
        </Button>
        <Button 
          onClick={handleClose}
          fullWidth
          size="large"
          sx={{ py: 2 }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateUserForm;
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Typography,
  Box
} from '@mui/material';
import LoadingOverlay from './LoadingOverlay';
import useApiCall from '../hooks/useApiCall';

function CreateUserForm({ open, onClose, onUserCreated }) {
  const [userData, setUserData] = useState({
    name: ''
  });

  const [errors, setErrors] = useState({});
  const { loading, apiCall } = useApiCall();

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

    await apiCall(async () => {
      try {
        const API_URL = process.env.REACT_APP_API_URL || '';
        const response = await fetch(`${API_URL}/api/users`, {
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

        await response.json();

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
    });
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
      <LoadingOverlay loading={loading}>
        {/* Sticky Header */}
        <DialogTitle sx={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 1, 
          backgroundColor: 'background.paper',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          py: 2
        }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', mb: 0.5 }}>
              Add New Member
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
              Create a new member for expense tracking
            </Typography>
          </Box>
        </DialogTitle>
        
        {/* Scrollable Content */}
        <DialogContent sx={{ 
          flex: 1, 
          overflow: 'auto',
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-thumb': { 
            backgroundColor: 'rgba(0,0,0,0.2)', 
            borderRadius: '3px' 
          }
        }}>
          <Stack spacing={3} sx={{ mt: 2, pb: 2 }}>
            <TextField
              label="Member Name"
              fullWidth
              value={userData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              required
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: '0.9rem',
                  '&.Mui-focused': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'black'
                    }
                  }
                },
                '& .MuiInputLabel-root': {
                  fontSize: '0.9rem'
                },
                '& .MuiFormHelperText-root': {
                  fontSize: '0.75rem'
                }
              }}
            />

            {errors.submit && (
              <Typography color="error" variant="body2" sx={{ fontSize: '0.85rem' }}>
                {errors.submit}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        
        {/* Sticky Footer */}
        <DialogActions sx={{ 
          position: 'sticky', 
          bottom: 0, 
          zIndex: 1, 
          backgroundColor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          justifyContent: 'space-between', 
          p: 2 
        }}>
          <Button 
            onClick={handleClose}
            variant="text"
            size="small"
            sx={{ 
              color: 'text.disabled',
              fontSize: '0.75rem',
              textTransform: 'none',
              '&:hover': {
                color: 'text.secondary',
                backgroundColor: 'transparent'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!userData.name || loading}
            size="large"
            sx={{ 
              px: 4,
              backgroundColor: 'black',
              color: 'white',
              '&:hover': { 
                backgroundColor: '#333333'
              },
              '&:disabled': { 
                backgroundColor: '#ccc'
              }
            }}
          >
            Add Member
          </Button>
        </DialogActions>
      </LoadingOverlay>
    </Dialog>
  );
}

export default CreateUserForm;
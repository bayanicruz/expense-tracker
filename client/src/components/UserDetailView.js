import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Stack,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip
} from '@mui/material';

function UserDetailView({ open, onClose, userId, onUserUpdated }) {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    role: 'user',
    createdAt: '',
    updatedAt: ''
  });
  
  const [expenseData, setExpenseData] = useState({
    totalOwed: 0,
    eventCount: 0,
    eventBreakdown: []
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && userId) {
      fetchUserDetails();
      fetchUserExpenses();
    }
  }, [open, userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${userId}`);
      if (response.ok) {
        const user = await response.json();
        setUserData(user);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserExpenses = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/expenses`);
      if (response.ok) {
        const data = await response.json();
        setExpenseData({
          totalOwed: data.totalOwed,
          eventCount: data.eventCount,
          eventBreakdown: data.eventBreakdown
        });
      }
    } catch (error) {
      console.error('Error fetching user expenses:', error);
    }
  };

  const handleChange = (field, value) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email
        })
      });

      if (response.ok) {
        if (onUserUpdated) onUserUpdated();
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const deleteUser = async () => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        setLoading(true);
        
        const response = await fetch(`/api/users/${userId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          handleClose();
          if (onUserUpdated) onUserUpdated();
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClose = () => {
    setUserData({
      name: '',
      email: '',
      role: 'user',
      createdAt: '',
      updatedAt: ''
    });
    setExpenseData({
      totalOwed: 0,
      eventCount: 0,
      eventBreakdown: []
    });
    setLoading(false);
    onClose();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogContent sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" component="div" sx={{ mb: 1 }}>
              {userData.name || 'User Details'}
            </Typography>
            {userData.createdAt && (
              <Typography variant="body2" color="textSecondary">
                Created: {formatDate(userData.createdAt)}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="Full Name"
            fullWidth
            value={userData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
          
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={userData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
          />


          {userData.updatedAt && (
            <Typography variant="body2" color="textSecondary">
              Last updated: {formatDate(userData.updatedAt)}
            </Typography>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Expense Summary */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Expense Summary
            </Typography>
            
            {/* Total Owed Display */}
            <Box sx={{ 
              p: 3, 
              backgroundColor: expenseData.totalOwed > 0 ? '#ffebee' : '#e8f5e8', 
              borderRadius: 2, 
              border: `1px solid ${expenseData.totalOwed > 0 ? '#f44336' : '#4caf50'}`,
              textAlign: 'center',
              mb: 3
            }}>
              <Typography variant="h4" sx={{ 
                mb: 1, 
                color: expenseData.totalOwed > 0 ? '#d32f2f' : '#2e7d32' 
              }}>
                ${expenseData.totalOwed.toFixed(2)}
              </Typography>
              <Typography variant="h6" sx={{ 
                color: expenseData.totalOwed > 0 ? '#d32f2f' : '#2e7d32' 
              }}>
                {expenseData.totalOwed > 0 ? 'Total Owed' : 'All Paid Up!'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Across {expenseData.eventCount} event{expenseData.eventCount !== 1 ? 's' : ''}
              </Typography>
            </Box>

            {/* Event Breakdown */}
            {expenseData.eventBreakdown.length > 0 && (
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Event Breakdown
                </Typography>
                <List>
                  {expenseData.eventBreakdown.map((event, index) => (
                    <Box key={event.eventId}>
                      <ListItem sx={{ px: 0, flexDirection: 'column', alignItems: 'stretch' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 1 }}>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                              {event.eventTitle}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {formatDate(event.eventDate)} • {event.participantCount} participant{event.participantCount !== 1 ? 's' : ''}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Chip 
                              label={event.hasPaid ? 'Paid' : 'Unpaid'}
                              color={event.hasPaid ? 'success' : 'error'}
                              size="small"
                              sx={{ mb: 1 }}
                            />
                            <Typography variant="body2" color="textSecondary">
                              Your Share: ${event.userShare.toFixed(2)}
                            </Typography>
                            {event.amountOwed > 0 && (
                              <Typography variant="body2" color="error">
                                Owe: ${event.amountOwed.toFixed(2)}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        
                        {/* Expense Items */}
                        {event.expenseItems.length > 0 && (
                          <Box sx={{ ml: 2, mt: 1 }}>
                            <Typography variant="caption" color="textSecondary">
                              Items ({event.expenseItems.length}):
                            </Typography>
                            {event.expenseItems.map((item, itemIndex) => (
                              <Typography key={itemIndex} variant="caption" display="block" color="textSecondary">
                                • {item.itemName}: ${item.amount.toFixed(2)}
                              </Typography>
                            ))}
                            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'medium' }}>
                              Event Total: ${event.eventTotal.toFixed(2)}
                            </Typography>
                          </Box>
                        )}
                      </ListItem>
                      {index < expenseData.eventBreakdown.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              </Box>
            )}

            {expenseData.eventBreakdown.length === 0 && (
              <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                No events found for this user.
              </Typography>
            )}
          </Box>
        </Stack>
      </DialogContent>
      
      <DialogActions sx={{ flexDirection: 'column', gap: 1, p: 2 }}>
        <Button 
          onClick={handleSave} 
          variant="contained"
          disabled={!userData.name || !userData.email}
          fullWidth
          size="large"
          sx={{ py: 2 }}
        >
          Save Changes
        </Button>
        <Button 
          onClick={deleteUser}
          variant="outlined"
          color="error"
          disabled={loading}
          fullWidth
          size="large"
          sx={{ py: 2 }}
        >
          Delete User
        </Button>
        <Button 
          onClick={handleClose}
          fullWidth
          size="large"
          sx={{ py: 2 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default UserDetailView;
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
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

const UserDetailView = forwardRef(({ open, onClose, userId, onUserUpdated, onEventClick }, ref) => {
  const [userData, setUserData] = useState({
    name: '',
    role: 'user',
    createdAt: '',
    updatedAt: ''
  });
  
  const [originalName, setOriginalName] = useState('');
  
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

  useImperativeHandle(ref, () => ({
    refreshData: () => {
      if (userId) {
        fetchUserDetails();
        fetchUserExpenses();
      }
    }
  }));

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${userId}`);
      if (response.ok) {
        const user = await response.json();
        setUserData(user);
        setOriginalName(user.name || '');
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
    // Only save if the name has actually changed
    if (userData.name.trim() === originalName.trim()) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userData.name
        })
      });

      if (response.ok) {
        setOriginalName(userData.name); // Update the original name after successful save
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
      role: 'user',
      createdAt: '',
      updatedAt: ''
    });
    setOriginalName('');
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
            onBlur={handleSave}
            required
          />
          



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
                Across {expenseData.eventBreakdown.filter(event => !event.eventOwner || event.eventOwner._id !== userId).length} participated event{expenseData.eventBreakdown.filter(event => !event.eventOwner || event.eventOwner._id !== userId).length !== 1 ? 's' : ''}
              </Typography>
            </Box>

            {/* Events List */}
            {expenseData.eventBreakdown.length > 0 && (
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Events ({expenseData.eventBreakdown.length})
                </Typography>
                
                <List>
                  {expenseData.eventBreakdown.map((event, index) => {
                    const isOwner = event.eventOwner && event.eventOwner._id === userId;
                    return (
                      <Box key={event.eventId}>
                        <ListItem 
                          sx={{ 
                            px: 0, 
                            flexDirection: 'column', 
                            alignItems: 'stretch',
                            cursor: onEventClick ? 'pointer' : 'default',
                            '&:hover': onEventClick ? {
                              backgroundColor: 'rgba(0, 0, 0, 0.04)'
                            } : {}
                          }}
                          onClick={() => onEventClick && onEventClick(event.eventId)}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 1 }}>
                            <Box sx={{ flexGrow: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                  {event.eventTitle}
                                </Typography>
                                {isOwner && (
                                  <Typography variant="caption" sx={{ 
                                    color: '#1976d2', 
                                    fontWeight: 'medium',
                                    backgroundColor: '#e3f2fd',
                                    padding: '2px 6px',
                                    borderRadius: '3px',
                                    fontSize: '0.7rem'
                                  }}>
                                    Owner
                                  </Typography>
                                )}
                                {(event.remainingBalance !== undefined && event.remainingBalance === 0 && event.eventTotal > 0) && (
                                  <Typography variant="caption" sx={{ 
                                    color: '#4caf50', 
                                    fontWeight: 'medium',
                                    backgroundColor: '#e8f5e8',
                                    padding: '2px 4px',
                                    borderRadius: '3px',
                                    fontSize: '0.7rem'
                                  }}>
                                    Settled
                                  </Typography>
                                )}
                              </Box>
                              <Typography variant="body2" color="textSecondary">
                                {formatDate(event.eventDate)} • {event.participantCount} participant{event.participantCount !== 1 ? 's' : ''}
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              {isOwner ? (
                                <>
                                  <Typography variant="body2" color="textSecondary">
                                    Split: ${(event.splitPerPerson || 0).toFixed(2)}
                                  </Typography>
                                  <Typography variant="body2" color="textSecondary">
                                    Collected: ${(event.totalAmountPaid || 0).toFixed(2)}
                                  </Typography>
                                  <Typography variant="body2" color={event.remainingBalance > 0 ? "error" : "textSecondary"}>
                                    Remaining: ${(event.remainingBalance || 0).toFixed(2)}
                                  </Typography>
                                  <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 'medium' }}>
                                    Total: ${event.eventTotal.toFixed(2)}
                                  </Typography>
                                </>
                              ) : (
                                <>
                                  <Chip 
                                    label={event.amountPaid === 0 ? 'Unpaid' : event.amountPaid > event.userShare ? 'Overpaid' : event.amountOwed > 0 ? 'Partially Paid' : 'Paid'}
                                    color={event.amountPaid === 0 ? 'error' : event.amountPaid > event.userShare ? 'info' : event.amountOwed > 0 ? 'warning' : 'success'}
                                    size="small"
                                    sx={{ mb: 1 }}
                                  />
                                  <Typography variant="body2" color="textSecondary">
                                    Share: ${event.userShare.toFixed(2)}
                                  </Typography>
                                  <Typography variant="body2" color="textSecondary">
                                    Paid: ${event.amountPaid.toFixed(2)}
                                  </Typography>
                                  {event.amountOwed > 0 && (
                                    <Typography variant="body2" color="error">
                                      Still Owe: ${event.amountOwed.toFixed(2)}
                                    </Typography>
                                  )}
                                </>
                              )}
                            </Box>
                          </Box>
                        </ListItem>
                        {index < expenseData.eventBreakdown.length - 1 && <Divider />}
                      </Box>
                    );
                  })}
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
});

export default UserDetailView;
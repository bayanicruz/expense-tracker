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
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Edit as EditIcon, Close as CloseIcon, Check as CheckIcon } from '@mui/icons-material';
import LoadingOverlay from './LoadingOverlay';

const UserDetailView = forwardRef(({ open, onClose, userId, onUserUpdated, onEventClick }, ref) => {
  const [userData, setUserData] = useState({
    name: '',
    role: 'user',
    createdAt: '',
    updatedAt: ''
  });
  
  const [originalName, setOriginalName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  const [expenseData, setExpenseData] = useState({
    totalOwed: 0,
    eventCount: 0,
    eventBreakdown: []
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && userId) {
      fetchAllData();
    }
  }, [open, userId]);

  useImperativeHandle(ref, () => ({
    refreshData: () => {
      if (userId) {
        fetchAllData();
      }
    }
  }));

  const API_URL = process.env.REACT_APP_API_URL || '';

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchUserDetails(),
        fetchUserExpenses()
      ]);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}`);
      if (response.ok) {
        const user = await response.json();
        setUserData(user);
        setOriginalName(user.name || '');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const fetchUserExpenses = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}/expenses`);
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
      setIsEditing(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/users/${userId}`, {
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
        setIsEditing(false);
        if (onUserUpdated) onUserUpdated();
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleCancelEdit = () => {
    setUserData(prev => ({ ...prev, name: originalName }));
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const deleteUser = async () => {
    // Check if user has any events/expenses associated
    if (expenseData.eventBreakdown.length > 0) {
      alert(`Cannot delete user: ${userData.name || 'This user'} has ${expenseData.eventBreakdown.length} event${expenseData.eventBreakdown.length !== 1 ? 's' : ''} associated with them. Please remove them from all events first.`);
      return;
    }

    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        setLoading(true);
        
        const response = await fetch(`${API_URL}/api/users/${userId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          handleClose();
          if (onUserUpdated) onUserUpdated();
        } else {
          const errorData = await response.json();
          alert(`Failed to delete user: ${errorData.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user. Please try again.');
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
    setIsEditing(false);
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

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <LoadingOverlay loading={loading}>
        {/* Sticky Header */}
        <DialogTitle sx={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 1, 
          backgroundColor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                {isEditing ? (
                  <>
                    <TextField
                      value={userData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      variant="standard"
                      size="small"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSave();
                        } else if (e.key === 'Escape') {
                          handleCancelEdit();
                        }
                      }}
                      sx={{ 
                        '& .MuiInput-root': {
                          fontSize: '1.5rem',
                          fontWeight: 400
                        }
                      }}
                    />
                    <IconButton size="small" onClick={handleSave} color="primary">
                      <CheckIcon />
                    </IconButton>
                    <IconButton size="small" onClick={handleCancelEdit}>
                      <CloseIcon />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <Typography variant="h5" component="div">
                      {userData.name || 'User Details'}
                    </Typography>
                    <IconButton size="small" onClick={handleStartEdit}>
                      <EditIcon />
                    </IconButton>
                  </>
                )}
              </Box>
              {userData.createdAt && (
                <Typography variant="body2" color="textSecondary">
                  Created: {formatDate(userData.createdAt)}
                </Typography>
              )}
            </Box>
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
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Expense Summary */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Expense Summary
            </Typography>
            
            {expenseData.eventBreakdown.length === 0 ? (
              <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                No events found for this user.
              </Typography>
            ) : (
              <Stack spacing={2}>
                {/* Events Participated Accordion */}
                {(() => {
                  const participatedEvents = expenseData.eventBreakdown
                    .filter(event => (!event.eventOwner || event.eventOwner._id !== userId) && event.userShare > 0)
                    .sort((a, b) => {
                      // Determine payment status for sorting
                      const getPaymentStatus = (event) => {
                        const paid = event.amountPaid || 0;
                        const share = event.userShare || 0;
                        const roundedPaid = Math.round(paid * 100) / 100;
                        const roundedShare = Math.round(share * 100) / 100;
                        
                        if (roundedPaid === 0) return 'unpaid';
                        if (roundedPaid > roundedShare) return 'overpaid';
                        if (roundedPaid >= roundedShare) return 'paid';
                        return 'partial';
                      };
                      
                      const statusA = getPaymentStatus(a);
                      const statusB = getPaymentStatus(b);
                      
                      // Sort order: unpaid, partial, overpaid, paid
                      const statusOrder = { 'unpaid': 0, 'partial': 1, 'overpaid': 2, 'paid': 3 };
                      
                      if (statusOrder[statusA] !== statusOrder[statusB]) {
                        return statusOrder[statusA] - statusOrder[statusB];
                      }
                      
                      // If same status, sort by date (most recent first)
                      return new Date(b.eventDate) - new Date(a.eventDate);
                    });
                  return participatedEvents.length > 0 && (
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', pr: 2 }}>
                          <Typography variant="h6">
                            Events Participated ({participatedEvents.length})
                          </Typography>
                          <Box sx={{ 
                            px: 2, 
                            py: 1, 
                            backgroundColor: expenseData.totalOwed > 0 ? '#ffebee' : '#e8f5e8', 
                            borderRadius: 1, 
                            border: `1px solid ${expenseData.totalOwed > 0 ? '#f44336' : '#4caf50'}`
                          }}>
                            <Typography variant="body2" sx={{ 
                              color: expenseData.totalOwed > 0 ? '#d32f2f' : '#2e7d32',
                              fontWeight: 'medium'
                            }}>
                              {expenseData.totalOwed > 0 ? `$${expenseData.totalOwed.toFixed(2)} Outstanding` : 'All Paid Up!'}
                            </Typography>
                          </Box>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <List sx={{ p: 0 }}>
                          {participatedEvents.map((event, index) => (
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
                                    </Box>
                                    <Typography variant="body2" color="textSecondary">
                                      {formatDate(event.eventDate)} • {event.participantCount} participant{event.participantCount !== 1 ? 's' : ''} • Owner: {event.eventOwner ? event.eventOwner.name : 'Unknown'}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ textAlign: 'right' }}>
                                    <Chip 
                                      label={(() => {
                                        const paid = event.amountPaid || 0;
                                        const share = event.userShare || 0;
                                        const roundedPaid = Math.round(paid * 100) / 100;
                                        const roundedShare = Math.round(share * 100) / 100;
                                        
                                        if (roundedPaid === 0) return 'Unpaid';
                                        if (roundedPaid > roundedShare) return 'Overpaid';
                                        if (roundedPaid >= roundedShare) return 'Paid';
                                        return 'Partially Paid';
                                      })()}
                                      color={(() => {
                                        const paid = event.amountPaid || 0;
                                        const share = event.userShare || 0;
                                        const roundedPaid = Math.round(paid * 100) / 100;
                                        const roundedShare = Math.round(share * 100) / 100;
                                        
                                        if (roundedPaid === 0) return 'error';
                                        if (roundedPaid > roundedShare) return 'info';
                                        if (roundedPaid >= roundedShare) return 'success';
                                        return 'warning';
                                      })()}
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
                                  </Box>
                                </Box>
                              </ListItem>
                              {index < participatedEvents.length - 1 && <Divider />}
                            </Box>
                          ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>
                  );
                })()}

                {/* Events Owned Accordion */}
                {(() => {
                  const ownedEvents = expenseData.eventBreakdown.filter(event => event.eventOwner && event.eventOwner._id === userId);
                  const totalToCollect = ownedEvents.reduce((sum, event) => sum + (event.remainingBalance || 0), 0);
                  
                  return ownedEvents.length > 0 && (
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', pr: 2 }}>
                          <Typography variant="h6">
                            Events Owned ({ownedEvents.length})
                          </Typography>
                          <Box sx={{ 
                            px: 2, 
                            py: 1, 
                            backgroundColor: totalToCollect > 0 ? '#fff3e0' : '#e8f5e8', 
                            borderRadius: 1, 
                            border: `1px solid ${totalToCollect > 0 ? '#ff9800' : '#4caf50'}`
                          }}>
                            <Typography variant="body2" sx={{ 
                              color: totalToCollect > 0 ? '#e65100' : '#2e7d32',
                              fontWeight: 'medium'
                            }}>
                              {totalToCollect > 0 ? `$${totalToCollect.toFixed(2)} Pending` : 'All Collected!'}
                            </Typography>
                          </Box>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <List sx={{ p: 0 }}>
                          {ownedEvents.map((event, index) => (
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
                                    </Box>
                                    <Typography variant="body2" color="textSecondary">
                                      {formatDate(event.eventDate)} • {event.participantCount} participant{event.participantCount !== 1 ? 's' : ''}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="body2" color="textSecondary">
                                      Split: ${(event.splitPerPerson || 0).toFixed(2)}
                                    </Typography>
                                    {/* Show owner's payment if they are also a participant */}
                                    {event.userShare > 0 && (
                                      <Typography variant="body2" color="primary" sx={{ fontWeight: 'medium' }}>
                                        Share: ${(event.amountPaid || 0).toFixed(2)}
                                      </Typography>
                                    )}
                                    <Typography variant="body2" color="textSecondary">
                                      Collected: ${(event.totalAmountPaid || 0).toFixed(2)}
                                    </Typography>
                                    <Typography variant="body2" color={event.remainingBalance > 0 ? "error" : "textSecondary"}>
                                      Pending: ${(event.remainingBalance || 0).toFixed(2)}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 'medium' }}>
                                      Total: ${event.eventTotal.toFixed(2)}
                                    </Typography>
                                  </Box>
                                </Box>
                              </ListItem>
                              {index < ownedEvents.length - 1 && <Divider />}
                            </Box>
                          ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>
                  );
                })()}
              </Stack>
            )}
          </Box>
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
            onClick={deleteUser}
            variant="text"
            disabled={loading}
            size="small"
            sx={{ 
              color: 'text.disabled',
              fontSize: '0.75rem',
              textTransform: 'none',
              '&:hover': {
                color: 'error.main',
                backgroundColor: 'transparent'
              }
            }}
          >
            Delete User
          </Button>
          <Button 
            onClick={handleClose}
            variant="contained"
            size="large"
            sx={{ px: 4 }}
          >
            Close
          </Button>
        </DialogActions>
      </LoadingOverlay>
    </Dialog>
  );
});

export default UserDetailView;
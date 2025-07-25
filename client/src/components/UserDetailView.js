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
import Avatar from './Avatar';
import { getUserAvatar } from '../utils/avatarUtils';
import { calculateTotalOwesToOthers, calculateTotalOwedToUser, formatCurrency } from '../utils/debtUtils';
import MutualDebtsSection from './MembersOwedSection';

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
          zIndex: 10, 
          backgroundColor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
              {userData._id && (
                <Avatar
                  {...getUserAvatar(userData)}
                  size={48}
                  fontSize={16}
                  sx={{ position: 'relative', zIndex: 1 }}
                />
              )}
              <Box sx={{ flexGrow: 1 }}>
                {/* Name and Edit Controls */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
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
                            fontSize: '1.2rem',
                            fontWeight: 500
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
                      <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                        {userData.name || 'Member Details'}
                      </Typography>
                      <IconButton size="small" onClick={handleStartEdit}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </>
                  )}
                </Box>
                
                {/* Member Info and Financial Summary Row */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1
                }}>
                  {/* Member Since */}
                  {userData.createdAt && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      Member since {formatDate(userData.createdAt)}
                    </Typography>
                  )}
                  
                  {/* Financial Summary */}
                  {expenseData.eventBreakdown.length > 0 && (() => {
                    const totalOwes = calculateTotalOwesToOthers(expenseData.eventBreakdown, userId);
                    const totalOwedToUser = calculateTotalOwedToUser(expenseData.eventBreakdown, userId);
                    
                    if (totalOwes === 0 && totalOwedToUser === 0) return null;
                    
                    return (
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 0.75,
                        alignItems: 'center'
                      }}>
                        {totalOwes > 0 && (
                          <Chip
                            label={`Owes ${formatCurrency(totalOwes)}`}
                            size="small"
                            sx={{
                              backgroundColor: '#ffebee',
                              color: '#c62828',
                              border: '1px solid #ffcdd2',
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              height: '20px',
                              '& .MuiChip-label': {
                                px: 0.75
                              }
                            }}
                          />
                        )}
                        {totalOwedToUser > 0 && (
                          <Chip
                            label={`To Collect ${formatCurrency(totalOwedToUser)}`}
                            size="small"
                            sx={{
                              backgroundColor: '#e8f5e8',
                              color: '#2e7d32',
                              border: '1px solid #c8e6c8',
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              height: '20px',
                              '& .MuiChip-label': {
                                px: 0.75
                              }
                            }}
                          />
                        )}
                      </Box>
                    );
                  })()}
                </Box>
              </Box>
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
          {expenseData.eventBreakdown.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 3,
              background: 'rgba(0,0,0,0.02)',
              borderRadius: '8px',
              border: '1px solid rgba(0,0,0,0.05)'
            }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                No expense events found for this member.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
                {/* Member Balances Section */}
                <MutualDebtsSection 
                  eventBreakdown={expenseData.eventBreakdown}
                  userId={userId}
                />

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
                    <Accordion 
                      sx={{ 
                        background: 'white',
                        borderRadius: '12px',
                        border: '1px solid rgba(0,0,0,0.08)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        '&:before': { display: 'none' },
                        overflow: 'hidden'
                      }}
                    >
                      <AccordionSummary 
                        expandIcon={<ExpandMoreIcon sx={{ fontSize: '1.2rem' }} />}
                        sx={{
                          background: 'rgba(0,0,0,0.02)',
                          borderBottom: '1px solid rgba(0,0,0,0.05)',
                          minHeight: '48px',
                          py: 0.5,
                          '&.Mui-expanded': { minHeight: '48px' },
                          '& .MuiAccordionSummary-content': { my: 0.5 }
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem', color: 'text.primary' }}>
                          Events Participated ({participatedEvents.length})
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 0 }}>
                        <Stack spacing={0}>
                          {participatedEvents.map((event, index) => (
                            <Box key={event.eventId}>
                              <Box
                                sx={{ 
                                  p: 2,
                                  cursor: onEventClick ? 'pointer' : 'default',
                                  transition: 'background-color 0.2s',
                                  '&:hover': onEventClick ? {
                                    backgroundColor: 'rgba(0, 0, 0, 0.02)'
                                  } : {}
                                }}
                                onClick={() => onEventClick && onEventClick(event.eventId)}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                  <Box sx={{ flexGrow: 1, pr: 2 }}>
                                    <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.95rem', mb: 0.5 }}>
                                      {event.eventTitle}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                        {formatDate(event.eventDate)} • {event.participantCount} member{event.participantCount !== 1 ? 's' : ''}
                                      </Typography>
                                      {event.eventOwner && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                            •
                                          </Typography>
                                          <Avatar
                                            {...getUserAvatar(event.eventOwner)}
                                            size={16}
                                            fontSize={8}
                                          />
                                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                            {event.eventOwner.name}
                                          </Typography>
                                        </Box>
                                      )}
                                    </Box>
                                  </Box>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                                    <Chip 
                                      label={(() => {
                                        const paid = event.amountPaid || 0;
                                        const share = event.userShare || 0;
                                        const roundedPaid = Math.round(paid * 100) / 100;
                                        const roundedShare = Math.round(share * 100) / 100;
                                        
                                        if (roundedPaid === 0) return 'Unpaid';
                                        if (roundedPaid > roundedShare) return 'Overpaid';
                                        if (roundedPaid >= roundedShare) return 'Paid';
                                        return 'Partial';
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
                                      sx={{ fontSize: '0.7rem', height: '20px' }}
                                    />
                                  </Box>
                                </Box>
                                
                                <Box sx={{ 
                                  display: 'grid', 
                                  gridTemplateColumns: '1fr 1fr 1fr', 
                                  gap: 1,
                                  background: 'rgba(0,0,0,0.02)',
                                  borderRadius: '8px',
                                  p: 1.5
                                }}>
                                  <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                      Share
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                                      ${event.userShare.toFixed(2)}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                      Paid
                                    </Typography>
                                    <Typography variant="body2" sx={{ 
                                      fontWeight: 600, 
                                      fontSize: '0.85rem',
                                      color: event.amountPaid > 0 ? '#4caf50' : 'text.primary'
                                    }}>
                                      ${event.amountPaid.toFixed(2)}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                      {event.amountOwed > 0 ? 'Owes' : 'Status'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ 
                                      fontWeight: 600, 
                                      fontSize: '0.85rem',
                                      color: event.amountOwed > 0 ? '#f44336' : '#4caf50'
                                    }}>
                                      {event.amountOwed > 0 ? `$${event.amountOwed.toFixed(2)}` : '✓'}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                              {index < participatedEvents.length - 1 && (
                                <Divider sx={{ mx: 2 }} />
                              )}
                            </Box>
                          ))}
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  );
                })()}

                {/* Events Owned Accordion */}
                {(() => {
                  const ownedEvents = expenseData.eventBreakdown.filter(event => event.eventOwner && event.eventOwner._id === userId);
                  const totalToCollect = ownedEvents.reduce((sum, event) => sum + (event.remainingBalance || 0), 0);
                  
                  return ownedEvents.length > 0 && (
                    <Accordion 
                      sx={{ 
                        background: 'white',
                        borderRadius: '12px',
                        border: '1px solid rgba(0,0,0,0.08)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        '&:before': { display: 'none' },
                        overflow: 'hidden'
                      }}
                    >
                      <AccordionSummary 
                        expandIcon={<ExpandMoreIcon sx={{ fontSize: '1.2rem' }} />}
                        sx={{
                          background: 'rgba(0,0,0,0.02)',
                          borderBottom: '1px solid rgba(0,0,0,0.05)',
                          minHeight: '48px',
                          py: 0.5,
                          '&.Mui-expanded': { minHeight: '48px' },
                          '& .MuiAccordionSummary-content': { my: 0.5 }
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem', color: 'text.primary' }}>
                          Events Owned ({ownedEvents.length})
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 0 }}>
                        <Stack spacing={0}>
                          {ownedEvents.map((event, index) => (
                            <Box key={event.eventId}>
                              <Box
                                sx={{ 
                                  p: 2,
                                  cursor: onEventClick ? 'pointer' : 'default',
                                  transition: 'background-color 0.2s',
                                  '&:hover': onEventClick ? {
                                    backgroundColor: 'rgba(0, 0, 0, 0.02)'
                                  } : {}
                                }}
                                onClick={() => onEventClick && onEventClick(event.eventId)}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                  <Box sx={{ flexGrow: 1, pr: 2 }}>
                                    <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.95rem', mb: 0.5 }}>
                                      {event.eventTitle}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                      {formatDate(event.eventDate)} • {event.participantCount} member{event.participantCount !== 1 ? 's' : ''}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                                    <Chip 
                                      label={event.remainingBalance > 0 ? 'Pending' : 'Collected'}
                                      color={event.remainingBalance > 0 ? 'warning' : 'success'}
                                      size="small"
                                      sx={{ fontSize: '0.7rem', height: '20px' }}
                                    />
                                  </Box>
                                </Box>
                                
                                <Box sx={{ 
                                  display: 'grid', 
                                  gridTemplateColumns: '1fr 1fr 1fr 1fr', 
                                  gap: 1,
                                  background: 'rgba(0,0,0,0.02)',
                                  borderRadius: '8px',
                                  p: 1.5
                                }}>
                                  <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                      Total
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                                      ${event.eventTotal.toFixed(2)}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                      Split
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                                      ${(event.splitPerPerson || 0).toFixed(2)}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                      Collected
                                    </Typography>
                                    <Typography variant="body2" sx={{ 
                                      fontWeight: 600, 
                                      fontSize: '0.85rem',
                                      color: (event.totalAmountPaid || 0) > 0 ? '#4caf50' : 'text.primary'
                                    }}>
                                      ${(event.totalAmountPaid || 0).toFixed(2)}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                      Pending
                                    </Typography>
                                    <Typography variant="body2" sx={{ 
                                      fontWeight: 600, 
                                      fontSize: '0.85rem',
                                      color: event.remainingBalance > 0 ? '#ff9800' : '#4caf50'
                                    }}>
                                      {event.remainingBalance > 0 ? `$${event.remainingBalance.toFixed(2)}` : '✓'}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                              {index < ownedEvents.length - 1 && (
                                <Divider sx={{ mx: 2 }} />
                              )}
                            </Box>
                          ))}
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  );
                })()}
            </Stack>
          )}
        </Stack>
        </DialogContent>
        
        {/* Sticky Footer */}
        <DialogActions sx={{ 
          position: 'sticky', 
          bottom: 0, 
          zIndex: 10, 
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
            sx={{ px: 4, backgroundColor: 'black', color: 'white', '&:hover': { backgroundColor: '#333333' } }}
          >
            Close
          </Button>
        </DialogActions>
      </LoadingOverlay>
    </Dialog>
  );
});

export default UserDetailView;
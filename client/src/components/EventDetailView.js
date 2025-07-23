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
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Autocomplete,
  CircularProgress,
  Divider,
  Breadcrumbs,
  Link
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Close as CloseIcon, Edit as EditIcon, Check as CheckIcon } from '@mui/icons-material';
import LoadingOverlay from './LoadingOverlay';
import useApiCall from '../hooks/useApiCall';

function EventDetailView({ open, onClose, eventId, onEventUpdated, breadcrumbUser, onBreadcrumbClick }) {
  const [eventData, setEventData] = useState({
    title: '',
    eventDate: '',
    participants: [],
    settled: false
  });
  
  const [originalTitle, setOriginalTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  
  const [expenseItems, setExpenseItems] = useState([]);
  const [newExpenseItem, setNewExpenseItem] = useState({ itemName: '', amount: '' });
  
  const [userSearch, setUserSearch] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [participantDetails, setParticipantDetails] = useState([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [showAddExpenseItem, setShowAddExpenseItem] = useState(false);
  const { loading: apiLoading, apiCall } = useApiCall();

  useEffect(() => {
    if (open && eventId) {
      fetchEventDetails();
      fetchExpenseItems();
    }
  }, [open, eventId]);

  const API_URL = process.env.REACT_APP_API_URL || '';

  const fetchEventDetails = async () => {
    await apiCall(async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/events/${eventId}`);
        if (response.ok) {
          const event = await response.json();
          setEventData(event);
          setOriginalTitle(event.title || '');
          
          // Handle different participant formats
          if (event.participants && event.participants.length > 0) {
            const firstParticipant = event.participants[0];
            
            if (typeof firstParticipant === 'object' && firstParticipant.user && firstParticipant.user.name) {
              // New format: participants have populated user and amountPaid fields
              const participantsWithPaymentStatus = event.participants.map(p => ({
                ...p.user,
                amountPaid: p.amountPaid || 0
              }));
              setParticipantDetails(participantsWithPaymentStatus);
            } else if (typeof firstParticipant === 'object' && firstParticipant.name) {
              // Old format: participants are populated user objects
              const participants = event.participants.map(p => ({ ...p, amountPaid: 0 }));
              setParticipantDetails(participants);
            } else if (typeof firstParticipant === 'string') {
              // Participants are just IDs, need to fetch details
              const participantPromises = event.participants.map(async (participantId) => {
                const userResponse = await fetch(`${API_URL}/api/users/${participantId}`);
                const user = userResponse.ok ? await userResponse.json() : null;
                return user ? { ...user, amountPaid: 0 } : null;
              });
              const participants = await Promise.all(participantPromises);
              const filteredParticipants = participants.filter(p => p !== null);
              setParticipantDetails(filteredParticipants);
            } else {
              // Data might be corrupted, skip for now
              console.warn('Participant data appears corrupted:', event.participants);
              setParticipantDetails([]);
            }
          } else {
            setParticipantDetails([]);
          }
        }
      } catch (error) {
        console.error('Error fetching event details:', error);
      } finally {
        setLoading(false);
      }
    });
  };

  const fetchExpenseItems = async () => {
    await apiCall(async () => {
      try {
        const response = await fetch(`${API_URL}/api/expense-items?eventId=${eventId}`);
        if (response.ok) {
          const items = await response.json();
          setExpenseItems(items);
        }
      } catch (error) {
        console.error('Error fetching expense items:', error);
      }
    });
  };

  const searchUsers = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setAvailableUsers([]);
      return;
    }

    setUserSearchLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/users`);
      if (response.ok) {
        const users = await response.json();
        const filteredUsers = users.filter(user => 
          (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
        ).filter(user => {
          // Exclude already added participants - check both populated and ID formats
          const currentParticipantIds = eventData.participants.map(p => 
            typeof p === 'object' ? p._id : p
          );
          return !currentParticipantIds.includes(user._id);
        });
        setAvailableUsers(filteredUsers);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setUserSearchLoading(false);
    }
  };

  const addParticipant = async (user) => {
    await apiCall(async () => {
      try {
        const participantsForSave = [...participantDetails, { ...user, amountPaid: 0 }].map(p => ({
          user: p._id,
          amountPaid: p.amountPaid || 0
        }));
        
        const response = await fetch(`${API_URL}/api/events/${eventId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            participants: participantsForSave
          })
        });

        if (response.ok) {
          setParticipantDetails(prev => [...prev, { ...user, amountPaid: 0 }]);
          setUserSearch('');
          setAvailableUsers([]);
          setShowAddParticipant(false);
          if (onEventUpdated) onEventUpdated();
        }
      } catch (error) {
        console.error('Error adding participant:', error);
      }
    });
  };

  const removeParticipant = async (userId) => {
    const participant = participantDetails.find(p => p._id === userId);
    const participantName = participant ? participant.name || 'Unknown' : 'Unknown';
    
    if (window.confirm(`Are you sure you want to remove ${participantName} from this event? This action cannot be undone.`)) {
      try {
        const updatedParticipants = participantDetails.filter(p => p._id !== userId);
        const participantsForSave = updatedParticipants.map(p => ({
          user: p._id,
          amountPaid: p.amountPaid || 0
        }));
        
        const response = await fetch(`${API_URL}/api/events/${eventId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            participants: participantsForSave
          })
        });

        if (response.ok) {
          setParticipantDetails(updatedParticipants);
          if (onEventUpdated) onEventUpdated();
        }
      } catch (error) {
        console.error('Error removing participant:', error);
      }
    }
  };

  const updatePaymentAmount = async (participantId, newAmount) => {
    await apiCall(async () => {
      try {
        const response = await fetch(`${API_URL}/api/events/${eventId}/participants/${participantId}/payment`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amountPaid: parseFloat(newAmount) || 0
          })
        });

        if (response.ok) {
          setParticipantDetails(prev => 
            prev.map(participant => 
              participant._id === participantId 
                ? { ...participant, amountPaid: parseFloat(newAmount) || 0 }
                : participant
            )
          );
          if (onEventUpdated) onEventUpdated();
        }
      } catch (error) {
        console.error('Error updating payment amount:', error);
      }
    });
  };

  const handleNewExpenseChange = (field, value) => {
    setNewExpenseItem(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addExpenseItem = async () => {
    if (!newExpenseItem.itemName.trim() || !newExpenseItem.amount || parseFloat(newExpenseItem.amount) <= 0) {
      return;
    }

    await apiCall(async () => {
      try {
        const response = await fetch(`${API_URL}/api/expense-items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventId: eventId,
            itemName: newExpenseItem.itemName,
            amount: parseFloat(newExpenseItem.amount)
          })
        });

        if (response.ok) {
          const createdItem = await response.json();
          setExpenseItems(prev => [...prev, createdItem]);
          setNewExpenseItem({ itemName: '', amount: '' });
          setShowAddExpenseItem(false);
          if (onEventUpdated) onEventUpdated();
        }
      } catch (error) {
        console.error('Error adding expense item:', error);
      }
    });
  };

  const removeExpenseItem = async (itemId) => {
    const expenseItem = expenseItems.find(item => item._id === itemId);
    const itemName = expenseItem ? expenseItem.itemName || 'Unknown item' : 'Unknown item';
    const itemAmount = expenseItem ? `$${expenseItem.amount.toFixed(2)}` : '';
    
    if (window.confirm(`Are you sure you want to remove "${itemName}" ${itemAmount} from this event? This action cannot be undone.`)) {
      try {
        const response = await fetch(`${API_URL}/api/expense-items/${itemId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setExpenseItems(prev => prev.filter(item => item._id !== itemId));
          if (onEventUpdated) onEventUpdated();
        }
      } catch (error) {
        console.error('Error removing expense item:', error);
      }
    }
  };


  const deleteEvent = async () => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        setLoading(true);
        
        // Delete all expense items for this event
        for (const item of expenseItems) {
          if (!item.isNew) { // Only delete existing items
            await fetch(`${API_URL}/api/expense-items/${item._id}`, {
              method: 'DELETE'
            });
          }
        }
        
        // Delete the event
        const response = await fetch(`${API_URL}/api/events/${eventId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          handleClose();
          if (onEventUpdated) onEventUpdated();
        }
      } catch (error) {
        console.error('Error deleting event:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClose = () => {
    // Clear all state before closing
    setEventData({ title: '', eventDate: '', participants: [], settled: false });
    setOriginalTitle('');
    setIsEditingTitle(false);
    setExpenseItems([]);
    setParticipantDetails([]);
    setNewExpenseItem({ itemName: '', amount: '' });
    setUserSearch('');
    setAvailableUsers([]);
    setUserSearchLoading(false);
    setLoading(false);
    setShowAddParticipant(false);
    setShowAddExpenseItem(false);
    onClose();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculateTotal = () => {
    return expenseItems.reduce((total, item) => total + item.amount, 0).toFixed(2);
  };

  const calculateSplitPerPerson = () => {
    const total = parseFloat(calculateTotal());
    const participantCount = participantDetails.length;
    
    if (participantCount === 0) return "0.00";
    return (total / participantCount).toFixed(2);
  };

  const calculateRemainingBalance = () => {
    const total = parseFloat(calculateTotal());
    const totalAmountPaid = participantDetails.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
    return Math.max(0, total - totalAmountPaid).toFixed(2);
  };

  const calculatePaidAmount = () => {
    return participantDetails.reduce((sum, p) => sum + (p.amountPaid || 0), 0).toFixed(2);
  };

  const handleTitleSave = async () => {
    // Only save if the title has actually changed
    if (eventData.title.trim() === originalTitle.trim()) {
      setIsEditingTitle(false);
      return;
    }

    await apiCall(async () => {
      try {
        const response = await fetch(`${API_URL}/api/events/${eventId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: eventData.title
          })
        });

        if (response.ok) {
          setOriginalTitle(eventData.title);
          setIsEditingTitle(false);
          if (onEventUpdated) onEventUpdated();
        }
      } catch (error) {
        console.error('Error updating event title:', error);
      }
    });
  };

  const handleTitleCancelEdit = () => {
    setEventData(prev => ({ ...prev, title: originalTitle }));
    setIsEditingTitle(false);
  };

  const handleTitleStartEdit = () => {
    setIsEditingTitle(true);
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogContent sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <LoadingOverlay loading={apiLoading}>
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
              {breadcrumbUser && (
                <Breadcrumbs sx={{ mb: 1 }}>
                  <Link 
                    component="button" 
                    variant="body2" 
                    onClick={() => onBreadcrumbClick ? onBreadcrumbClick() : onClose()}
                    sx={{ 
                      textDecoration: 'none',
                      color: 'primary.main',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    {breadcrumbUser.name}
                  </Link>
                  <Typography variant="body2" color="text.primary">
                    {eventData.title || 'Event Details'}
                  </Typography>
                </Breadcrumbs>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                {isEditingTitle ? (
                  <>
                    <TextField
                      value={eventData.title}
                      onChange={(e) => setEventData(prev => ({ ...prev, title: e.target.value }))}
                      variant="standard"
                      size="small"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleTitleSave();
                        } else if (e.key === 'Escape') {
                          handleTitleCancelEdit();
                        }
                      }}
                      sx={{ 
                        '& .MuiInput-root': {
                          fontSize: '1.5rem',
                          fontWeight: 400
                        }
                      }}
                    />
                    <IconButton size="small" onClick={handleTitleSave} color="primary">
                      <CheckIcon />
                    </IconButton>
                    <IconButton size="small" onClick={handleTitleCancelEdit}>
                      <CloseIcon />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <Typography variant="h5" component="div">
                      {eventData.title || 'Event Details'}
                    </Typography>
                    <IconButton size="small" onClick={handleTitleStartEdit}>
                      <EditIcon />
                    </IconButton>
                  </>
                )}
                {parseFloat(calculateRemainingBalance()) === 0 && expenseItems.length > 0 && (
                  <Typography variant="body2" sx={{ 
                    color: '#4caf50', 
                    fontWeight: 'medium',
                    backgroundColor: '#e8f5e8',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '0.75rem'
                  }}>
                    Settled
                  </Typography>
                )}
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                {eventData.eventDate ? formatDate(eventData.eventDate) : ''}
              </Typography>
              {eventData.owner && (
                <Typography variant="body2" sx={{ 
                  color: '#1976d2', 
                  fontWeight: 'medium',
                  backgroundColor: '#e3f2fd',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  display: 'inline-block'
                }}>
                  Owner: {eventData.owner.name || 'Unknown'}
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

          {/* Financial Summary */}
          {expenseItems.length > 0 && (
            <Box sx={{ 
              p: 2, 
              backgroundColor: '#f5f5f5', 
              borderRadius: 1, 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Box>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                  Total
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  ${calculateTotal()}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body1" sx={{ 
                  color: parseFloat(calculateRemainingBalance()) > 0 ? '#f44336' : '#4caf50' 
                }}>
                  ${calculateRemainingBalance()} remaining
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  ${calculateSplitPerPerson()} per {participantDetails.length} participant{participantDetails.length !== 1 ? 's' : ''}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Participants Section */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Participants
              </Typography>
              <Button
                startIcon={showAddParticipant ? <CloseIcon /> : <AddIcon />}
                variant="outlined"
                size="small"
                onClick={() => {
                  setShowAddParticipant(!showAddParticipant);
                  if (!showAddParticipant) {
                    setUserSearch('');
                    setAvailableUsers([]);
                  }
                }}
                sx={{ textTransform: 'none' }}
              >
                {showAddParticipant ? 'Cancel' : 'Add'}
              </Button>
            </Box>

            {/* Current Participants */}
            {participantDetails.length > 0 ? (
              <List sx={{ p: 0 }}>
                {participantDetails.map((participant) => (
                  <ListItem key={participant._id} sx={{ px: 0, py: 1 }}>
                    <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1">
                          {participant.name || 'Unknown'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            const splitAmount = calculateSplitPerPerson();
                            updatePaymentAmount(participant._id, splitAmount);
                          }}
                          sx={{ 
                            textTransform: 'none',
                            minWidth: '60px',
                            fontSize: '0.75rem'
                          }}
                        >
                          Pay
                        </Button>
                        <TextField
                          label="Amount Paid"
                          type="number"
                          size="small"
                          value={participant.amountPaid || 0}
                          onChange={(e) => updatePaymentAmount(participant._id, e.target.value)}
                          inputProps={{ min: 0, step: 0.01 }}
                          sx={{ 
                            width: '120px',
                            '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                              display: 'none',
                            },
                            '& input[type=number]': {
                              MozAppearance: 'textfield',
                            },
                          }}
                          InputProps={{
                            endAdornment: (participant.amountPaid || 0) > 0 && (
                              <IconButton
                                size="small"
                                onClick={() => updatePaymentAmount(participant._id, 0)}
                                sx={{ p: 0.5 }}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            ),
                          }}
                        />
                        <IconButton 
                          onClick={() => removeParticipant(participant._id)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                No participants added yet
              </Typography>
            )}

            {/* Add Participant (conditionally shown) */}
            {showAddParticipant && (
              <Box sx={{ mt: 2 }}>
                <Autocomplete
                  freeSolo
                  options={availableUsers}
                  getOptionLabel={(option) => 
                    typeof option === 'string' ? option : `${option.name || 'Unknown'}`
                  }
                  inputValue={userSearch}
                  onInputChange={(event, newInputValue) => {
                    setUserSearch(newInputValue);
                    searchUsers(newInputValue);
                  }}
                  onChange={(event, value) => {
                    if (value && typeof value === 'object') {
                      addParticipant(value);
                    }
                  }}
                  loading={userSearchLoading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search participants..."
                      size="small"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {userSearchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Typography variant="body1">{option.name || 'Unknown'}</Typography>
                    </Box>
                  )}
                />
              </Box>
            )}
          </Box>

          <Divider />

          {/* Expense Items Section */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Expense Items
              </Typography>
              <Button
                startIcon={showAddExpenseItem ? <CloseIcon /> : <AddIcon />}
                variant="outlined"
                size="small"
                onClick={() => {
                  setShowAddExpenseItem(!showAddExpenseItem);
                  if (!showAddExpenseItem) {
                    setNewExpenseItem({ itemName: '', amount: '' });
                  }
                }}
                sx={{ textTransform: 'none' }}
              >
                {showAddExpenseItem ? 'Cancel' : 'Add'}
              </Button>
            </Box>

            {/* Current Expense Items */}
            {expenseItems.length > 0 ? (
              <List sx={{ p: 0 }}>
                {expenseItems.map((item) => (
                  <ListItem key={item._id} sx={{ px: 0, py: 1 }}>
                    <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
                      <ListItemText 
                        primary={item.itemName}
                        secondary={`$${item.amount.toFixed(2)}`}
                      />
                      <IconButton 
                        onClick={() => removeExpenseItem(item._id)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                No expense items added yet
              </Typography>
            )}

            {/* Add New Expense Item (conditionally shown) */}
            {showAddExpenseItem && (
              <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  label="Item Name"
                  value={newExpenseItem.itemName}
                  onChange={(e) => handleNewExpenseChange('itemName', e.target.value)}
                  size="small"
                  sx={{ flexGrow: 1 }}
                />
                <TextField
                  label="Amount"
                  type="number"
                  value={newExpenseItem.amount}
                  onChange={(e) => handleNewExpenseChange('amount', e.target.value)}
                  size="small"
                  sx={{ 
                    width: '120px',
                    '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                      display: 'none',
                    },
                    '& input[type=number]': {
                      MozAppearance: 'textfield',
                    },
                  }}
                  inputProps={{ min: 0, step: 0.01 }}
                  InputProps={{
                    endAdornment: newExpenseItem.amount && parseFloat(newExpenseItem.amount) > 0 && (
                      <IconButton
                        size="small"
                        onClick={() => handleNewExpenseChange('amount', '')}
                        sx={{ p: 0.5 }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    ),
                  }}
                />
                <IconButton 
                  onClick={addExpenseItem}
                  color="primary"
                  disabled={!newExpenseItem.itemName.trim() || !newExpenseItem.amount}
                >
                  <AddIcon />
                </IconButton>
              </Box>
            )}
          </Box>
        </Stack>
      </DialogContent>
      
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
          onClick={deleteEvent}
          variant="text"
          disabled={loading || apiLoading}
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
          Delete Event
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
}

export default EventDetailView;
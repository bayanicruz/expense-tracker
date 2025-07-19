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
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Close as CloseIcon } from '@mui/icons-material';

function EventDetailView({ open, onClose, eventId, onEventUpdated }) {
  const [eventData, setEventData] = useState({
    title: '',
    eventDate: '',
    participants: [],
    settled: false
  });
  
  const [expenseItems, setExpenseItems] = useState([]);
  const [newExpenseItem, setNewExpenseItem] = useState({ itemName: '', amount: '' });
  
  const [userSearch, setUserSearch] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [participantDetails, setParticipantDetails] = useState([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && eventId) {
      fetchEventDetails();
      fetchExpenseItems();
    }
  }, [open, eventId]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/events/${eventId}`);
      if (response.ok) {
        const event = await response.json();
        setEventData(event);
        
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
              const userResponse = await fetch(`/api/users/${participantId}`);
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
  };

  const fetchExpenseItems = async () => {
    try {
      const response = await fetch(`/api/expense-items?eventId=${eventId}`);
      if (response.ok) {
        const items = await response.json();
        setExpenseItems(items);
      }
    } catch (error) {
      console.error('Error fetching expense items:', error);
    }
  };

  const searchUsers = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setAvailableUsers([]);
      return;
    }

    setUserSearchLoading(true);
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const users = await response.json();
        const filteredUsers = users.filter(user => 
          (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
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
    try {
      const participantsForSave = [...participantDetails, { ...user, amountPaid: 0 }].map(p => ({
        user: p._id,
        amountPaid: p.amountPaid || 0
      }));
      
      const response = await fetch(`/api/events/${eventId}`, {
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
        if (onEventUpdated) onEventUpdated();
      }
    } catch (error) {
      console.error('Error adding participant:', error);
    }
  };

  const removeParticipant = async (userId) => {
    try {
      const updatedParticipants = participantDetails.filter(p => p._id !== userId);
      const participantsForSave = updatedParticipants.map(p => ({
        user: p._id,
        amountPaid: p.amountPaid || 0
      }));
      
      const response = await fetch(`/api/events/${eventId}`, {
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
  };

  const updatePaymentAmount = async (participantId, newAmount) => {
    try {
      const response = await fetch(`/api/events/${eventId}/participants/${participantId}/payment`, {
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

    try {
      const response = await fetch('/api/expense-items', {
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
        if (onEventUpdated) onEventUpdated();
      }
    } catch (error) {
      console.error('Error adding expense item:', error);
    }
  };

  const removeExpenseItem = async (itemId) => {
    try {
      const response = await fetch(`/api/expense-items/${itemId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setExpenseItems(prev => prev.filter(item => item._id !== itemId));
        if (onEventUpdated) onEventUpdated();
      }
    } catch (error) {
      console.error('Error removing expense item:', error);
    }
  };


  const deleteEvent = async () => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        setLoading(true);
        
        // Delete all expense items for this event
        for (const item of expenseItems) {
          if (!item.isNew) { // Only delete existing items
            await fetch(`/api/expense-items/${item._id}`, {
              method: 'DELETE'
            });
          }
        }
        
        // Delete the event
        const response = await fetch(`/api/events/${eventId}`, {
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
    setExpenseItems([]);
    setParticipantDetails([]);
    setNewExpenseItem({ itemName: '', amount: '' });
    setUserSearch('');
    setAvailableUsers([]);
    setUserSearchLoading(false);
    setLoading(false);
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
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" component="div" sx={{ mb: 1 }}>
              {eventData.title || 'Event Details'}
            </Typography>
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
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>

          {/* Financial Summary - Enhanced */}
          {expenseItems.length > 0 && (
            <Box sx={{ 
              p: 3, 
              backgroundColor: '#e3f2fd', 
              borderRadius: 2, 
              border: '1px solid #2196f3'
            }}>
              {/* Total and Split Row */}
              <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                    ${calculateTotal()}
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#1976d2' }}>
                    Total Amount
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                    ${calculateSplitPerPerson()}
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#1976d2' }}>
                    Per Person
                  </Typography>
                </Box>
              </Box>
              
              {/* Payment Status Row */}
              <Box sx={{ display: 'flex', justifyContent: 'space-around', pt: 2, borderTop: '1px solid #2196f3' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 'medium' }}>
                    ${calculatePaidAmount()}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Paid
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ color: '#f44336', fontWeight: 'medium' }}>
                    ${calculateRemainingBalance()}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Remaining
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 'medium' }}>
                    {participantDetails.length} people
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Participants
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* Expense Items Section */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Expense Items
            </Typography>

            {/* Add New Expense Item */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
              <TextField
                label="Item Name"
                value={newExpenseItem.itemName}
                onChange={(e) => handleNewExpenseChange('itemName', e.target.value)}
                sx={{ flexGrow: 1 }}
              />
              <TextField
                label="Amount"
                type="number"
                value={newExpenseItem.amount}
                onChange={(e) => handleNewExpenseChange('amount', e.target.value)}
                sx={{ width: '120px' }}
                inputProps={{ min: 0, step: 0.01 }}
              />
              <IconButton 
                onClick={addExpenseItem}
                color="primary"
                disabled={!newExpenseItem.itemName.trim() || !newExpenseItem.amount}
              >
                <AddIcon />
              </IconButton>
            </Box>

            {/* Current Expense Items */}
            <List>
              {expenseItems.map((item) => (
                <ListItem key={item._id} sx={{ px: 0 }}>
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
          </Box>

          <Divider />

          {/* Participants Section */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Participants
            </Typography>
            
            <Autocomplete
              freeSolo
              options={availableUsers}
              getOptionLabel={(option) => 
                typeof option === 'string' ? option : `${option.name || 'Unknown'} (${option.email || 'No email'})`
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
                  label="Add participants..."
                  placeholder="Type to search for users"
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
                  <Box>
                    <Typography variant="body1">{option.name || 'Unknown'}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {option.email || 'No email'}
                    </Typography>
                  </Box>
                </Box>
              )}
            />

            {/* Current Participants */}
            {participantDetails.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  Current participants:
                </Typography>
                <List>
                  {participantDetails.map((participant) => (
                    <ListItem key={participant._id} sx={{ px: 0 }}>
                      <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body1">
                            {participant.name || 'Unknown'}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {participant.email || 'No email'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TextField
                            label="Amount Paid"
                            type="number"
                            size="small"
                            value={participant.amountPaid || 0}
                            onChange={(e) => updatePaymentAmount(participant._id, e.target.value)}
                            inputProps={{ min: 0, step: 0.01 }}
                            sx={{ width: '120px' }}
                          />
                          <IconButton 
                            onClick={() => removeParticipant(participant._id)}
                            color="error"
                            size="small"
                          >
                            <CloseIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        </Stack>
      </DialogContent>
      
      <DialogActions sx={{ flexDirection: 'column', gap: 1, p: 2 }}>
        <Button 
          onClick={deleteEvent}
          variant="outlined"
          color="error"
          disabled={loading}
          fullWidth
          size="large"
          sx={{ py: 2 }}
        >
          Delete Event
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

export default EventDetailView;
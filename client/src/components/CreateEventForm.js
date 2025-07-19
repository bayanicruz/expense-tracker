import React, { useState } from 'react';
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
  Stack,
  Chip,
  Autocomplete,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Close as CloseIcon } from '@mui/icons-material';

function CreateEventForm({ open, onClose, onEventCreated }) {
  const [eventData, setEventData] = useState({
    title: '',
    eventDate: '',
    participants: []
  });
  
  const [expenseItems, setExpenseItems] = useState([
    { itemName: '', amount: '' }
  ]);
  
  const [userSearch, setUserSearch] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);

  const handleEventChange = (field, value) => {
    setEventData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExpenseChange = (index, field, value) => {
    const updatedItems = [...expenseItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    setExpenseItems(updatedItems);
  };

  const addExpenseItem = () => {
    setExpenseItems(prev => [...prev, { itemName: '', amount: '' }]);
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
        );
        setAvailableUsers(filteredUsers);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setUserSearchLoading(false);
    }
  };

  const addParticipant = (user) => {
    if (!selectedParticipants.find(p => p._id === user._id)) {
      setSelectedParticipants(prev => [...prev, user]);
      setEventData(prev => ({
        ...prev,
        participants: [...prev.participants, user._id]
      }));
    }
    setUserSearch('');
    setAvailableUsers([]);
  };

  const removeParticipant = (userId) => {
    setSelectedParticipants(prev => prev.filter(p => p._id !== userId));
    setEventData(prev => ({
      ...prev,
      participants: prev.participants.filter(id => id !== userId)
    }));
  };

  const removeExpenseItem = (index) => {
    if (expenseItems.length > 1) {
      setExpenseItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    try {
      // Create event first
      const eventResponse = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
      });

      if (!eventResponse.ok) {
        throw new Error('Failed to create event');
      }

      const createdEvent = await eventResponse.json();

      // Create expense items for the event
      const validExpenseItems = expenseItems.filter(
        item => item.itemName.trim() && item.amount && parseFloat(item.amount) > 0
      );

      for (const item of validExpenseItems) {
        await fetch('/api/expense-items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventId: createdEvent._id,
            itemName: item.itemName,
            amount: parseFloat(item.amount)
          })
        });
      }

      // Reset form
      setEventData({ title: '', eventDate: '', participants: [] });
      setExpenseItems([{ itemName: '', amount: '' }]);
      setSelectedParticipants([]);
      setUserSearch('');
      setAvailableUsers([]);
      
      // Notify parent and close
      if (onEventCreated) onEventCreated();
      onClose();
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const calculateTotal = () => {
    return expenseItems.reduce((total, item) => {
      const amount = parseFloat(item.amount) || 0;
      return total + amount;
    }, 0).toFixed(2);
  };

  const calculateSplitPerPerson = () => {
    const total = parseFloat(calculateTotal());
    const participantCount = selectedParticipants.length;
    
    if (participantCount === 0) return "0.00";
    return (total / participantCount).toFixed(2);
  };

  const handleClose = () => {
    setEventData({ title: '', eventDate: '', participants: [] });
    setExpenseItems([{ itemName: '', amount: '' }]);
    setSelectedParticipants([]);
    setUserSearch('');
    setAvailableUsers([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Create New Event</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Event Details */}
          <TextField
            label="Event Title"
            fullWidth
            value={eventData.title}
            onChange={(e) => handleEventChange('title', e.target.value)}
            required
          />
          
          <TextField
            label="Event Date"
            type="date"
            fullWidth
            value={eventData.eventDate}
            onChange={(e) => handleEventChange('eventDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
            required
          />

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
              value={null}
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
                  label="Search users..."
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

            {/* Selected Participants Tags */}
            {selectedParticipants.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  Selected participants:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedParticipants.map((participant) => (
                    <Chip
                      key={participant._id}
                      label={`${participant.name || 'Unknown'} (${participant.email || 'No email'})`}
                      onDelete={() => removeParticipant(participant._id)}
                      deleteIcon={<CloseIcon />}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>

          {/* Expense Items Section */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Expense Items
              </Typography>
              <IconButton onClick={addExpenseItem} color="primary">
                <AddIcon />
              </IconButton>
            </Box>

            <List>
              {expenseItems.map((item, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <Box sx={{ display: 'flex', gap: 2, width: '100%', alignItems: 'center' }}>
                    <TextField
                      label="Item Name"
                      value={item.itemName}
                      onChange={(e) => handleExpenseChange(index, 'itemName', e.target.value)}
                      sx={{ flexGrow: 1 }}
                    />
                    <TextField
                      label="Amount"
                      type="number"
                      value={item.amount}
                      onChange={(e) => handleExpenseChange(index, 'amount', e.target.value)}
                      sx={{ width: '120px' }}
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                    <IconButton 
                      onClick={() => removeExpenseItem(index)}
                      disabled={expenseItems.length === 1}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
            </List>

            {/* Total and Split - Show if there are expense items with amounts */}
            {expenseItems.some(item => item.amount && parseFloat(item.amount) > 0) && (
              <Box sx={{ 
                mt: 2, 
                p: 3, 
                backgroundColor: '#e3f2fd', 
                borderRadius: 2, 
                border: '1px solid #2196f3',
                textAlign: 'center'
              }}>
                <Typography variant="h4" sx={{ mb: 1, color: '#1976d2' }}>
                  ${calculateSplitPerPerson()}
                </Typography>
                <Typography variant="h6" sx={{ mb: 1, color: '#1976d2' }}>
                  Per Person ({selectedParticipants.length} people)
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Total: ${calculateTotal()}
                </Typography>
              </Box>
            )}
          </Box>
        </Stack>
      </DialogContent>
      
      <DialogActions sx={{ flexDirection: 'column', gap: 1, p: 2 }}>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!eventData.title || !eventData.eventDate}
          fullWidth
          size="large"
          sx={{ py: 2 }}
        >
          Create Event
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

export default CreateEventForm;
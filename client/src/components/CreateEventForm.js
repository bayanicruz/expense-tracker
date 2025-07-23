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
import LoadingOverlay from './LoadingOverlay';
import useApiCall from '../hooks/useApiCall';

function CreateEventForm({ open, onClose, onEventCreated }) {
  const [eventData, setEventData] = useState({
    title: '',
    eventDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    owner: '',
    participants: []
  });
  
  const [expenseItems, setExpenseItems] = useState([
    { itemName: 'Expense', amount: '' }
  ]);
  
  const [userSearch, setUserSearch] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);

  const [ownerSearch, setOwnerSearch] = useState('');
  const [availableOwners, setAvailableOwners] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [ownerSearchLoading, setOwnerSearchLoading] = useState(false);
  const { loading, apiCall } = useApiCall();

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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users`);
      if (response.ok) {
        const users = await response.json();
        const filteredUsers = users.filter(user => 
          (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setAvailableUsers(filteredUsers);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setUserSearchLoading(false);
    }
  };

  const searchOwners = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setAvailableOwners([]);
      return;
    }

    setOwnerSearchLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users`);
      if (response.ok) {
        const users = await response.json();
        const filteredUsers = users.filter(user => 
          (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setAvailableOwners(filteredUsers);
      }
    } catch (error) {
      console.error('Error searching owners:', error);
    } finally {
      setOwnerSearchLoading(false);
    }
  };

  const addOwner = (user) => {
    setSelectedOwner(user);
    setEventData(prev => ({
      ...prev,
      owner: user._id
    }));
    
    // Automatically add owner as a participant if not already added
    if (!selectedParticipants.find(p => p._id === user._id)) {
      setSelectedParticipants(prev => [...prev, user]);
      setEventData(prev => ({
        ...prev,
        participants: [...prev.participants, user._id]
      }));
    }
    
    setOwnerSearch('');
    setAvailableOwners([]);
  };

  const removeOwner = () => {
    if (selectedOwner) {
      setEventData(prev => ({
        ...prev,
        owner: ''
      }));
    }
    setSelectedOwner(null);
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

  const addAllParticipants = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users`);
      if (response.ok) {
        const users = await response.json();
        // Filter out users already selected and the selected owner
        const newParticipants = users.filter(user => 
          !selectedParticipants.find(p => p._id === user._id) &&
          (!selectedOwner || user._id !== selectedOwner._id)
        );
        
        setSelectedParticipants(prev => [...prev, ...newParticipants]);
        setEventData(prev => ({
          ...prev,
          participants: [...prev.participants, ...newParticipants.map(u => u._id)]
        }));
        setAllUsers(users);
      }
    } catch (error) {
      console.error('Error fetching all users:', error);
    }
  };

  const removeAllParticipants = () => {
    setSelectedParticipants([]);
    setEventData(prev => ({
      ...prev,
      participants: []
    }));
  };

  const removeExpenseItem = (index) => {
    if (expenseItems.length > 1) {
      setExpenseItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    await apiCall(async () => {
      try {
        // Create event first
        const eventResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/events`, {
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
          await fetch(`${process.env.REACT_APP_API_URL}/api/expense-items`, {
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

        // Calculate total and set owner's payment to their split amount
        if (validExpenseItems.length > 0) {
          const totalAmount = validExpenseItems.reduce((sum, item) => sum + parseFloat(item.amount), 0);
          const participantCount = selectedParticipants.length;
          const splitAmount = participantCount > 0 ? totalAmount / participantCount : 0;

          // Update owner's payment amount to their split
          if (selectedOwner && splitAmount > 0) {
            const ownerParticipant = createdEvent.participants.find(p => 
              (typeof p.user === 'string' ? p.user : p.user._id) === selectedOwner._id
            );
            
            if (ownerParticipant) {
              await fetch(`${process.env.REACT_APP_API_URL}/api/events/${createdEvent._id}/participants/${selectedOwner._id}/payment`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  amountPaid: splitAmount
                })
              });
            }
          }
        }

        // Reset form
        setEventData({ title: '', eventDate: new Date().toISOString().split('T')[0], owner: '', participants: [] });
        setExpenseItems([{ itemName: 'Expense', amount: '' }]);
        setSelectedParticipants([]);
        setSelectedOwner(null);
        setUserSearch('');
        setAvailableUsers([]);
        setAllUsers([]);
        setOwnerSearch('');
        setAvailableOwners([]);
        
        // Notify parent and close
        if (onEventCreated) onEventCreated();
        onClose();
      } catch (error) {
        console.error('Error creating event:', error);
      }
    });
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
    setEventData({ title: '', eventDate: new Date().toISOString().split('T')[0], owner: '', participants: [] });
    setExpenseItems([{ itemName: 'Expense', amount: '' }]);
    setSelectedParticipants([]);
    setSelectedOwner(null);
    setUserSearch('');
    setAvailableUsers([]);
    setAllUsers([]);
    setOwnerSearch('');
    setAvailableOwners([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
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
          Create New Event
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

          {/* Owner Section */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Event Owner
            </Typography>
            
            <Autocomplete
              freeSolo
              options={availableOwners}
              getOptionLabel={(option) => 
                typeof option === 'string' ? option : `${option.name || 'Unknown'}`
              }
              value={null}
              inputValue={ownerSearch}
              onInputChange={(event, newInputValue) => {
                setOwnerSearch(newInputValue);
                searchOwners(newInputValue);
              }}
              onChange={(event, value) => {
                if (value && typeof value === 'object') {
                  addOwner(value);
                }
              }}
              loading={ownerSearchLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search for event owner..."
                  placeholder="Type to search for users"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {ownerSearchLoading ? <CircularProgress color="inherit" size={20} /> : null}
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
                  </Box>
                </Box>
              )}
            />

            {/* Selected Owner */}
            {selectedOwner && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  Event owner:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip
                    label={`${selectedOwner.name || 'Unknown'}`}
                    onDelete={removeOwner}
                    deleteIcon={<CloseIcon />}
                    color="secondary"
                    variant="outlined"
                  />
                </Box>
              </Box>
            )}
          </Box>

          {/* Participants Section */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">
                Participants
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={addAllParticipants}
                >
                  Add All Users
                </Button>
                <Button 
                  variant="outlined" 
                  size="small"
                  color="error"
                  onClick={removeAllParticipants}
                  disabled={selectedParticipants.length === 0}
                >
                  Remove All
                </Button>
              </Box>
            </Box>
            
            <Autocomplete
              freeSolo
              options={availableUsers}
              getOptionLabel={(option) => 
                typeof option === 'string' ? option : `${option.name || 'Unknown'}`
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
                  {selectedParticipants.map((participant) => {
                    const isOwner = selectedOwner && selectedOwner._id === participant._id;
                    return (
                      <Chip
                        key={participant._id}
                        label={`${participant.name || 'Unknown'}${isOwner ? ' - Owner' : ''}`}
                        onDelete={() => removeParticipant(participant._id)}
                        deleteIcon={<CloseIcon />}
                        color={isOwner ? "secondary" : "primary"}
                        variant="outlined"
                      />
                    );
                  })}
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
                        endAdornment: item.amount && parseFloat(item.amount) > 0 && (
                          <IconButton
                            size="small"
                            onClick={() => handleExpenseChange(index, 'amount', '')}
                            sx={{ p: 0.5 }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        ),
                      }}
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
        
        {/* Sticky Footer */}
        <DialogActions sx={{ 
          position: 'sticky', 
          bottom: 0, 
          zIndex: 1, 
          backgroundColor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          flexDirection: 'column', 
          gap: 1, 
          p: 2 
        }}>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!eventData.title || !eventData.eventDate || !eventData.owner || loading}
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
      </LoadingOverlay>
    </Dialog>
  );
}

export default CreateEventForm;
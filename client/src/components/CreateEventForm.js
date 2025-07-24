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
import Avatar from './Avatar';
import useApiCall from '../hooks/useApiCall';
import { getUserAvatar } from '../utils/avatarUtils';

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
  const [showAddExpenseItem, setShowAddExpenseItem] = useState(false);
  const [newExpenseItem, setNewExpenseItem] = useState({ itemName: '', amount: '' });
  
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

  const getCreateEventColor = () => {
    const colors = [
      { bg: '#e8f5e8', text: '#388e3c' }, // Green for create event
    ];
    return colors[0];
  };

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
    if (newExpenseItem.itemName.trim() && newExpenseItem.amount) {
      setExpenseItems(prev => [...prev, { ...newExpenseItem }]);
      setNewExpenseItem({ itemName: '', amount: '' });
      setShowAddExpenseItem(false);
    }
  };

  const handleNewExpenseChange = (field, value) => {
    setNewExpenseItem(prev => ({
      ...prev,
      [field]: value
    }));
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
          zIndex: 10, 
          backgroundColor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: getCreateEventColor().bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Typography sx={{ 
                fontSize: '1.3rem', 
                fontWeight: 700,
                color: getCreateEventColor().text
              }}>
                $
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem', mb: 0.5 }}>
                Create New Event
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                Set up a new expense sharing event
              </Typography>
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
        <Stack spacing={1.5} sx={{ mt: 0.5 }}>
          {/* Event Details Section */}
          <Box sx={{ 
            background: 'white',
            borderRadius: '12px',
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            overflow: 'hidden'
          }}>
            <Box sx={{
              background: 'rgba(0,0,0,0.02)',
              borderBottom: '1px solid rgba(0,0,0,0.05)',
              px: 2,
              py: 1.5
            }}>              
              <Typography variant="body2" sx={{ 
                fontWeight: 600, 
                fontSize: '0.85rem', 
                color: 'text.primary'
              }}>
                Event Details
              </Typography>
            </Box>
            <Box sx={{ p: 2 }}>
            <Stack spacing={2}>
              <TextField
                label="Event Title"
                fullWidth
                value={eventData.title}
                onChange={(e) => handleEventChange('title', e.target.value)}
                required
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '0.85rem',
                    height: '32px'
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '0.8rem'
                  },
                  '& .MuiInputLabel-shrink': {
                    fontSize: '0.75rem'
                  }
                }}
              />
              
              <TextField
                label="Event Date"
                type="date"
                fullWidth
                value={eventData.eventDate}
                onChange={(e) => handleEventChange('eventDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '0.85rem',
                    height: '32px'
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '0.8rem'
                  },
                  '& .MuiInputLabel-shrink': {
                    fontSize: '0.75rem'
                  }
                }}
              />
            </Stack>
            </Box>
          </Box>

          {/* Owner Section */}
          <Box sx={{ 
            background: 'white',
            borderRadius: '12px',
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            overflow: 'hidden'
          }}>
            <Box sx={{
              background: 'rgba(0,0,0,0.02)',
              borderBottom: '1px solid rgba(0,0,0,0.05)',
              px: 2,
              py: 1.5
            }}>              
              <Typography variant="body2" sx={{ 
                fontWeight: 600, 
                fontSize: '0.85rem', 
                color: 'text.primary'
              }}>
                Event Owner
              </Typography>
            </Box>
            <Box sx={{ p: 2 }}>
            
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
                  label="Owner"
                  placeholder="Search owner..."
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '0.85rem',
                      height: '32px'
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '0.8rem'
                    },
                    '& .MuiInputLabel-shrink': {
                      fontSize: '0.75rem'
                    }
                  }}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {ownerSearchLoading ? <CircularProgress color="inherit" size={16} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
                  <Avatar
                    {...getUserAvatar(option)}
                    size={32}
                    fontSize={14}
                  />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                      {option.name || 'Unknown'}
                    </Typography>
                  </Box>
                </Box>
              )}
            />

            {/* Selected Owner */}
            {selectedOwner && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.8rem' }}>
                  Selected owner:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 1,
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    padding: '6px 12px 6px 6px',
                    borderRadius: '12px',
                    border: '1px solid rgba(25, 118, 210, 0.2)'
                  }}>
                    <Avatar
                      {...getUserAvatar(selectedOwner)}
                      size={24}
                      fontSize={12}
                    />
                    <Typography variant="body2" sx={{ 
                      color: '#1976d2', 
                      fontWeight: 600,
                      fontSize: '0.8rem'
                    }}>
                      {selectedOwner.name || 'Unknown'}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={removeOwner}
                      sx={{ 
                        width: '20px', 
                        height: '20px', 
                        ml: 0.5,
                        color: '#1976d2'
                      }}
                    >
                      <CloseIcon sx={{ fontSize: '14px' }} />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            )}
            </Box>
          </Box>

          {/* Participants Section */}
          <Box sx={{ 
            background: 'white',
            borderRadius: '12px',
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            overflow: 'hidden'
          }}>
            <Box sx={{
              background: 'rgba(0,0,0,0.02)',
              borderBottom: '1px solid rgba(0,0,0,0.05)',
              px: 2,
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>              
              <Typography variant="body2" sx={{ 
                fontWeight: 600, 
                fontSize: '0.85rem', 
                color: 'text.primary'
              }}>
                Participants
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={addAllParticipants}
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    minHeight: '28px',
                    px: 1.5
                  }}
                >
                  Add All
                </Button>
                <Button 
                  variant="outlined" 
                  size="small"
                  color="error"
                  onClick={removeAllParticipants}
                  disabled={selectedParticipants.length === 0}
                  sx={{ 
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    minHeight: '28px',
                    px: 1.5
                  }}
                >
                  Clear All
                </Button>
              </Box>
            </Box>
            <Box sx={{ p: 2 }}>
            
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
                  label="Participants"
                  placeholder="Search participants..."
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '0.85rem',
                      height: '32px'
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '0.8rem'
                    },
                    '& .MuiInputLabel-shrink': {
                      fontSize: '0.75rem'
                    }
                  }}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {userSearchLoading ? <CircularProgress color="inherit" size={16} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
                  <Avatar
                    {...getUserAvatar(option)}
                    size={32}
                    fontSize={14}
                  />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                      {option.name || 'Unknown'}
                    </Typography>
                  </Box>
                </Box>
              )}
            />

            {/* Selected Participants */}
            {selectedParticipants.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.8rem' }}>
                  Selected participants ({selectedParticipants.length}):
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedParticipants.map((participant) => {
                    const isOwner = selectedOwner && selectedOwner._id === participant._id;
                    return (
                      <Box key={participant._id} sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: 0.5,
                        backgroundColor: isOwner ? 'rgba(25, 118, 210, 0.08)' : 'rgba(0,0,0,0.04)',
                        padding: '4px 8px 4px 4px',
                        borderRadius: '8px',
                        border: `1px solid ${isOwner ? 'rgba(25, 118, 210, 0.2)' : 'rgba(0,0,0,0.1)'}`
                      }}>
                        <Avatar
                          {...getUserAvatar(participant)}
                          size={20}
                          fontSize={10}
                        />
                        <Typography variant="body2" sx={{ 
                          fontSize: '0.75rem',
                          color: isOwner ? '#1976d2' : 'text.primary',
                          fontWeight: isOwner ? 600 : 500
                        }}>
                          {participant.name || 'Unknown'}{isOwner ? ' (Owner)' : ''}
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => removeParticipant(participant._id)}
                          sx={{ 
                            width: '16px', 
                            height: '16px', 
                            ml: 0.5,
                            color: isOwner ? '#1976d2' : 'text.secondary'
                          }}
                        >
                          <CloseIcon sx={{ fontSize: '12px' }} />
                        </IconButton>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}
            </Box>
          </Box>

          {/* Expense Items Section */}
          <Box sx={{ 
            background: 'white',
            borderRadius: '12px',
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            overflow: 'hidden'
          }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              px: 1.5,
              py: 1,
              background: 'rgba(0,0,0,0.02)',
              borderBottom: '1px solid rgba(0,0,0,0.05)'
            }}>
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem', color: 'text.primary' }}>
                Expense Items ({expenseItems.length})
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
                sx={{ 
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  minHeight: '28px'
                }}
              >
                {showAddExpenseItem ? 'Cancel' : 'Add'}
              </Button>
            </Box>
            <Box sx={{ p: 2 }}>

            {/* Current Expense Items */}
            {expenseItems.length > 0 ? (
              <Stack spacing={0}>
                {expenseItems.map((item, index) => (
                  <Box key={index}>
                    <Box sx={{ 
                      px: 1.5,
                      py: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      minHeight: '48px'
                    }}>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 600, 
                        fontSize: '0.9rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flexGrow: 1,
                        minWidth: 0
                      }}>
                        {item.itemName}
                      </Typography>
                      <TextField
                        type="number"
                        size="small"
                        value={item.amount || ''}
                        onChange={(e) => handleExpenseChange(index, 'amount', e.target.value)}
                        inputProps={{ min: 0, step: 0.01 }}
                        sx={{ 
                          width: '60px',
                          '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                            display: 'none',
                          },
                          '& input[type=number]': {
                            MozAppearance: 'textfield',
                          },
                          '& .MuiOutlinedInput-root': {
                            fontSize: '0.75rem',
                            height: '32px'
                          },
                          '& input': {
                            textAlign: 'center',
                            px: 0.5
                          }
                        }}
                      />
                  <IconButton 
                    onClick={() => removeExpenseItem(index)}
                    disabled={expenseItems.length === 1}
                    sx={{
                      width: '32px',
                      height: '32px',
                      color: expenseItems.length === 1 ? 'text.disabled' : 'error.main',
                      border: '1px solid',
                      borderColor: expenseItems.length === 1 ? 'rgba(0,0,0,0.12)' : 'error.main',
                      borderRadius: '4px'
                    }}
                  >
                    <DeleteIcon sx={{ fontSize: '16px' }} />
                  </IconButton>
                    </Box>
                    {index < expenseItems.length - 1 && (
                      <Box sx={{ height: '1px', backgroundColor: 'rgba(0,0,0,0.05)', mx: 1.5 }} />
                    )}
                  </Box>
                ))}
              </Stack>
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                  No expense items added yet
                </Typography>
              </Box>
            )}

            {/* Add New Expense Item (conditionally shown) */}
            {showAddExpenseItem && (
              <Box sx={{ px: 1.5, py: 1, display: 'flex', gap: 1, alignItems: 'center', minHeight: '48px' }}>
                <Box sx={{ flexGrow: 1 }}>
                  <TextField
                    placeholder="Item name..."
                    value={newExpenseItem.itemName}
                    onChange={(e) => handleNewExpenseChange('itemName', e.target.value)}
                    size="small"
                    variant="outlined"
                    fullWidth
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        fontSize: '0.9rem',
                        height: '32px'
                      }
                    }}
                  />
                </Box>
                <TextField
                  placeholder="0"
                  type="number"
                  value={newExpenseItem.amount}
                  onChange={(e) => handleNewExpenseChange('amount', e.target.value)}
                  size="small"
                  inputProps={{ min: 0, step: 0.01 }}
                  sx={{ 
                    width: '60px',
                    '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                      display: 'none',
                    },
                    '& input[type=number]': {
                      MozAppearance: 'textfield',
                    },
                    '& .MuiOutlinedInput-root': {
                      fontSize: '0.75rem',
                      height: '32px'
                    },
                    '& input': {
                      textAlign: 'center',
                      px: 0.5
                    }
                  }}
                />
                <IconButton 
                  onClick={addExpenseItem}
                  color="primary"
                  disabled={!newExpenseItem.itemName.trim() || !newExpenseItem.amount}
                  size="small"
                  sx={{ 
                    width: '32px',
                    height: '32px',
                    border: '1px solid rgba(25, 118, 210, 0.5)',
                    borderRadius: '4px'
                  }}
                >
                  <AddIcon sx={{ fontSize: '16px' }} />
                </IconButton>
              </Box>
            )}

            {/* Total and Split Summary */}
            {expenseItems.some(item => item.amount && parseFloat(item.amount) > 0) && (
              <Box sx={{ 
                mt: 2.5, 
                p: 2.5, 
                background: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)',
                borderRadius: '12px', 
                border: '1px solid rgba(76, 175, 80, 0.3)',
                textAlign: 'center'
              }}>
                <Typography variant="h4" sx={{ 
                  mb: 0.5, 
                  color: '#2e7d32',
                  fontWeight: 700,
                  fontSize: '2rem'
                }}>
                  ${calculateSplitPerPerson()}
                </Typography>
                <Typography variant="body1" sx={{ 
                  mb: 1, 
                  color: '#388e3c',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}>
                  Per Person • {selectedParticipants.length} participant{selectedParticipants.length !== 1 ? 's' : ''}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(46, 125, 50, 0.7)',
                  fontSize: '0.8rem'
                }}>
                  Total Amount: ${calculateTotal()}
                </Typography>
              </Box>
            )}
            </Box>
          </Box>
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
            disabled={!eventData.title || !eventData.eventDate || !eventData.owner || loading}
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
            Create Event
          </Button>
        </DialogActions>
      </LoadingOverlay>
    </Dialog>
  );
}

export default CreateEventForm;
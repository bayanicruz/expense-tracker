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
  Stack,
  Autocomplete,
  CircularProgress,
  Divider,
  Breadcrumbs,
  Link
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Close as CloseIcon, Edit as EditIcon, Check as CheckIcon } from '@mui/icons-material';
import LoadingOverlay from './LoadingOverlay';
import Avatar from './Avatar';
import { getEventAvatar, getUserAvatar } from '../utils/avatarUtils';
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
  const [editingPayment, setEditingPayment] = useState(null); // { participantId, amount }
  const [editingExpense, setEditingExpense] = useState(null); // { itemId, amount }
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
    setUserSearchLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/users`);
      if (response.ok) {
        const users = await response.json();
        
        // Get already added participant IDs
        const currentParticipantIds = participantDetails.map(p => p._id);
        
        // Filter users that aren't already participants
        const availableUsers = users.filter(user => 
          !currentParticipantIds.includes(user._id)
        );
        
        // If search term is provided, filter by name
        const searchFilteredUsers = searchTerm.trim() 
          ? availableUsers.filter(user => 
              user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
          : availableUsers;
        
        // Create the options array with "Add all" as first option if there are remaining users
        const options = [];
        if (availableUsers.length > 0) {
          options.push({
            _id: 'ADD_ALL_REMAINING',
            name: `Add all remaining users (${availableUsers.length})`,
            isAddAllOption: true
          });
        }
        
        // Add the filtered users
        options.push(...searchFilteredUsers);
        
        setAvailableUsers(options);
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

  const addAllRemainingUsers = async () => {
    await apiCall(async () => {
      try {
        // Get all users first
        const response = await fetch(`${API_URL}/api/users`);
        if (!response.ok) return;
        
        const allUsers = await response.json();
        
        // Filter out already added participants
        const currentParticipantIds = participantDetails.map(p => p._id);
        const remainingUsers = allUsers.filter(user => 
          !currentParticipantIds.includes(user._id)
        );
        
        if (remainingUsers.length === 0) {
          setShowAddParticipant(false);
          return;
        }

        // Add all remaining users
        const newParticipants = [...participantDetails, ...remainingUsers.map(user => ({ ...user, amountPaid: 0 }))];
        const participantsForSave = newParticipants.map(p => ({
          user: p._id,
          amountPaid: p.amountPaid || 0
        }));
        
        const updateResponse = await fetch(`${API_URL}/api/events/${eventId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            participants: participantsForSave
          })
        });

        if (updateResponse.ok) {
          setParticipantDetails(newParticipants);
          setUserSearch('');
          setAvailableUsers([]);
          setShowAddParticipant(false);
          if (onEventUpdated) onEventUpdated();
        }
      } catch (error) {
        console.error('Error adding all remaining users:', error);
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

  const handlePaymentEdit = (participantId, currentAmount) => {
    setEditingPayment({ participantId, amount: currentAmount || 0 });
  };

  const handlePaymentSave = async () => {
    if (editingPayment) {
      await updatePaymentAmount(editingPayment.participantId, editingPayment.amount);
      setEditingPayment(null);
    }
  };

  const handlePaymentCancel = () => {
    setEditingPayment(null);
  };

  const handleExpenseEdit = (itemId, currentAmount) => {
    setEditingExpense({ itemId, amount: currentAmount || 0 });
  };

  const handleExpenseSave = async () => {
    if (editingExpense) {
      const success = await updateExpenseAmount(editingExpense.itemId, editingExpense.amount);
      if (success !== false) {
        setEditingExpense(null);
      }
    }
  };

  const handleExpenseCancel = () => {
    setEditingExpense(null);
  };

  const updateExpenseAmount = async (itemId, newAmount) => {
    let success = true;
    await apiCall(async () => {
      try {
        const response = await fetch(`${API_URL}/api/expense-items/${itemId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: parseFloat(newAmount) || 0
          })
        });

        if (response.ok) {
          setExpenseItems(prev => 
            prev.map(item => 
              item._id === itemId 
                ? { ...item, amount: parseFloat(newAmount) || 0 }
                : item
            )
          );
          if (onEventUpdated) onEventUpdated();
        } else {
          success = false;
        }
      } catch (error) {
        console.error('Error updating expense amount:', error);
        success = false;
      }
    });
    return success;
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
    setEditingPayment(null);
    setEditingExpense(null);
    onClose();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getEventDollarColor = (eventName) => {
    const colors = [
      { bg: '#e3f2fd', text: '#1976d2' }, // Blue
      { bg: '#f3e5f5', text: '#7b1fa2' }, // Purple
      { bg: '#e8f5e8', text: '#388e3c' }, // Green
      { bg: '#fff3e0', text: '#f57c00' }, // Orange
      { bg: '#ffebee', text: '#d32f2f' }, // Red
      { bg: '#e0f2f1', text: '#00796b' }, // Teal
      { bg: '#fce4ec', text: '#c2185b' }, // Pink
      { bg: '#e8eaf6', text: '#3f51b5' }, // Indigo
    ];
    
    // Generate hash from event name
    let hash = 0;
    for (let i = 0; i < eventName.length; i++) {
      hash = eventName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Use hash to select color
    const colorIndex = Math.abs(hash) % colors.length;
    return colors[colorIndex];
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
          zIndex: 10, 
          backgroundColor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
              {eventData.title && (
                <Box sx={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: getEventDollarColor(eventData.title).bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Typography sx={{ 
                    fontSize: '1.3rem', 
                    fontWeight: 700,
                    color: getEventDollarColor(eventData.title).text
                  }}>
                    $
                  </Typography>
                </Box>
              )}
              <Box sx={{ flexGrow: 1 }}>
                {breadcrumbUser && (
                  <Breadcrumbs sx={{ mb: 0.5 }}>
                    <Link 
                      component="button" 
                      variant="body2" 
                      onClick={() => onBreadcrumbClick ? onBreadcrumbClick() : onClose()}
                      sx={{ 
                        textDecoration: 'none',
                        color: 'primary.main',
                        fontSize: '0.8rem',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      {breadcrumbUser.name}
                    </Link>
                    <Typography variant="body2" color="text.primary" sx={{ fontSize: '0.8rem' }}>
                      {eventData.title || 'Event Details'}
                    </Typography>
                  </Breadcrumbs>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
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
                            fontSize: '1.2rem',
                            fontWeight: 500
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
                      <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                        {eventData.title || 'Event Details'}
                      </Typography>
                      <IconButton size="small" onClick={handleTitleStartEdit}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      {parseFloat(calculateRemainingBalance()) === 0 && expenseItems.length > 0 && (
                        <Typography variant="caption" sx={{ 
                          color: '#4caf50', 
                          fontWeight: 600,
                          backgroundColor: '#e8f5e8',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.7rem'
                        }}>
                          Settled
                        </Typography>
                      )}
                    </>
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    {eventData.eventDate ? formatDate(eventData.eventDate) : ''}
                  </Typography>
                  {eventData.owner && (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 0.5
                    }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        by:
                      </Typography>
                      <Avatar
                        {...getUserAvatar(eventData.owner)}
                        size={20}
                        fontSize={10}
                      />
                      <Typography variant="body2" sx={{ 
                        color: '#1976d2', 
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }}>
                        {eventData.owner.name || 'Unknown'}
                      </Typography>
                    </Box>
                  )}
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
        <Stack spacing={1.5} sx={{ mt: 0.5 }}>

          {/* Financial Summary */}
          {expenseItems.length > 0 && (
            <Box sx={{ 
              p: 2, 
              backgroundColor: parseFloat(calculateRemainingBalance()) > 0 ? '#ffebee' : '#e8f5e8', 
              borderRadius: 2, 
              border: `1px solid ${parseFloat(calculateRemainingBalance()) > 0 ? '#ffcdd2' : '#c8e6c8'}`
            }}>
              {/* Main Highlight - Remaining Amount */}
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5, fontSize: '0.75rem' }}>
                  {parseFloat(calculateRemainingBalance()) > 0 ? 'AMOUNT REMAINING' : 'FULLY PAID'}
                </Typography>
                <Typography variant="h4" sx={{ 
                  fontWeight: 'bold',
                  color: parseFloat(calculateRemainingBalance()) > 0 ? '#d32f2f' : '#2e7d32',
                  mb: 1
                }}>
                  ${calculateRemainingBalance()}
                </Typography>
              </Box>
              
              {/* Secondary Info - Total and Split */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                pt: 1.5,
                borderTop: `1px solid ${parseFloat(calculateRemainingBalance()) > 0 ? '#ffcdd2' : '#c8e6c8'}`
              }}>
                <Box sx={{ textAlign: 'center', flex: 1 }}>
                  <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
                    TOTAL
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                    ${calculateTotal()}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', flex: 1 }}>
                  <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
                    PER PERSON
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                    ${calculateSplitPerPerson()}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.65rem' }}>
                    ({participantDetails.length} participant{participantDetails.length !== 1 ? 's' : ''})
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* Participants Section */}
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
                Participants ({participantDetails.length})
              </Typography>
              <Button
                startIcon={showAddParticipant ? <CloseIcon /> : <AddIcon />}
                variant="outlined"
                size="small"
                onClick={() => {
                  if (!showAddParticipant) {
                    setShowAddParticipant(true);
                    setUserSearch('');
                    searchUsers(''); // Load initial options with "Add all" option
                  } else {
                    setShowAddParticipant(false);
                    setUserSearch('');
                    setAvailableUsers([]);
                  }
                }}
                sx={{ 
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  minHeight: '28px'
                }}
              >
                {showAddParticipant ? 'Cancel' : 'Add'}
              </Button>
            </Box>

            {/* Current Participants */}
            {participantDetails.length > 0 ? (
              <Stack spacing={0}>
                {participantDetails.map((participant, index) => (
                  <Box key={participant._id}>
                    <Box sx={{ 
                      px: 1.5,
                      py: 1,
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      alignItems: 'center',
                      gap: 1,
                      minHeight: '48px'
                    }}>
                      {/* Avatar and Name */}
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: 1,
                        minWidth: 0
                      }}>
                        <Avatar
                          {...getUserAvatar(participant)}
                          size={32}
                          fontSize={12}
                        />
                        <Typography variant="body2" sx={{ 
                          fontWeight: 600, 
                          fontSize: '0.9rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {participant.name || 'Unknown'}
                        </Typography>
                      </Box>

                      {/* Action Buttons */}
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 0.3,
                        flexShrink: 0
                      }}>
                        {editingPayment && editingPayment.participantId === participant._id ? (
                          <>
                            <TextField
                              type="number"
                              size="small"
                              value={editingPayment.amount}
                              onChange={(e) => setEditingPayment(prev => ({ ...prev, amount: e.target.value }))}
                              inputProps={{ min: 0, step: 0.01 }}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handlePaymentSave();
                                } else if (e.key === 'Escape') {
                                  handlePaymentCancel();
                                }
                              }}
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
                              onClick={handlePaymentSave}
                              color="primary"
                              size="small"
                              sx={{ 
                                width: '32px',
                                height: '32px',
                                border: '1px solid rgba(25, 118, 210, 0.5)',
                                borderRadius: '4px'
                              }}
                            >
                              <CheckIcon sx={{ fontSize: '16px' }} />
                            </IconButton>
                            <IconButton 
                              onClick={handlePaymentCancel}
                              size="small"
                              sx={{ 
                                width: '32px',
                                height: '32px',
                                border: '1px solid rgba(0,0,0,0.23)',
                                borderRadius: '4px'
                              }}
                            >
                              <CloseIcon sx={{ fontSize: '16px' }} />
                            </IconButton>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => {
                                const splitAmount = calculateSplitPerPerson();
                                updatePaymentAmount(participant._id, splitAmount);
                              }}
                              sx={{ 
                                textTransform: 'none',
                                minWidth: '32px',
                                width: '32px',
                                height: '32px',
                                fontSize: '0.6rem',
                                p: 0,
                                fontWeight: 600
                              }}
                            >
                              Pay
                            </Button>
                            <Box
                              onClick={() => handlePaymentEdit(participant._id, participant.amountPaid)}
                              sx={{
                                width: '60px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(0,0,0,0.23)',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                '&:hover': {
                                  borderColor: 'rgba(0,0,0,0.87)',
                                  backgroundColor: 'rgba(0,0,0,0.04)'
                                }
                              }}
                            >
                              ${(participant.amountPaid || 0).toFixed(0)}
                            </Box>
                          </>
                        )}
                        
                        <IconButton 
                          onClick={() => removeParticipant(participant._id)}
                          color="error"
                          size="small"
                          sx={{ 
                            width: '32px',
                            height: '32px',
                            border: '1px solid rgba(211, 47, 47, 0.5)',
                            borderRadius: '4px'
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: '16px' }} />
                        </IconButton>
                      </Box>
                    </Box>
                    {index < participantDetails.length - 1 && (
                      <Divider sx={{ mx: 1.5 }} />
                    )}
                  </Box>
                ))}
              </Stack>
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                  No participants added yet
                </Typography>
              </Box>
            )}

            {/* Add Participant (conditionally shown) */}
            {showAddParticipant && (
              <Box sx={{ px: 1.5, py: 1, display: 'flex', gap: 1, alignItems: 'center', minHeight: '48px' }}>
                <Box sx={{ flexGrow: 1 }}>
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
                        if (value.isAddAllOption) {
                          addAllRemainingUsers();
                        } else {
                          addParticipant(value);
                        }
                      }
                    }}
                    loading={userSearchLoading}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Search participants..."
                        size="small"
                        fullWidth
                        sx={{ 
                          '& .MuiOutlinedInput-root': {
                            fontSize: '0.9rem',
                            height: '32px'
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
                      <Box component="li" {...props} sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        backgroundColor: option.isAddAllOption ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                        fontWeight: option.isAddAllOption ? 600 : 400,
                        borderBottom: option.isAddAllOption ? '1px solid rgba(25, 118, 210, 0.2)' : 'none',
                        mb: option.isAddAllOption ? 0.5 : 0
                      }}>
                        {option.isAddAllOption ? (
                          <>
                            <Box sx={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: '#1976d2',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <AddIcon sx={{ fontSize: '14px', color: 'white' }} />
                            </Box>
                            <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 600 }}>
                              {option.name}
                            </Typography>
                          </>
                        ) : (
                          <>
                            <Avatar
                              {...getUserAvatar(option)}
                              size={24}
                              fontSize={10}
                            />
                            <Typography variant="body2">{option.name || 'Unknown'}</Typography>
                          </>
                        )}
                      </Box>
                    )}
                  />
                </Box>
              </Box>
            )}
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

            {/* Current Expense Items */}
            {expenseItems.length > 0 ? (
              <Stack spacing={0}>
                {expenseItems.map((item, index) => (
                  <Box key={item._id}>
                    <Box sx={{ 
                      px: 1.5,
                      py: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      minHeight: '48px'
                    }}>
                      {/* Item Name */}
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

                      {/* Amount Display */}
                      {editingExpense && editingExpense.itemId === item._id ? (
                        <>
                          <TextField
                            type="number"
                            size="small"
                            value={editingExpense.amount}
                            onChange={(e) => setEditingExpense(prev => ({ ...prev, amount: e.target.value }))}
                            inputProps={{ min: 0, step: 0.01 }}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleExpenseSave();
                              } else if (e.key === 'Escape') {
                                handleExpenseCancel();
                              }
                            }}
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
                            onClick={handleExpenseSave}
                            color="primary"
                            size="small"
                            sx={{ 
                              width: '32px',
                              height: '32px',
                              border: '1px solid rgba(25, 118, 210, 0.5)',
                              borderRadius: '4px'
                            }}
                          >
                            <CheckIcon sx={{ fontSize: '16px' }} />
                          </IconButton>
                          <IconButton 
                            onClick={handleExpenseCancel}
                            size="small"
                            sx={{ 
                              width: '32px',
                              height: '32px',
                              border: '1px solid rgba(0,0,0,0.23)',
                              borderRadius: '4px'
                            }}
                          >
                            <CloseIcon sx={{ fontSize: '16px' }} />
                          </IconButton>
                        </>
                      ) : (
                        <Box
                          onClick={() => handleExpenseEdit(item._id, item.amount)}
                          sx={{
                            width: '60px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid rgba(0,0,0,0.23)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            '&:hover': {
                              borderColor: 'rgba(0,0,0,0.87)',
                              backgroundColor: 'rgba(0,0,0,0.04)'
                            }
                          }}
                        >
                          ${item.amount.toFixed(0)}
                        </Box>
                      )}
                      
                      {/* Delete Button */}
                      <IconButton 
                        onClick={() => removeExpenseItem(item._id)}
                        color="error"
                        size="small"
                        sx={{ 
                          width: '32px',
                          height: '32px',
                          border: '1px solid rgba(211, 47, 47, 0.5)',
                          borderRadius: '4px',
                          flexShrink: 0
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: '16px' }} />
                      </IconButton>
                    </Box>
                    {index < expenseItems.length - 1 && (
                      <Divider sx={{ mx: 1.5 }} />
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
          sx={{ px: 4, backgroundColor: 'black', color: 'white', '&:hover': { backgroundColor: '#333333' } }}
        >
          Close
        </Button>
      </DialogActions>
      </LoadingOverlay>
    </Dialog>
  );
}

export default EventDetailView;
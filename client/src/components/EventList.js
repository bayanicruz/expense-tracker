import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Collapse,
  Paper,
  Menu,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import GroupList from './GroupList';

function EventList() {
  const [events, setEvents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [expandedEvents, setExpandedEvents] = useState({});
  const [editingEvent, setEditingEvent] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);

  const handleAddEvent = () => {
    if (newEventName.trim()) {
      const newEventId = Date.now();
      setEvents([
        ...events,
        {
          id: newEventId,
          name: newEventName,
          groups: [],
        },
      ]);
      setExpandedEvents({ ...expandedEvents, [newEventId]: true });
      setNewEventName('');
      setOpenDialog(false);
    }
  };

  const handleEditEvent = () => {
    if (editingEvent && editingEvent.name.trim()) {
      setEvents(events.map(event => 
        event.id === editingEvent.id 
          ? { ...event, name: editingEvent.name }
          : event
      ));
      setEditingEvent(null);
      setOpenDialog(false);
    }
  };

  const handleDeleteEvent = (eventId) => {
    setEvents(events.filter(event => event.id !== eventId));
    setMenuAnchor(null);
    setSelectedEventId(null);
  };

  const handleAddGroup = (eventId, groupName) => {
    setEvents(events.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          groups: [
            ...event.groups,
            {
              id: Date.now(),
              name: groupName,
              expenses: [],
            },
          ],
        };
      }
      return event;
    }));
  };

  const handleAddExpense = (eventId, groupId, expense) => {
    setEvents(events.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          groups: event.groups.map(group => {
            if (group.id === groupId) {
              return {
                ...group,
                expenses: [...group.expenses, { ...expense, id: Date.now() }],
              };
            }
            return group;
          }),
        };
      }
      return event;
    }));
  };

  const handleEditGroup = (eventId, groupId, newName) => {
    setEvents(events.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          groups: event.groups.map(group => 
            group.id === groupId 
              ? { ...group, name: newName }
              : group
          ),
        };
      }
      return event;
    }));
  };

  const handleDeleteGroup = (eventId, groupId) => {
    setEvents(events.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          groups: event.groups.filter(group => group.id !== groupId),
        };
      }
      return event;
    }));
  };

  const handleEditExpense = (eventId, groupId, expenseId, updatedExpense) => {
    setEvents(events.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          groups: event.groups.map(group => {
            if (group.id === groupId) {
              return {
                ...group,
                expenses: group.expenses.map(expense =>
                  expense.id === expenseId ? { ...expense, ...updatedExpense } : expense
                ),
              };
            }
            return group;
          }),
        };
      }
      return event;
    }));
  };

  const handleDeleteExpense = (eventId, groupId, expenseId) => {
    setEvents(events.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          groups: event.groups.map(group => {
            if (group.id === groupId) {
              return {
                ...group,
                expenses: group.expenses.filter(expense => expense.id !== expenseId),
              };
            }
            return group;
          }),
        };
      }
      return event;
    }));
  };

  const toggleEvent = (eventId) => {
    setExpandedEvents({
      ...expandedEvents,
      [eventId]: !expandedEvents[eventId],
    });
  };

  const calculateEventTotal = (event) => {
    return event.groups.reduce((total, group) => {
      const groupTotal = group.expenses.reduce((sum, expense) => sum + expense.amount, 0);
      return total + groupTotal;
    }, 0);
  };

  const handleMenuOpen = (event, eventId) => {
    setMenuAnchor(event.currentTarget);
    setSelectedEventId(eventId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedEventId(null);
  };

  const handleEditClick = () => {
    const eventToEdit = events.find(event => event.id === selectedEventId);
    if (eventToEdit) {
      setEditingEvent(eventToEdit);
      setNewEventName(eventToEdit.name);
      setOpenDialog(true);
    }
    handleMenuClose();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Events
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingEvent(null);
            setNewEventName('');
            setOpenDialog(true);
          }}
        >
          Add Event
        </Button>
      </Box>

      {events.map(event => (
        <Card key={event.id} sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h5" component="h2">
                  {event.name}
                </Typography>
                <Paper elevation={0} sx={{ mt: 1, p: 1, bgcolor: 'grey.50', display: 'inline-block' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Expenses: ${calculateEventTotal(event).toFixed(2)}
                  </Typography>
                </Paper>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton onClick={() => toggleEvent(event.id)}>
                  {expandedEvents[event.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
                <IconButton onClick={(e) => handleMenuOpen(e, event.id)}>
                  <MoreVertIcon />
                </IconButton>
              </Box>
            </Box>
            <Collapse in={expandedEvents[event.id]}>
              <GroupList
                groups={event.groups}
                onAddGroup={(groupName) => handleAddGroup(event.id, groupName)}
                onAddExpense={(groupId, expense) => handleAddExpense(event.id, groupId, expense)}
                onEditGroup={(groupId, newName) => handleEditGroup(event.id, groupId, newName)}
                onDeleteGroup={(groupId) => handleDeleteGroup(event.id, groupId)}
                onEditExpense={(groupId, expenseId, updatedExpense) => 
                  handleEditExpense(event.id, groupId, expenseId, updatedExpense)}
                onDeleteExpense={(groupId, expenseId) => 
                  handleDeleteExpense(event.id, groupId, expenseId)}
              />
            </Collapse>
          </CardContent>
        </Card>
      ))}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{editingEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Event Name"
            fullWidth
            value={newEventName}
            onChange={(e) => setNewEventName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={editingEvent ? handleEditEvent : handleAddEvent} 
            variant="contained"
          >
            {editingEvent ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditClick}>Edit</MenuItem>
        <MenuItem onClick={() => handleDeleteEvent(selectedEventId)}>Delete</MenuItem>
      </Menu>
    </Box>
  );
}

export default EventList; 
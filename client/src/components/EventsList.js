import React, { useState, useEffect } from 'react';
import { Box, Typography, ListItemText } from '@mui/material';
import ExpandableList from './ExpandableList';
import CreateEventForm from './CreateEventForm';
import EventDetailView from './EventDetailView';
import Avatar from './Avatar';
import useApiCall from '../hooks/useApiCall';
import { getUserAvatar } from '../utils/avatarUtils';

function EventsList({ isOpen, onToggle, onEventClick, onDataChanged, onLoadingChange }) {
  const [events, setEvents] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const { loading, apiCall } = useApiCall(onLoadingChange);

  useEffect(() => {
    if (isOpen) {
      fetchEvents();
    }
  }, [isOpen]);

  const API_URL = process.env.REACT_APP_API_URL || '';

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

  const fetchEvents = async () => {
    await apiCall(async () => {
      try {
        const response = await fetch(`${API_URL}/api/events`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Non-JSON response:', text);
          throw new Error('Server returned non-JSON response');
        }
        
        const data = await response.json();
        
        // Sort events: unsettled events first, then settled events
        const sortedEvents = data.sort((a, b) => {
          const aSettled = (a.remainingBalance || 0) === 0 && (a.totalAmount || 0) > 0;
          const bSettled = (b.remainingBalance || 0) === 0 && (b.totalAmount || 0) > 0;
          
          // If one is settled and the other isn't, put unsettled first
          if (aSettled !== bSettled) {
            return aSettled ? 1 : -1;
          }
          
          // If both have same settled status, sort by date (most recent first)
          return new Date(b.eventDate) - new Date(a.eventDate);
        });
        
        setEvents(sortedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]); // Set empty array on error
      }
    });
  };

  const renderEventItem = (event) => {
    const title = event.name || event.title || `Event ${event._id}`;
    const owner = event.owner ? event.owner.name : 'Unknown';
    const remainingBalance = event.remainingBalance || 0;
    const isSettled = remainingBalance === 0 && event.totalAmount > 0;
    const dollarColor = getEventDollarColor(title);
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
        <Box sx={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: dollarColor.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Typography sx={{ 
            fontSize: '1.1rem', 
            fontWeight: 700,
            color: dollarColor.text
          }}>
            $
          </Typography>
        </Box>
        <ListItemText 
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '0.95rem' }}>
                {title}
              </Typography>
              {isSettled && (
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
          }
          secondary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontSize: '0.8rem' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                  by:
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#1976d2', 
                  fontWeight: 600,
                  fontSize: '0.75rem'
                }}>
                  {owner}
                </Typography>
              </Box>
              {remainingBalance > 0 && (
                <>
                  <Box component="span" sx={{ color: 'text.secondary' }}>•</Box>
                  <Box component="span" sx={{ color: 'error.main', fontWeight: 'medium' }}>
                    ${remainingBalance.toFixed(2)} remaining
                  </Box>
                </>
              )}
            </Box>
          }
        />
      </Box>
    );
  };

  const handleItemClick = (item) => {
    if (item === 'create') {
      setShowCreateForm(true);
    } else {
      setSelectedEventId(item._id);
      setShowEventDetail(true);
      onEventClick && onEventClick(item);
    }
  };

  const handleEventCreated = () => {
    fetchEvents(); // Refresh the events list
    if (onDataChanged) {
      onDataChanged(); // Also refresh other lists (like UsersList)
    }
  };

  const handleEventUpdated = () => {
    fetchEvents(); // Refresh the events list when event is updated
    if (onDataChanged) {
      onDataChanged(); // Also refresh other lists (like UsersList) when event is updated/deleted
    }
  };

  const calculateTotalSpend = () => {
    return events.reduce((total, event) => {
      return total + (event.totalAmount || 0);
    }, 0);
  };

  return (
    <>
      <ExpandableList
        title="Expense Events"
        subtitle={events.length > 0 ? `Total spend: $${calculateTotalSpend().toFixed(2)}` : undefined}
        isOpen={isOpen}
        onToggle={onToggle}
        createText="+ Create Event"
        items={events}
        onItemClick={handleItemClick}
        renderItem={renderEventItem}
      />
      <CreateEventForm 
        open={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onEventCreated={handleEventCreated}
      />
      <EventDetailView 
        open={showEventDetail}
        onClose={() => setShowEventDetail(false)}
        eventId={selectedEventId}
        onEventUpdated={handleEventUpdated}
      />
    </>
  );
}

export default EventsList;
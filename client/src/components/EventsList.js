import React, { useState, useEffect } from 'react';
import { Box, Typography, ListItemText } from '@mui/material';
import ExpandableList from './ExpandableList';
import CreateEventForm from './CreateEventForm';
import EventDetailView from './EventDetailView';
import useApiCall from '../hooks/useApiCall';

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
    
    return (
      <ListItemText 
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body1">
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
          <Box component="span">
            <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.85em' }}>
              Owner:
            </Box>
            {' '}
            <Box component="span" sx={{ color: 'primary.main', fontWeight: 'medium' }}>
              {owner}
            </Box>
            {remainingBalance > 0 && (
              <>
                {' • '}
                <Box component="span" sx={{ color: 'error.main', fontWeight: 'medium' }}>
                  ${remainingBalance.toFixed(2)}
                </Box>
                {' '}
                <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.85em' }}>
                  remaining
                </Box>
              </>
            )}
          </Box>
        }
      />
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

  return (
    <>
      <ExpandableList
        title="Events"
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
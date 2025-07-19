import React, { useState, useEffect } from 'react';
import ExpandableList from './ExpandableList';

function EventsList({ isOpen, onToggle, onEventClick }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchEvents();
    }
  }, [isOpen]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      
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
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]); // Set empty array on error
    }
  };

  const getEventText = (event) => {
    return event.name || event.title || `Event ${event._id}`;
  };

  return (
    <ExpandableList
      title="Events"
      isOpen={isOpen}
      onToggle={onToggle}
      createText="+ Create Event"
      items={events}
      onItemClick={onEventClick}
      getItemText={getEventText}
    />
  );
}

export default EventsList;
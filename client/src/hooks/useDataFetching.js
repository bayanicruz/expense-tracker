import { useState, useEffect, useCallback } from 'react';

export const useDataFetching = () => {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [eventsLoaded, setEventsLoaded] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || '';

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        setUsersLoaded(true);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsersLoaded(true);
    }
  }, [API_URL]);

  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/events`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
        setEventsLoaded(true);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setEventsLoaded(true);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchUsers();
    fetchEvents();
  }, [fetchUsers, fetchEvents]);

  return {
    users,
    events,
    usersLoaded,
    eventsLoaded,
    allDataLoaded: usersLoaded && eventsLoaded
  };
};

export default useDataFetching;
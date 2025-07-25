import { useState, useEffect, useCallback } from 'react';

export const useDataFetching = () => {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [eventsError, setEventsError] = useState(null);
  const [isConnected, setIsConnected] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL || '';

  const fetchUsers = useCallback(async () => {
    try {
      setUsersError(null);
      const response = await fetch(`${API_URL}/api/users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        setIsConnected(true);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsersError(error.message);
      setUsers([]);
      
      // Check if it's a network connectivity issue
      if (error.name === 'TypeError' || error.message.includes('fetch')) {
        setIsConnected(false);
      }
    } finally {
      setUsersLoaded(true);
    }
  }, [API_URL]);

  const fetchEvents = useCallback(async () => {
    try {
      setEventsError(null);
      const response = await fetch(`${API_URL}/api/events`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
        setIsConnected(true);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setEventsError(error.message);
      setEvents([]);
      
      // Check if it's a network connectivity issue
      if (error.name === 'TypeError' || error.message.includes('fetch')) {
        setIsConnected(false);
      }
    } finally {
      setEventsLoaded(true);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchUsers();
    fetchEvents();
  }, [fetchUsers, fetchEvents]);

  const refreshData = useCallback(() => {
    setUsersLoaded(false);
    setEventsLoaded(false);
    fetchUsers();
    fetchEvents();
  }, [fetchUsers, fetchEvents]);

  const retryConnection = useCallback(() => {
    setIsConnected(true);
    refreshData();
  }, [refreshData]);

  return {
    users,
    events,
    usersLoaded,
    eventsLoaded,
    usersError,
    eventsError,
    isConnected,
    allDataLoaded: usersLoaded && eventsLoaded,
    hasData: users.length > 0 || events.length > 0,
    refreshData,
    retryConnection
  };
};

export default useDataFetching;
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Box } from '@mui/material';
import ExpandableList from './ExpandableList';
import CreateUserForm from './CreateUserForm';
import UserDetailView from './UserDetailView';
import EventDetailView from './EventDetailView';

const UsersList = forwardRef(({ isOpen, onToggle, onUserClick }, ref) => {
  const [users, setUsers] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  useImperativeHandle(ref, () => ({
    refreshData: () => {
      fetchUsers();
    }
  }));

  const API_URL = process.env.REACT_APP_API_URL || '';

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users`);
      
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
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]); // Set empty array on error
    }
  };

  const getUserText = (user) => {
    const name = user.name || user.username || `User ${user._id}`;
    const owes = user.runningBalance || 0;
    const owedToUser = user.amountOwedToUser || 0;
    
    const formatBalance = (owesAmount, owedAmount) => {
      // Round to 2 decimal places and ensure we're working with actual numbers
      const owesRounded = Math.round((owesAmount || 0) * 100) / 100;
      const owedRounded = Math.round((owedAmount || 0) * 100) / 100;
      
      // If both amounts are zero, return empty/null for no subtext
      if (owesRounded <= 0 && owedRounded <= 0) {
        return null;
      }
      
      return (
        <Box component="span">
          {/* What user needs to pay */}
          {owesRounded > 0 && (
            <>
              <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.85em' }}>
                Outstanding
              </Box>
              {' '}
              <Box component="span" sx={{ color: 'error.main', fontWeight: 'medium' }}>
                ${owesRounded.toFixed(2)}
              </Box>
            </>
          )}
          
          {/* Separator if both amounts exist */}
          {owesRounded > 0 && owedRounded > 0 && (
            <Box component="span" sx={{ color: 'text.secondary', mx: 0.5 }}>
              •
            </Box>
          )}
          
          {/* What user is waiting to collect */}
          {owedRounded > 0 && (
            <>
              <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.85em' }}>
                Collecting
              </Box>
              {' '}
              <Box component="span" sx={{ color: 'warning.main', fontWeight: 'medium' }}>
                ${owedRounded.toFixed(2)}
              </Box>
            </>
          )}
        </Box>
      );
    };
    
    return {
      primary: name,
      secondary: formatBalance(owes, owedToUser)
    };
  };

  const handleItemClick = (item) => {
    if (item === 'create') {
      setShowCreateForm(true);
    } else {
      setSelectedUserId(item._id);
      setSelectedUser(item);
      setShowUserDetail(true);
      onUserClick && onUserClick(item);
    }
  };

  const handleUserCreated = () => {
    fetchUsers(); // Refresh the users list
  };

  const handleUserUpdated = () => {
    fetchUsers(); // Refresh the users list when user is updated
  };

  const handleEventClick = (eventId) => {
    setSelectedEventId(eventId);
    setShowEventDetail(true);
  };

  const userDetailRef = useRef(null);

  const handleEventUpdated = () => {
    fetchUsers(); // Refresh the users list when event is updated
    // Also refresh user detail if it's open
    if (userDetailRef.current && userDetailRef.current.refreshData) {
      userDetailRef.current.refreshData();
    }
  };

  return (
    <>
      <ExpandableList
        title="Users"
        isOpen={isOpen}
        onToggle={onToggle}
        createText="+ Create User"
        items={users}
        onItemClick={handleItemClick}
        getItemText={getUserText}
      />
      <CreateUserForm 
        open={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onUserCreated={handleUserCreated}
      />
      <UserDetailView 
        ref={userDetailRef}
        open={showUserDetail}
        onClose={() => setShowUserDetail(false)}
        userId={selectedUserId}
        onUserUpdated={handleUserUpdated}
        onEventClick={handleEventClick}
      />
      <EventDetailView 
        open={showEventDetail}
        onClose={() => {
          setShowEventDetail(false);
          setSelectedUser(null);
        }}
        eventId={selectedEventId}
        onEventUpdated={handleEventUpdated}
        breadcrumbUser={selectedUser}
        onBreadcrumbClick={() => {
          setShowEventDetail(false);
          setShowUserDetail(true);
        }}
      />
    </>
  );
});

export default UsersList;
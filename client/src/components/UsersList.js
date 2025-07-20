import React, { useState, useEffect } from 'react';
import ExpandableList from './ExpandableList';
import CreateUserForm from './CreateUserForm';
import UserDetailView from './UserDetailView';
import EventDetailView from './EventDetailView';

function UsersList({ isOpen, onToggle, onUserClick }) {
  const [users, setUsers] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      
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
    const balance = user.runningBalance || 0;
    
    return {
      primary: name,
      secondary: `Owed: $${balance.toFixed(2)}`
    };
  };

  const handleItemClick = (item) => {
    if (item === 'create') {
      setShowCreateForm(true);
    } else {
      setSelectedUserId(item._id);
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

  const handleEventUpdated = () => {
    fetchUsers(); // Refresh the users list when event is updated
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
        open={showUserDetail}
        onClose={() => setShowUserDetail(false)}
        userId={selectedUserId}
        onUserUpdated={handleUserUpdated}
        onEventClick={handleEventClick}
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

export default UsersList;
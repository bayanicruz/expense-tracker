import React, { useState, useEffect } from 'react';
import ExpandableList from './ExpandableList';

function UsersList({ isOpen, onToggle, onUserClick }) {
  const [users, setUsers] = useState([]);

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
    return user.name || user.username || `User ${user._id}`;
  };

  return (
    <ExpandableList
      title="Users"
      isOpen={isOpen}
      onToggle={onToggle}
      createText="+ Create User"
      items={users}
      onItemClick={onUserClick}
      getItemText={getUserText}
    />
  );
}

export default UsersList;
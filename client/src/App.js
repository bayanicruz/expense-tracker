import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Header from './components/Header';
import UsersList from './components/UsersList';
import EventsList from './components/EventsList';

function App() {
  const [usersOpen, setUsersOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(true);

  const handleUsersClick = () => {
    setUsersOpen(!usersOpen);
  };

  const handleEventsClick = () => {
    setEventsOpen(!eventsOpen);
  };

  const handleUserClick = (user) => {
    if (user === 'create') {
      console.log('Create new user');
    } else {
      console.log('Selected user:', user);
    }
  };

  const handleEventClick = (event) => {
    if (event === 'create') {
      console.log('Create new event');
    } else {
      console.log('Selected event:', event);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Header />
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Box sx={{ 
          border: '1px solid #ddd', 
          borderRadius: 2, 
          p: 3,
          backgroundColor: '#f9f9f9'
        }}>
          <Stack spacing={2}>
            <UsersList 
              isOpen={usersOpen}
              onToggle={handleUsersClick}
              onUserClick={handleUserClick}
            />
            <EventsList 
              isOpen={eventsOpen}
              onToggle={handleEventsClick}
              onEventClick={handleEventClick}
            />
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

export default App;

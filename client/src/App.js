import React, { useState, useRef } from 'react';
import { 
  Box, 
  Container, 
  Stack, 
  Typography, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  IconButton 
} from '@mui/material';
import { Assessment as AnalyticsIcon, Close as CloseIcon } from '@mui/icons-material';
import ExportButton from './components/analytics/ExportButton';
import Header from './components/Header';
import UsersList from './components/UsersList';
import EventsList from './components/EventsList';
import Analytics from './components/Analytics';

function App() {
  const [usersOpen, setUsersOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(true);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const usersListRef = useRef(null);

  const handleUsersClick = () => {
    setUsersOpen(!usersOpen);
  };

  const handleEventsClick = () => {
    setEventsOpen(!eventsOpen);
  };

  const handleAnalyticsOpen = () => {
    setAnalyticsOpen(true);
  };

  const handleAnalyticsClose = () => {
    setAnalyticsOpen(false);
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

  const handleDataChanged = () => {
    // Refresh UsersList by calling its refresh method
    if (usersListRef.current && usersListRef.current.refreshData) {
      usersListRef.current.refreshData();
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
              ref={usersListRef}
              isOpen={usersOpen}
              onToggle={handleUsersClick}
              onUserClick={handleUserClick}
            />
            <EventsList 
              isOpen={eventsOpen}
              onToggle={handleEventsClick}
              onEventClick={handleEventClick}
              onDataChanged={handleDataChanged}
            />
          </Stack>
          
          {/* Main Content Footer */}
          <Box sx={{ 
            borderTop: '1px solid #e0e0e0', 
            pt: 2, 
            mt: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="caption" color="textSecondary">
              © kuruzu 2025
            </Typography>
            <Button
              size="small"
              variant="text"
              startIcon={<AnalyticsIcon />}
              onClick={handleAnalyticsOpen}
              sx={{ 
                textTransform: 'none',
                color: 'text.secondary',
                fontSize: '0.75rem',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              Storage Insights
            </Button>
          </Box>
        </Box>
        
        {/* Analytics Modal */}
        <Dialog
          open={analyticsOpen}
          onClose={handleAnalyticsClose}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: { 
              minHeight: '80vh',
              borderRadius: 2
            }
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            pb: 1
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AnalyticsIcon />
              <Typography variant="h6">
                Storage Insights & Analytics
              </Typography>
            </Box>
            <IconButton
              onClick={handleAnalyticsClose}
              size="small"
              sx={{ color: 'text.secondary' }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            <Analytics />
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between' }}>
            <ExportButton />
            <Button onClick={handleAnalyticsClose} variant="outlined">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default App;

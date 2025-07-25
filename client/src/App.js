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
import LoadingOverlay from './components/LoadingOverlay';
import EmptyState from './components/EmptyState';
import useDataFetching from './hooks/useDataFetching';
import CreateUserForm from './components/CreateUserForm';

function App() {
  const [usersOpen, setUsersOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(true);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [listsLoading, setListsLoading] = useState(false);
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);
  const usersListRef = useRef(null);
  
  const { 
    isConnected, 
    allDataLoaded, 
    hasData, 
    refreshData, 
    retryConnection 
  } = useDataFetching();

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
    // Also refresh the app's data
    refreshData();
  };

  const handleCreateFirstUser = () => {
    setShowCreateUserForm(true);
  };

  const handleUserCreated = () => {
    setShowCreateUserForm(false);
    handleDataChanged();
  };

  const renderMainContent = () => {
    // Show loading state while data is being fetched
    if (!allDataLoaded) {
      return (
        <LoadingOverlay loading={true}>
          <Box sx={{ height: '200px' }} />
        </LoadingOverlay>
      );
    }

    // Show connection error state
    if (!isConnected) {
      return (
        <EmptyState
          type="offline"
          onRetry={retryConnection}
        />
      );
    }

    // Show empty state when no data exists
    if (!hasData) {
      return (
        <Stack spacing={3}>
          <EmptyState
            type="users"
            onAction={handleCreateFirstUser}
          />
          <Typography variant="body2" sx={{ 
            textAlign: 'center', 
            color: 'text.secondary',
            fontStyle: 'italic' 
          }}>
            Welcome to your expense tracker! Start by adding members who will share expenses with you.
          </Typography>
        </Stack>
      );
    }

    // Show normal content with lists
    return (
      <Stack spacing={2}>
        <UsersList 
          ref={usersListRef}
          isOpen={usersOpen}
          onToggle={handleUsersClick}
          onUserClick={handleUserClick}
          onLoadingChange={setListsLoading}
        />
        <EventsList 
          isOpen={eventsOpen}
          onToggle={handleEventsClick}
          onEventClick={handleEventClick}
          onLoadingChange={setListsLoading}
        />
      </Stack>
    );
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Header onDataChanged={handleDataChanged} isConnected={isConnected} />
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Box sx={{ 
          border: '1px solid #ddd', 
          borderRadius: 2, 
          p: 3,
          backgroundColor: '#f9f9f9'
        }}>
          <LoadingOverlay loading={listsLoading}>
            {renderMainContent()}
          </LoadingOverlay>
          
          {/* Main Content Footer */}
          <Box sx={{ 
            borderTop: '1px solid #e0e0e0', 
            pt: 2, 
            mt: 3,
            display: 'flex',
            justifyContent: isConnected ? 'space-between' : 'center',
            alignItems: 'center'
          }}>
            <Typography variant="caption" color="textSecondary">
              © kuruzu 2025
            </Typography>
            {isConnected && (
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
            )}
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

        {/* Create User Dialog */}
        <Dialog 
          open={showCreateUserForm} 
          onClose={() => setShowCreateUserForm(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add Your First Member</DialogTitle>
          <DialogContent>
            <CreateUserForm 
              onUserCreated={handleUserCreated}
              onCancel={() => setShowCreateUserForm(false)}
            />
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
}

export default App;

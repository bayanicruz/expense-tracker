import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GossipDisplay from './GossipDisplay';
import InsightsDisplay from './InsightsDisplay';
import CreateUserForm from './CreateUserForm';
import ExpandCollapseButton from './ExpandCollapseButton';
import useFeatureToggles from '../hooks/useFeatureToggles';
import useDataFetching from '../hooks/useDataFetching';

function Header() {
  const { enableGossip, enableReminders, hasAnyFeature } = useFeatureToggles();
  const { users, events, eventsLoaded, allDataLoaded, refreshData } = useDataFetching();
  
  const [isExpanded, setIsExpanded] = useState(true);
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleCreateUser = () => {
    setShowCreateUserForm(true);
  };

  const handleUserCreated = () => {
    setShowCreateUserForm(false);
    if (refreshData) {
      refreshData();
    }
  };


  return (
    <AppBar position="sticky" sx={{ 
      backgroundColor: !hasAnyFeature || !isExpanded ? 'black' : 'white', 
      color: !hasAnyFeature || !isExpanded ? 'white' : 'black' 
    }}>
      <Toolbar sx={{ justifyContent: 'center', py: !hasAnyFeature || !isExpanded ? 1 : 2, minHeight: !hasAnyFeature || !isExpanded ? '48px' : 'auto' }}>
        <Box sx={{ maxWidth: '600px', width: '100%', position: 'relative' }}>
          {/* Collapsed State - Enhanced Title */}
          {(!hasAnyFeature || !isExpanded) && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              position: 'relative'
            }}>
              {/* Main title with icon */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.2,
                px: 2,
                py: 0.8,
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '8px',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <Typography 
                  sx={{ 
                    fontSize: '1.3rem',
                    fontWeight: 300,
                    color: '#4caf50',
                    fontFamily: 'monospace'
                  }}
                >
                  $
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'white', 
                    fontWeight: 500,
                    fontSize: '0.95rem',
                    letterSpacing: '0.2px'
                  }}
                >
                  Expense Tracker
                </Typography>
              </Box>
            </Box>
          )}
          
          {/* Feature Content */}
          {enableGossip && (
            <GossipDisplay 
              users={users}
              events={events}
              allDataLoaded={allDataLoaded}
              isExpanded={isExpanded}
            />
          )}
          {enableReminders && (
            <InsightsDisplay 
              users={users}
              events={events}
              eventsLoaded={eventsLoaded}
              isExpanded={isExpanded}
            />
          )}
        </Box>
      </Toolbar>
      
      {hasAnyFeature && (
        <ExpandCollapseButton 
          isExpanded={isExpanded}
          onToggle={toggleExpanded}
          onCreateUser={handleCreateUser}
        />
      )}
      
      <CreateUserForm 
        open={showCreateUserForm}
        onClose={() => setShowCreateUserForm(false)}
        onUserCreated={handleUserCreated}
      />
    </AppBar>
  );
}

export default Header;
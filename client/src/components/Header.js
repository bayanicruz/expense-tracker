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

function Header({ onDataChanged, isConnected = true }) {
  const { enableGossip, enableReminders, hasAnyFeature } = useFeatureToggles();
  const { users, events, eventsLoaded, allDataLoaded, refreshData } = useDataFetching();
  
  const [isExpanded, setIsExpanded] = useState(true);
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);
  
  // Force collapsed state when offline
  const effectiveExpanded = isConnected ? isExpanded : false;
  const effectiveHasFeature = isConnected ? hasAnyFeature : false;

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
    // Also notify parent component to refresh any dependent lists
    if (onDataChanged) {
      onDataChanged();
    }
  };


  return (
    <AppBar position="sticky" sx={{ 
      backgroundColor: !effectiveHasFeature || !effectiveExpanded ? 'black' : 'white', 
      color: !effectiveHasFeature || !effectiveExpanded ? 'white' : 'black' 
    }}>
      <Toolbar sx={{ justifyContent: 'center', py: !effectiveHasFeature || !effectiveExpanded ? 1 : 2, minHeight: !effectiveHasFeature || !effectiveExpanded ? '48px' : 'auto' }}>
        <Box sx={{ maxWidth: '600px', width: '100%', position: 'relative' }}>
          {/* Collapsed State - Enhanced Title */}
          {(!effectiveHasFeature || !effectiveExpanded) && (
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
          
          {/* Feature Content - Only show when connected */}
          {isConnected && enableGossip && (
            <GossipDisplay 
              users={users}
              events={events}
              allDataLoaded={allDataLoaded}
              isExpanded={effectiveExpanded}
            />
          )}
          {isConnected && enableReminders && (
            <InsightsDisplay 
              users={users}
              events={events}
              eventsLoaded={eventsLoaded}
              isExpanded={effectiveExpanded}
            />
          )}
        </Box>
      </Toolbar>
      
      {/* Hide expand/collapse and add buttons when offline */}
      {isConnected && effectiveHasFeature && (
        <ExpandCollapseButton 
          isExpanded={effectiveExpanded}
          onToggle={toggleExpanded}
          onCreateUser={handleCreateUser}
        />
      )}
      
      {/* Hide create user form when offline */}
      {isConnected && (
        <CreateUserForm 
          open={showCreateUserForm}
          onClose={() => setShowCreateUserForm(false)}
          onUserCreated={handleUserCreated}
        />
      )}
    </AppBar>
  );
}

export default Header;
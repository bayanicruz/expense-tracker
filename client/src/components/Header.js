import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import GossipDisplay from './GossipDisplay';
import InsightsDisplay from './InsightsDisplay';
import ExpandCollapseButton from './ExpandCollapseButton';
import useFeatureToggles from '../hooks/useFeatureToggles';
import useDataFetching from '../hooks/useDataFetching';

function Header() {
  const { enableGossip, enableReminders, hasAnyFeature } = useFeatureToggles();
  const { users, events, eventsLoaded, allDataLoaded } = useDataFetching();
  
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };


  return (
    <AppBar position="sticky" sx={{ 
      backgroundColor: !hasAnyFeature || !isExpanded ? '#1976d2' : 'white', 
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
                py: 0.5,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
                borderRadius: '20px',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <Typography 
                  sx={{ 
                    fontSize: '1.3rem',
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                  }}
                >
                  💰
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'white', 
                    fontWeight: 600,
                    fontSize: '1rem',
                    textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                    letterSpacing: '0.3px'
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
        />
      )}
    </AppBar>
  );
}

export default Header;
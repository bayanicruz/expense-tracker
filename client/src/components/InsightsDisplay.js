import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import useAutoRefreshTimer from '../hooks/useAutoRefreshTimer';
import { generateAllInsights } from '../insights/insightOrchestrator';

function InsightsDisplay({ users, events, eventsLoaded, isExpanded }) {
  const [insight, setInsight] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [insightIndex, setInsightIndex] = useState(0);

  const generateNewInsight = useCallback(async () => {
    if (!eventsLoaded || !events.length) {
      setInsight('');
      return;
    }
    
    // Start fade out transition
    setIsTransitioning(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Generate all insights
    const insights = generateAllInsights(events, users);
    
    if (insights.length > 0) {
      // Cycle through insights
      const selectedInsight = insights[insightIndex % insights.length];
      setInsight(selectedInsight);
      setInsightIndex(prev => (prev + 1) % insights.length);
    } else {
      setInsight(`📊 You have **${events.length}** event${events.length !== 1 ? 's' : ''} tracked.`);
    }
    
    // Fade in with new content
    await new Promise(resolve => setTimeout(resolve, 100));
    setIsTransitioning(false);
  }, [users, events, eventsLoaded, insightIndex]);

  const { handleManualTrigger } = useAutoRefreshTimer(
    generateNewInsight,
    10000,
    isExpanded
  );

  const renderInsight = (insight) => {
    const parts = insight.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1
        ? <Box key={i} component="span" sx={{ fontWeight: 'bold', display: 'inline' }}>{part}</Box>
        : part
    );
  };

  useEffect(() => {
    if (eventsLoaded && events.length > 0) {
      generateNewInsight();
    }
  }, [eventsLoaded, events, generateNewInsight]);

  return (
    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        cursor: 'pointer',
        userSelect: 'none',
        '&:active': {
          transform: 'scale(0.98)',
          transition: 'transform 0.1s ease'
        }
      }}
      onClick={handleManualTrigger}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography 
            variant="h6" 
            sx={{ fontSize: '1.2rem', color: 'black', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
          >
            📌
          </Typography>
          <Box sx={{
            backgroundColor: '#fffde7',
            color: 'black',
            borderRadius: '8px',
            padding: '6px 10px',
            width: '100%',
            maxWidth: 'none',
            boxShadow: '0 1.5px 6px 0 rgba(0,0,0,0.07)',
            minHeight: '22px',
            display: 'flex',
            alignItems: 'center',
            fontFamily: '"Shadows Into Light", "Comic Sans MS", "Comic Sans", cursive, sans-serif',
            fontSize: '0.97rem',
            letterSpacing: '0.01em',
            lineHeight: 1.25,
            transition: 'opacity 0.3s ease-in-out',
            border: '1px solid #ffe082',
            opacity: isTransitioning ? 0.3 : 1,
          }}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontSize: '0.97rem', 
                fontWeight: 500, 
                lineHeight: 1.25, 
                width: '100%',
                transition: 'opacity 0.3s ease-in-out',
                opacity: isTransitioning ? 0 : 1
              }}
            >
              {renderInsight(insight)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Collapse>
  );
}

export default InsightsDisplay;
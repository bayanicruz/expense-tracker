import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import gossipConfig from '../config/gossip.json';

function GossipDisplay({ users, events, allDataLoaded, isExpanded }) {
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('😏');
  const [answer, setAnswer] = useState('');
  const [answerEmoji, setAnswerEmoji] = useState('💅');
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isTyping, setIsTyping] = useState(true);

  const generateNewConversation = useCallback(async () => {
    if (!allDataLoaded) {
      setIsTyping(true);
      setEmoji('😏');
      setAnswerEmoji('💅');
      return;
    }

    setIsTyping(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));

    const useUserGossip = Math.random() < 0.5;
    
    let randomTitleTemplate, randomAnswer;
    
    if (useUserGossip && users.length > 0) {
      randomTitleTemplate = gossipConfig.userGossip[Math.floor(Math.random() * gossipConfig.userGossip.length)];
      randomAnswer = gossipConfig.userAnswers[Math.floor(Math.random() * gossipConfig.userAnswers.length)];
      
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const userName = randomUser.name || randomUser.username || `User ${randomUser._id}`;
      randomTitleTemplate = randomTitleTemplate.replace(/{name}/g, userName);
    } else if (events.length > 0) {
      randomTitleTemplate = gossipConfig.eventGossip[Math.floor(Math.random() * gossipConfig.eventGossip.length)];
      randomAnswer = gossipConfig.eventAnswers[Math.floor(Math.random() * gossipConfig.eventAnswers.length)];
      
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      const eventName = randomEvent.title || randomEvent.name || `Event ${randomEvent._id}`;
      randomTitleTemplate = randomTitleTemplate.replace(/{event}/g, eventName);
    } else {
      randomTitleTemplate = gossipConfig.userGossip[Math.floor(Math.random() * gossipConfig.userGossip.length)];
      randomAnswer = gossipConfig.userAnswers[Math.floor(Math.random() * gossipConfig.userAnswers.length)];
      randomTitleTemplate = randomTitleTemplate.replace(/{name}/g, 'Chico');
    }
    
    const randomEmoji = gossipConfig.snarkyEmojis[Math.floor(Math.random() * gossipConfig.snarkyEmojis.length)];
    const randomAnswerEmoji = gossipConfig.answerEmojis[Math.floor(Math.random() * gossipConfig.answerEmojis.length)];
    
    setTitle(randomTitleTemplate);
    setEmoji(randomEmoji);
    setAnswer(randomAnswer);
    setAnswerEmoji(randomAnswerEmoji);
    setIsTyping(false);
  }, [users, events, allDataLoaded]);

  const renderTitle = (text) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <Box key={index} component="span" sx={{ 
            fontWeight: 'bold'
          }}>
            {part}
          </Box>
        );
      }
      return part;
    });
  };

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe || isRightSwipe) {
      generateNewConversation();
    }
  };

  useEffect(() => {
    if (allDataLoaded) {
      generateNewConversation();
    }
  }, [allDataLoaded, generateNewConversation]);

  useEffect(() => {
    const interval = setInterval(() => {
      generateNewConversation();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [isExpanded, generateNewConversation]);

  return (
    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
      <Box 
        sx={{
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
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={generateNewConversation}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontSize: '1.2rem',
              color: 'black',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
            }}
          >
            {emoji}:
          </Typography>
          <Box sx={{
            backgroundColor: '#e0e0e0',
            color: 'black',
            borderRadius: '20px',
            padding: '8px 16px',
            maxWidth: '400px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            minHeight: '20px',
            display: 'flex',
            alignItems: 'center'
          }}>
            {isTyping ? (
              <Box sx={{ display: 'flex', gap: '3px', alignItems: 'center', py: 0.5 }}>
                {[0, 1, 2].map((dot) => (
                  <Box
                    key={dot}
                    sx={{
                      width: '6px',
                      height: '6px',
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      borderRadius: '50%',
                      animation: 'typing 1.4s infinite',
                      animationDelay: `${dot * 0.2}s`,
                      '@keyframes typing': {
                        '0%, 60%, 100%': {
                          transform: 'translateY(0)',
                          opacity: 0.4
                        },
                        '30%': {
                          transform: 'translateY(-4px)',
                          opacity: 1
                        }
                      }
                    }}
                  />
                ))}
              </Box>
            ) : (
              <Typography 
                variant="body2" 
                sx={{ 
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  lineHeight: 1.3
                }}
              >
                {renderTitle(title)}
              </Typography>
            )}
          </Box>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end',
          alignItems: 'center', 
          gap: 1
        }}>
          <Box sx={{
            backgroundColor: isTyping ? '#e0e0e0' : '#1976d2',
            color: isTyping ? 'black' : 'white',
            borderRadius: '20px',
            padding: '6px 12px',
            maxWidth: '200px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            minHeight: '20px',
            display: 'flex',
            alignItems: 'center'
          }}>
            {isTyping ? (
              <Box sx={{ display: 'flex', gap: '3px', alignItems: 'center', py: 0.5 }}>
                {[0, 1, 2].map((dot) => (
                  <Box
                    key={dot}
                    sx={{
                      width: '5px',
                      height: '5px',
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      borderRadius: '50%',
                      animation: 'typing 1.4s infinite',
                      animationDelay: `${dot * 0.2}s`,
                      '@keyframes typing': {
                        '0%, 60%, 100%': {
                          transform: 'translateY(0)',
                          opacity: 0.4
                        },
                        '30%': {
                          transform: 'translateY(-3px)',
                          opacity: 1
                        }
                      }
                    }}
                  />
                ))}
              </Box>
            ) : (
              <Typography 
                variant="body2" 
                sx={{ 
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  lineHeight: 1.3
                }}
              >
                {answer}
              </Typography>
            )}
          </Box>
          <Typography 
            variant="h6" 
            sx={{ 
              fontSize: '1rem',
              color: 'black',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
            }}
          >
            :{answerEmoji}
          </Typography>
        </Box>
      </Box>
    </Collapse>
  );
}

export default GossipDisplay;
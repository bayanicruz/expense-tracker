import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import gossipConfig from '../config/gossip.json';

function Header() {
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('😏');
  const [answer, setAnswer] = useState('');
  const [answerEmoji, setAnswerEmoji] = useState('💅');
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isTyping, setIsTyping] = useState(true); // Start with typing animation

  const API_URL = process.env.REACT_APP_API_URL || '';

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        setUsersLoaded(true);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsersLoaded(true); // Still mark as loaded even if failed
    }
  };

  const generateNewConversation = async () => {
    // Show loading state if users haven't loaded yet
    if (!usersLoaded) {
      setIsTyping(true);
      setEmoji('😏');
      setAnswerEmoji('💅');
      return;
    }

    // Show typing animation
    setIsTyping(true);
    
    // Wait for 2 seconds to show typing animation
    await new Promise(resolve => setTimeout(resolve, 2000));

    const randomTitleTemplate = gossipConfig.gossip[Math.floor(Math.random() * gossipConfig.gossip.length)];
    const randomEmoji = gossipConfig.snarkyEmojis[Math.floor(Math.random() * gossipConfig.snarkyEmojis.length)];
    const randomAnswer = gossipConfig.answers[Math.floor(Math.random() * gossipConfig.answers.length)];
    const randomAnswerEmoji = gossipConfig.answerEmojis[Math.floor(Math.random() * gossipConfig.answerEmojis.length)];
    
    // Replace {name} placeholder with random user name
    let finalTitle = randomTitleTemplate;
    if (users.length > 0) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const userName = randomUser.name || randomUser.username || `User ${randomUser._id}`;
      finalTitle = randomTitleTemplate.replace(/{name}/g, userName);
    } else {
      // Fallback if no users are available
      finalTitle = randomTitleTemplate.replace(/{name}/g, 'Chico');
    }
    
    setTitle(finalTitle);
    setEmoji(randomEmoji);
    setAnswer(randomAnswer);
    setAnswerEmoji(randomAnswerEmoji);
    setIsTyping(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Generate conversation when users are loaded (or loading is complete)
    if (usersLoaded) {
      generateNewConversation();
    }
  }, [usersLoaded]);

  useEffect(() => {
    const interval = setInterval(() => {
      generateNewConversation();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [isExpanded, usersLoaded]);

  const minSwipeDistance = 50;

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const renderTitle = (text) => {
    // Split text by **bold** markers and render accordingly
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, index) => {
      // Odd indices are the bold parts
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

  return (
    <AppBar position="sticky" sx={{ 
      backgroundColor: isExpanded ? 'white' : '#1976d2', 
      color: isExpanded ? 'black' : 'white' 
    }}>
      <Toolbar sx={{ justifyContent: 'center', py: isExpanded ? 2 : 1, minHeight: isExpanded ? 'auto' : '48px' }}>
        <Box sx={{ maxWidth: '600px', width: '100%', position: 'relative' }}>
          {/* Collapsed State - Simple Title */}
          {!isExpanded && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                Expense Tracker
              </Typography>
            </Box>
          )}
          
          {/* Collapsible Content */}
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
                  backgroundColor: '#1976d2',
                  color: 'white',
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
                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
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

        </Box>
      </Toolbar>
      
      {/* Hide/Show Conversation Button - Below header border */}
      <Box sx={{ 
        position: 'absolute',
        top: 'calc(100% + 4px)',
        left: '12px',
        zIndex: 100,
        backgroundColor: 'rgba(248, 248, 248, 0.8)',
        backdropFilter: 'blur(6px)',
        borderRadius: '6px',
        padding: '1px 6px',
        border: '1px solid rgba(0, 0, 0, 0.03)',
        transition: 'all 0.2s ease'
      }}>
        <Typography
          onClick={toggleExpanded}
          variant="caption"
          sx={{ 
            color: 'rgba(0, 0, 0, 0.5)',
            fontSize: '0.6rem',
            cursor: 'pointer',
            fontWeight: 400,
            transition: 'color 0.2s ease',
            '&:hover': {
              color: 'rgba(0, 0, 0, 0.7)',
            }
          }}
        >
          {isExpanded ? '🤫 Chismis-free' : '👂 Maki chismis'}
        </Typography>
      </Box>
    </AppBar>
  );
}

export default Header;
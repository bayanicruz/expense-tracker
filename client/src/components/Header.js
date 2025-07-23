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
import featureToggles from '../config/featureToggles.json';

function Header() {
  const enableGossip = featureToggles.enableGossip !== false;
  const enableReminders = featureToggles.enableReminders === true;
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('😏');
  const [answer, setAnswer] = useState('');
  const [answerEmoji, setAnswerEmoji] = useState('💅');
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isTyping, setIsTyping] = useState(true); // Start with typing animation
  const [reminder, setReminder] = useState('');

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

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_URL}/api/events`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
        setEventsLoaded(true);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setEventsLoaded(true); // Still mark as loaded even if failed
    }
  };

  const generateNewConversation = async () => {
    // Show loading state if data hasn't loaded yet
    if (!usersLoaded || !eventsLoaded) {
      setIsTyping(true);
      setEmoji('😏');
      setAnswerEmoji('💅');
      return;
    }

    // Show typing animation
    setIsTyping(true);
    
    // Wait for 2 seconds to show typing animation
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Randomly choose between user gossip and event gossip (50/50 chance)
    const useUserGossip = Math.random() < 0.5;
    
    let randomTitleTemplate, randomAnswer;
    
    if (useUserGossip && users.length > 0) {
      // Use user gossip
      randomTitleTemplate = gossipConfig.userGossip[Math.floor(Math.random() * gossipConfig.userGossip.length)];
      randomAnswer = gossipConfig.userAnswers[Math.floor(Math.random() * gossipConfig.userAnswers.length)];
      
      // Replace {name} placeholder with random user name
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const userName = randomUser.name || randomUser.username || `User ${randomUser._id}`;
      randomTitleTemplate = randomTitleTemplate.replace(/{name}/g, userName);
    } else if (events.length > 0) {
      // Use event gossip
      randomTitleTemplate = gossipConfig.eventGossip[Math.floor(Math.random() * gossipConfig.eventGossip.length)];
      randomAnswer = gossipConfig.eventAnswers[Math.floor(Math.random() * gossipConfig.eventAnswers.length)];
      
      // Replace {event} placeholder with random event name
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      const eventName = randomEvent.title || randomEvent.name || `Event ${randomEvent._id}`;
      randomTitleTemplate = randomTitleTemplate.replace(/{event}/g, eventName);
    } else {
      // Fallback to user gossip with default name if no data available
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
  };

  const generateNewReminder = async () => {
    if (!eventsLoaded || !events.length) {
      setReminder('');
      return;
    }
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    // Filter for events with remainingBalance > 0 (pending)
    const pendingEvents = events.filter(e => (e.remainingBalance || 0) > 0);
    const event = (pendingEvents.length > 0 ? pendingEvents : events)[Math.floor(Math.random() * (pendingEvents.length > 0 ? pendingEvents.length : events.length))];
    const eventName = event.title || event.name || `Event ${event._id}`;
    const amount = event.remainingBalance || event.totalAmount || 0;
    // Find owner name
    let ownerName = 'Unknown';
    if (event.owner) {
      if (typeof event.owner === 'object') {
        ownerName = event.owner.name || event.owner.username || 'Unknown';
      } else {
        const ownerObj = users.find(u => u._id === event.owner);
        if (ownerObj) ownerName = ownerObj.name || ownerObj.username || 'Unknown';
      }
    }
    // Find a random participant who is not the owner
    let participantName = null;
    let participantObj = null;
    if (event.participants && event.participants.length > 0) {
      // Try to get participant user objects or IDs
      const participantIds = event.participants.map(p => (typeof p === 'object' ? (p.user ? p.user._id : p._id) : p));
      // Exclude owner
      const filtered = participantIds.filter(pid => pid !== (typeof event.owner === 'object' ? event.owner._id : event.owner));
      if (filtered.length > 0) {
        const randomPid = filtered[Math.floor(Math.random() * filtered.length)];
        participantObj = users.find(u => u._id === randomPid);
        if (participantObj) participantName = participantObj.name || participantObj.username || null;
      }
    }
    if (!participantName) participantName = 'Someone';

    // Find a random participant for payment status reminders
    let paymentParticipant = null;
    let paymentParticipantName = null;
    let paymentAmountPaid = 0;
    let paymentShare = 0;
    let paymentStatus = null;
    if (event.participants && event.participants.length > 0) {
      // Try to find a participant with payment info (object with amountPaid and user)
      const candidates = event.participants.filter(p => typeof p === 'object' && p.user && typeof p.amountPaid !== 'undefined');
      if (candidates.length > 0) {
        const randomP = candidates[Math.floor(Math.random() * candidates.length)];
        paymentParticipant = users.find(u => u._id === (randomP.user._id || randomP.user));
        paymentParticipantName = paymentParticipant ? (paymentParticipant.name || paymentParticipant.username || 'Someone') : 'Someone';
        paymentAmountPaid = randomP.amountPaid || 0;
        // Estimate share
        const total = event.totalAmount || 0;
        const numParts = event.participants.length;
        paymentShare = numParts > 0 ? total / numParts : 0;
        // Determine payment status
        if (paymentAmountPaid === 0) paymentStatus = 'unpaid';
        else if (paymentAmountPaid > paymentShare) paymentStatus = 'overpaid';
        else if (paymentAmountPaid >= paymentShare) paymentStatus = 'paid';
        else paymentStatus = 'partial';
      }
    }

    // Pick a reminder type: 0 = owes, 1 = total cost, 2 = remaining, 3 = settled, 4 = paid, 5 = overpaid, 6 = partial
    const reminderType = Math.floor(Math.random() * 7);
    if (reminderType === 0) {
      setReminder(`💸 **${participantName}** still owes **${ownerName}** **$${amount.toLocaleString()}** for **${eventName}**.`);
    } else if (reminderType === 1) {
      const total = event.totalAmount || 0;
      setReminder(`💡 **${eventName}** cost a total of **$${total.toLocaleString()}**.`);
    } else if (reminderType === 2) {
      setReminder(`🧾 **$${amount.toLocaleString()}** left to settle for **${eventName}**.`);
    } else if (reminderType === 3) {
      if ((event.remainingBalance || 0) === 0 && (event.totalAmount || 0) > 0) {
        setReminder(`🎉 **${eventName}** is fully settled! Great job, everyone!`);
      } else {
        setReminder(`⏳ **${eventName}** isn't settled yet. Keep going!`);
      }
    } else if (reminderType === 4 && paymentStatus === 'paid') {
      setReminder(`✅ **${paymentParticipantName}** paid their share for **${eventName}**.`);
    } else if (reminderType === 5 && paymentStatus === 'overpaid') {
      setReminder(`💰 **${paymentParticipantName}** overpaid for **${eventName}**! Generous!`);
    } else if (reminderType === 6 && paymentStatus === 'partial') {
      setReminder(`🕗 **${paymentParticipantName}** has partially paid for **${eventName}**.`);
    } else {
      setReminder(`💸 **${participantName}** still owes **${ownerName}** **$${amount.toLocaleString()}** for **${eventName}**.`);
    }
    setIsTyping(false);
  };

  useEffect(() => {
    fetchUsers();
    fetchEvents();
  }, []);

  useEffect(() => {
    // Generate conversation when both users and events are loaded (or loading is complete)
    if (usersLoaded && eventsLoaded) {
      if (enableGossip) {
        generateNewConversation();
      } else if (enableReminders) {
        generateNewReminder();
      }
    }
  }, [usersLoaded, eventsLoaded, enableGossip, enableReminders]);

  useEffect(() => {
    if (enableGossip) {
      const interval = setInterval(() => {
        generateNewConversation();
      }, 10000);

      return () => {
        clearInterval(interval);
      };
    } else if (enableReminders) {
      const interval = setInterval(() => {
        generateNewReminder();
      }, 10000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [isExpanded, usersLoaded, eventsLoaded, enableGossip, enableReminders]);

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

  // Helper to render reminder with bold parts
  const renderReminder = (reminder) => {
    // Use a simple token system for bolding: wrap bold parts in **double asterisks**
    const parts = reminder.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1
        ? <Box key={i} component="span" sx={{ fontWeight: 'bold', display: 'inline' }}>{part}</Box>
        : part
    );
  };

  return (
    <AppBar position="sticky" sx={{ 
      backgroundColor: (!enableGossip && !enableReminders) || !isExpanded ? '#1976d2' : 'white', 
      color: (!enableGossip && !enableReminders) || !isExpanded ? 'white' : 'black' 
    }}>
      <Toolbar sx={{ justifyContent: 'center', py: (!enableGossip && !enableReminders) || !isExpanded ? 1 : 2, minHeight: (!enableGossip && !enableReminders) || !isExpanded ? '48px' : 'auto' }}>
        <Box sx={{ maxWidth: '600px', width: '100%', position: 'relative' }}>
          {/* Collapsed State - Enhanced Title */}
          {((!enableGossip && !enableReminders) || !isExpanded) && (
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
          
          {/* Collapsible Content */}
          {enableGossip && (
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
          )}
          {enableReminders && !enableGossip && (
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
              onClick={generateNewReminder}
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
                    transition: 'background 0.2s',
                    border: '1px solid #ffe082',
                  }}>
                    {isTyping ? (
                      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', py: 0.5 }}>
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            border: '3px solid #ffe082',
                            borderTop: '3px solid #ffd54f',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            '@keyframes spin': {
                              '0%': { transform: 'rotate(0deg)' },
                              '100%': { transform: 'rotate(360deg)' }
                            }
                          }}
                        />
                      </Box>
                    ) : (
                      <Typography 
                        variant="body2" 
                        sx={{ fontSize: '0.97rem', fontWeight: 500, lineHeight: 1.25, width: '100%' }}
                      >
                        {renderReminder(reminder)}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </Collapse>
          )}
        </Box>
      </Toolbar>
      
      {/* Hide/Show Conversation Button - Below header border */}
      {(enableGossip || enableReminders) && (
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
            {isExpanded ? '🚫 Hide Reminders' : '📌 Show Reminders'}
          </Typography>
        </Box>
      )}
    </AppBar>
  );
}

export default Header;
import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import titlesConfig from '../config/titles.json';

function Header() {
  const [title, setTitle] = useState('...');
  const [emoji, setEmoji] = useState('😏');
  const [answer, setAnswer] = useState('...');
  const [answerEmoji, setAnswerEmoji] = useState('💅');
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersLoaded, setUsersLoaded] = useState(false);

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

  const generateNewConversation = () => {
    // Show loading state if users haven't loaded yet
    if (!usersLoaded) {
      setTitle('...');
      setEmoji('😏');
      setAnswer('...');
      setAnswerEmoji('💅');
      return;
    }

    const randomTitleTemplate = titlesConfig.titles[Math.floor(Math.random() * titlesConfig.titles.length)];
    const randomEmoji = titlesConfig.snarkyEmojis[Math.floor(Math.random() * titlesConfig.snarkyEmojis.length)];
    const randomAnswer = titlesConfig.answers[Math.floor(Math.random() * titlesConfig.answers.length)];
    const randomAnswerEmoji = titlesConfig.answerEmojis[Math.floor(Math.random() * titlesConfig.answerEmojis.length)];
    
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

  const minSwipeDistance = 50;

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
    <AppBar position="sticky">
      <Toolbar sx={{ justifyContent: 'center', py: 2 }}>
        <Box 
          sx={{
            maxWidth: '600px',
            width: '100%',
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
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
              }}
            >
              {emoji}:
            </Typography>
            <Box sx={{
              backgroundColor: 'white',
              color: 'black',
              borderRadius: '20px',
              padding: '8px 16px',
              maxWidth: '400px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
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
            </Box>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end',
            alignItems: 'center', 
            gap: 1
          }}>
            <Box sx={{
              backgroundColor: 'white',
              color: 'black',
              borderRadius: '20px',
              padding: '6px 12px',
              maxWidth: '200px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
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
            </Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontSize: '1rem',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
              }}
            >
              :{answerEmoji}
            </Typography>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
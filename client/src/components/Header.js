import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import titlesConfig from '../config/titles.json';

function Header() {
  const [title, setTitle] = useState('Expense Tracker');
  const [emoji, setEmoji] = useState('😏');
  const [answer, setAnswer] = useState('Flex lang.');
  const [answerEmoji, setAnswerEmoji] = useState('💅');

  useEffect(() => {
    const randomTitle = titlesConfig.titles[Math.floor(Math.random() * titlesConfig.titles.length)];
    const randomEmoji = titlesConfig.snarkyEmojis[Math.floor(Math.random() * titlesConfig.snarkyEmojis.length)];
    const randomAnswer = titlesConfig.answers[Math.floor(Math.random() * titlesConfig.answers.length)];
    const randomAnswerEmoji = titlesConfig.answerEmojis[Math.floor(Math.random() * titlesConfig.answerEmojis.length)];
    setTitle(randomTitle);
    setEmoji(randomEmoji);
    setAnswer(randomAnswer);
    setAnswerEmoji(randomAnswerEmoji);
  }, []);

  return (
    <AppBar position="static">
      <Toolbar sx={{ flexDirection: 'column', alignItems: 'stretch', py: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          flexGrow: 1,
          gap: 1,
          mb: 1
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
              {title}
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
      </Toolbar>
    </AppBar>
  );
}

export default Header;
import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import titlesConfig from '../config/titles.json';

function Header() {
  const [title, setTitle] = useState('Expense Tracker');

  useEffect(() => {
    const randomTitle = titlesConfig.titles[Math.floor(Math.random() * titlesConfig.titles.length)];
    setTitle(randomTitle);
  }, []);

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
import React, { useState } from 'react';
import {
  TextField,
  InputAdornment,
  Box,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchBar = ({ onSearch }) => {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

  const handleChange = (event) => {
    const inputValue = event.target.value;
    setValue(inputValue);
    setLoading(true);

    if (typingTimeout) clearTimeout(typingTimeout);

    const timeout = setTimeout(() => {
      setLoading(false);
      if (onSearch) onSearch(inputValue);
    }, 500);

    setTypingTimeout(timeout);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
      <TextField
        size="small"
        variant="outlined"
        placeholder="Search..."
        value={value}
        onChange={handleChange}
        sx={{
          width: '100%',
          maxWidth: 400,
          '& .MuiOutlinedInput-root': {
            borderRadius: '25px',
            paddingRight: '8px',
            height: 38,
            fontSize: 14,
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              {loading ? (
                <CircularProgress size={18} />
              ) : (
                <SearchIcon fontSize="small" />
              )}
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};

export default SearchBar;

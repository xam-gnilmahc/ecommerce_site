import React, { useState } from 'react';
import { TextField, InputAdornment, Box, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchBar = ({ onSearch }) => {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  // فقط typing update local state
  const handleChange = (event) => {
    setValue(event.target.value);
  };

  // ONLY ENTER triggers search
  const handleKeyDown = async (event) => {
    if (event.key === 'Enter') {
      setLoading(true);

      await onSearch(value); // trigger redux search ONLY here

      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
      <TextField
        size="small"
        variant="outlined"
        placeholder="Search..."
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
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
              {loading ? <CircularProgress size={18} /> : <SearchIcon fontSize="small" />}
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};

export default SearchBar;

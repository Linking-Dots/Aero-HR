import React, { useState, useEffect } from 'react';
import { Box, IconButton, Typography, useTheme, useMediaQuery } from '@mui/material';
import { Inbox, Send, Drafts, Delete, Star, StarBorder, Search, Refresh } from '@mui/icons-material';
import GlassCard from '../../Components/GlassCard';
import GlassDialog from '../../Components/GlassDialog';
import { useEmail } from '../../contexts/EmailContext';
import EmailList from './EmailList';
import EmailViewer from './EmailViewer';
import EmailComposer from './EmailComposer';
import ProviderConnect from './ProviderConnect';

const EmailApp = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const {
    provider,
    activeFolder,
    setActiveFolder,
    emails,
    isLoading,
    activeEmail,
    setActiveEmail,
    isComposing,
    setIsComposing,
    searchQuery,
    setSearchQuery,
    markAsRead,
  } = useEmail();

  const [localSearch, setLocalSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery]);

  const handleEmailClick = (email) => {
    setActiveEmail(email);
    if (!email.read) {
      markAsRead.mutate(email.id);
    }
  };

  const folders = [
    { id: 'inbox', label: 'Inbox', icon: <Inbox /> },
    { id: 'sent', label: 'Sent', icon: <Send /> },
    { id: 'drafts', label: 'Drafts', icon: <Drafts /> },
    { id: 'trash', label: 'Trash', icon: <Delete /> },
  ];

  if (!provider) {
    return <ProviderConnect />;
  }

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      {/* Sidebar */}
      <GlassCard
        sx={{
          width: isMobile ? '70px' : '250px',
          minWidth: isMobile ? '70px' : '250px',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '16px 0 0 16px',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Typography variant="h6" noWrap sx={{ textAlign: 'center' }}>
            {isMobile ? 'M' : 'Mail'}
          </Typography>
        </Box>
        
        <Box sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
          {folders.map((folder) => (
            <Box
              key={folder.id}
              onClick={() => setActiveFolder(folder.id)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 1.5,
                mb: 1,
                borderRadius: '8px',
                cursor: 'pointer',
                bgcolor: activeFolder === folder.id ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              <IconButton size="small" sx={{ mr: isMobile ? 0 : 1, color: 'inherit' }}>
                {folder.icon}
              </IconButton>
              {!isMobile && (
                <Typography variant="body2" noWrap>
                  {folder.label}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      </GlassCard>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Search Bar */}
        <GlassCard
          sx={{
            p: 1.5,
            m: 2,
            mb: 1,
            display: 'flex',
            alignItems: 'center',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'all 0.2s ease',
            ...(isSearchFocused && {
              boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
            }),
          }}
        >
          <Search sx={{ color: 'text.secondary', mr: 1 }} />
          <input
            type="text"
            placeholder="Search emails..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: theme.palette.text.primary,
              fontSize: '0.875rem',
              outline: 'none',
              '&::placeholder': {
                color: theme.palette.text.secondary,
              },
            }}
          />
          <IconButton size="small" onClick={() => setLocalSearch('')}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {localSearch ? 'Clear' : ''}
            </Typography>
          </IconButton>
        </GlassCard>

        {/* Email List and Viewer */}
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <EmailList 
            emails={emails} 
            isLoading={isLoading} 
            onEmailClick={handleEmailClick} 
            selectedEmail={activeEmail}
          />
          
          {activeEmail ? (
            <EmailViewer email={activeEmail} onClose={() => setActiveEmail(null)} />
          ) : (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">
                Select an email to read
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Compose Dialog */}
      <GlassDialog
        open={isComposing}
        closeModal={() => setIsComposing(false)}
        maxWidth="md"
        fullWidth
      >
        <EmailComposer onClose={() => setIsComposing(false)} />
      </GlassDialog>
    </Box>
  );
};

export default EmailApp;

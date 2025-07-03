import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, Paper, Typography, TextField, Button, Badge, Menu, MenuItem } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const ChatWidget = ({ lobiId }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [unread, setUnread] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const messagesEndRef = useRef(null);

  // Lobi ID'sine göre localStorage key'i oluştur
  const getStorageKey = () => `chat_${lobiId}`;

  // Chat geçmişini localStorage'dan yükle
  useEffect(() => {
    if (lobiId) {
      try {
        const savedMessages = localStorage.getItem(getStorageKey());
        if (savedMessages) {
          const parsedMessages = JSON.parse(savedMessages);
          // Tarihleri Date objesine çevir
          const messagesWithDates = parsedMessages.map(msg => ({
            ...msg,
            time: new Date(msg.time)
          }));
          setMessages(messagesWithDates);
        }
      } catch (error) {
        console.error('Chat geçmişi yüklenirken hata:', error);
      }
    }
  }, [lobiId]);

  // Mesajları localStorage'a kaydet
  const saveMessagesToStorage = (newMessages) => {
    if (lobiId) {
      try {
        localStorage.setItem(getStorageKey(), JSON.stringify(newMessages));
      } catch (error) {
        console.error('Chat geçmişi kaydedilirken hata:', error);
      }
    }
  };

  // Chat geçmişini temizle
  const clearChat = () => {
    setMessages([]);
    if (lobiId) {
      localStorage.removeItem(getStorageKey());
    }
    setAnchorEl(null);
  };

  // Menu işlemleri
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setUnread(0);
    }
  }, [messages, open]);

  const handleSend = () => {
    if (input.trim() === '') return;
    const newMessage = { text: input, from: 'user', time: new Date() };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    saveMessagesToStorage(newMessages);
    setInput('');
    if (!open) setUnread(unread + 1);
  };

  return (
    <Box sx={{
      position: 'fixed',
      bottom: 32,
      right: 32,
      zIndex: 12000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
    }}>
      {open && (
        <Paper elevation={8} sx={{
          width: 340,
          height: 440,
          mb: 1,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'rgba(40, 18, 60, 0.98)',
          borderRadius: 3,
          boxShadow: '0 8px 32px 0 rgba(123,31,162,0.25)',
          border: '2px solid #7B1FA2',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1.5,
            bgcolor: 'rgba(123,31,162,0.95)',
            color: 'white',
            borderBottom: '1px solid #fff2',
          }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: 18 }}>
              Sohbet
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton 
                size="small" 
                onClick={handleMenuOpen}
                sx={{ color: 'white' }}
              >
                <MoreVertIcon />
              </IconButton>
              <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: 'white' }}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
          {/* Messages */}
          <Box sx={{
            flex: 1,
            overflowY: 'auto',
            px: 2,
            py: 2,
            bgcolor: 'rgba(60, 30, 80, 0.85)',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}>
            {messages.length === 0 && (
              <Typography variant="body2" sx={{ color: '#bbb', textAlign: 'center', mt: 8 }}>
                Henüz mesaj yok. İlk mesajı yazın!
              </Typography>
            )}
            {messages.map((msg, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start',
                  flexDirection: 'column',
                  alignItems: msg.from === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <Box
                  sx={{
                    bgcolor: msg.from === 'user' ? 'linear-gradient(90deg, #7B1FA2 60%, #764ba2 100%)' : 'rgba(255,255,255,0.08)',
                    color: msg.from === 'user' ? 'white' : '#e1bee7',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    maxWidth: '80%',
                    fontSize: 15,
                    boxShadow: msg.from === 'user' ? '0 2px 8px #7B1FA244' : 'none',
                    border: msg.from === 'user' ? '1px solid #7B1FA2' : '1px solid #fff1',
                    mb: 0.5,
                  }}
                >
                  {msg.text}
                </Box>
                <Typography variant="caption" sx={{ 
                  color: '#aaa', 
                  fontSize: '0.7rem',
                  opacity: 0.7,
                  ml: msg.from === 'user' ? 0 : 1,
                  mr: msg.from === 'user' ? 1 : 0,
                }}>
                  {msg.time.toLocaleTimeString('tr-TR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Typography>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>
          {/* Input */}
          <Box sx={{
            display: 'flex',
            gap: 1,
            p: 2,
            bgcolor: 'rgba(40, 18, 60, 0.98)',
            borderTop: '1px solid #fff2',
          }}>
            <TextField
              size="small"
              fullWidth
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
              placeholder="Mesaj yaz..."
              variant="outlined"
              sx={{
                bgcolor: 'rgba(255,255,255,0.08)',
                input: { color: 'white' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#7B1FA2' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#fff' },
              }}
            />
            <Button
              variant="contained"
              onClick={handleSend}
              sx={{
                bgcolor: '#7B1FA2',
                color: 'white',
                fontWeight: 'bold',
                px: 2.5,
                boxShadow: '0 2px 8px #7B1FA244',
                '&:hover': { bgcolor: '#6a1b9a' },
              }}
            >
              Gönder
            </Button>
          </Box>
        </Paper>
      )}
      
      {/* Chat Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        sx={{ zIndex: 13000 }}
        PaperProps={{
          sx: {
            bgcolor: 'rgba(40, 18, 60, 0.98)',
            color: 'white',
            border: '1px solid #7B1FA2',
            boxShadow: '0 8px 32px rgba(123,31,162,0.3)',
          }
        }}
      >
        <MenuItem 
          onClick={clearChat}
          sx={{ 
            color: '#ff6b6b',
            '&:hover': { bgcolor: 'rgba(255,107,107,0.1)' }
          }}
        >
          🗑️ Sohbeti Temizle
        </MenuItem>
      </Menu>
      
      <Badge
        color="secondary"
        badgeContent={unread > 0 ? unread : null}
        overlap="circular"
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <IconButton
          color="primary"
          size="large"
          sx={{
            bgcolor: open ? '#7B1FA2' : 'white',
            color: open ? 'white' : '#7B1FA2',
            boxShadow: 4,
            border: '2px solid #7B1FA2',
            '&:hover': { bgcolor: '#f3e5f5' },
            transition: 'all 0.2s',
          }}
          onClick={() => setOpen(!open)}
        >
          <ChatIcon />
        </IconButton>
      </Badge>
    </Box>
  );
};

export default ChatWidget; 
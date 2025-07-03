import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  InputAdornment,
  IconButton,
  useTheme,
  keyframes,
  styled,
  Switch,
  FormControlLabel,
  Dialog,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Visibility, VisibilityOff, PersonAdd as RegisterIcon, DarkMode, LightMode, CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SHA256 from 'crypto-js/sha256';

// Animasyonlar
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`;

const bounce = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// Styled components
const AnimatedBox = styled(Box)(({ theme }) => ({
  animation: `${float} 6s ease-in-out infinite`,
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
  animation: `${bounce} 2s ease-in-out infinite`,
  '&:hover': {
    animation: 'none',
    transform: 'scale(1.1)',
  },
}));

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !username) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }

    try {
      const hashedPassword = SHA256(password).toString();
      const response = await axios.post('http://localhost:4000/api/auth/register', {
        email,
        password: hashedPassword,
        username
      });

      setShowSuccessDialog(true);
    } catch (error) {
      setError(error.response?.data?.message || "Kayıt işlemi başarısız");
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessDialog(false);
    navigate('/');
  };

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url(/login.gif)',
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        padding: 2,
        position: 'fixed',
        top: 0,
        left: 0,
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.3)',
          zIndex: 1,
        }
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 2 }}>
        <Paper
          elevation={24}
          sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: isDarkMode ? 'rgba(0, 0, 0, 0.75)' : 'rgba(255, 255, 255, 0.75)',
            borderRadius: 4,
            backdropFilter: 'blur(6px)',
            border: `2px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(128, 0, 128, 0.15)'}`,
            boxShadow: isDarkMode 
              ? '0 8px 32px rgba(0, 0, 0, 0.3)'
              : '0 8px 32px rgba(128, 0, 128, 0.1)',
            maxWidth: '400px',
            minHeight: '420px',
            margin: '0 auto',
            color: isDarkMode ? '#fff' : '#000',
            position: 'relative',
            justifyContent: 'space-between',
            py: 4
          }}
        >
          <Box sx={{ 
            position: 'absolute',
            top: 16,
            right: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            padding: '4px 8px',
            borderRadius: '20px',
            background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(128, 0, 128, 0.1)',
            backdropFilter: 'blur(4px)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(128, 0, 128, 0.1)'}`
          }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isDarkMode}
                  onChange={(e) => setIsDarkMode(e.target.checked)}
                  icon={<LightMode sx={{ color: '#fff' }} />}
                  checkedIcon={<DarkMode />}
                  size="small"
                />
              }
              label={isDarkMode ? <DarkMode /> : <LightMode />}
              sx={{ 
                color: isDarkMode ? '#fff' : '#000',
                margin: 0,
                '& .MuiFormControlLabel-label': {
                  marginLeft: 0
                }
              }}
            />
          </Box>

          <Box
            component="img"
            src="/logoo.png"
            alt="Logo"
            sx={{
              width: 240,
              height: 'auto',
              mb: 3,
              mt: 4,
              filter: isDarkMode 
                ? 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.2))'
                : 'drop-shadow(0 0 8px rgba(128, 0, 128, 0.2))',
              borderRadius: '12px',
              objectFit: 'contain',
            }}
          />

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', mt: 2 }}>
            <TextField
              fullWidth
              label="Kullanıcı Adı"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              size="small"
              autoComplete="off"
              sx={{
                mb: 1.5,
                '& .MuiOutlinedInput-root': {
                  color: isDarkMode ? '#fff' : '#000',
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.5)',
                  '& fieldset': {
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(128, 0, 128, 0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: isDarkMode ? '#9370DB' : '#800080',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: isDarkMode ? '#4B0082' : '#4B0082',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                },
              }}
            />

            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              size="small"
              autoComplete="off"
              sx={{
                mb: 1.5,
                '& .MuiOutlinedInput-root': {
                  color: isDarkMode ? '#fff' : '#000',
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.5)',
                  '& fieldset': {
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(128, 0, 128, 0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: isDarkMode ? '#9370DB' : '#800080',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: isDarkMode ? '#4B0082' : '#4B0082',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                },
              }}
            />

            <TextField
              fullWidth
              label="Şifre"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              size="small"
              autoComplete="new-password"
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  color: isDarkMode ? '#fff' : '#000',
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.5)',
                  '& fieldset': {
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(128, 0, 128, 0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: isDarkMode ? '#9370DB' : '#800080',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: isDarkMode ? '#4B0082' : '#4B0082',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                      sx={{ color: isDarkMode ? '#9370DB' : '#4B0082' }}
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {error && (
              <Typography
                color="error"
                sx={{
                  mb: 1.5,
                  textAlign: 'center',
                  animation: `${bounce} 0.5s ease-in-out`,
                  color: isDarkMode ? '#FF6B6B' : '#4B0082',
                  fontSize: '0.9rem',
                }}
              >
                {error}
              </Typography>
            )}

            <AnimatedButton
              fullWidth
              variant="contained"
              type="submit"
              size="medium"
              startIcon={<RegisterIcon />}
              sx={{
                mb: 1.5,
                background: isDarkMode
                  ? 'linear-gradient(45deg, #9370DB 30%, #4B0082 90%)'
                  : 'linear-gradient(45deg, #800080 30%, #4B0082 90%)',
                color: 'white',
                fontWeight: 'bold',
                py: 1,
                boxShadow: isDarkMode
                  ? '0 3px 5px 2px rgba(147, 112, 219, .3)'
                  : '0 3px 5px 2px rgba(128, 0, 128, .3)',
                '&:hover': {
                  background: isDarkMode
                    ? 'linear-gradient(45deg, #4B0082 30%, #9370DB 90%)'
                    : 'linear-gradient(45deg, #4B0082 30%, #800080 90%)',
                },
              }}
            >
              Kayıt Ol
            </AnimatedButton>

            <Button
              fullWidth
              variant="text"
              onClick={() => navigate('/')}
              size="small"
              sx={{
                color: isDarkMode ? '#9370DB' : '#800080',
                '&:hover': {
                  background: isDarkMode
                    ? 'rgba(147, 112, 219, 0.1)'
                    : 'rgba(128, 0, 128, 0.1)',
                  color: isDarkMode ? '#4B0082' : '#4B0082',
                },
              }}
            >
              Zaten hesabınız var mı? Giriş yapın
            </Button>
          </Box>
        </Paper>
      </Container>

      {/* Başarılı Kayıt Dialog */}
      <Dialog
        open={showSuccessDialog}
        onClose={handleSuccessClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            background: isDarkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(8px)',
            borderRadius: 2,
            border: `1px solid ${isDarkMode ? 'rgba(147, 112, 219, 0.2)' : 'rgba(128, 0, 128, 0.15)'}`,
            boxShadow: isDarkMode 
              ? '0 12px 24px rgba(0, 0, 0, 0.4)'
              : '0 12px 24px rgba(128, 0, 128, 0.15)',
            overflow: 'hidden',
            position: 'relative',
            maxWidth: '320px',
            margin: '0 auto',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: isDarkMode
                ? 'linear-gradient(90deg, #9370DB, #4B0082, #9370DB)'
                : 'linear-gradient(90deg, #800080, #4B0082, #800080)',
              backgroundSize: '200% 100%',
              animation: `${keyframes`
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
              `} 3s linear infinite`,
            }
          }
        }}
      >
        <DialogContent sx={{ p: 2, textAlign: 'center' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1.5
            }}
          >
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                background: isDarkMode
                  ? 'linear-gradient(135deg, #9370DB, #4B0082)'
                  : 'linear-gradient(135deg, #800080, #4B0082)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isDarkMode
                  ? '0 4px 12px rgba(147, 112, 219, 0.3)'
                  : '0 4px 12px rgba(128, 0, 128, 0.3)',
                animation: `${bounce} 0.8s ease-in-out`,
                mb: 1
              }}
            >
              <CheckCircle sx={{ fontSize: 24, color: 'white' }} />
            </Box>
            
            <Typography
              variant="h6"
              component="h2"
              sx={{
                fontWeight: 'bold',
                color: isDarkMode ? '#fff' : '#000',
                mb: 1,
                background: isDarkMode
                  ? 'linear-gradient(45deg, #9370DB, #4B0082)'
                  : 'linear-gradient(45deg, #800080, #4B0082)',
                backgroundClip: 'text',
                textFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '1.1rem'
              }}
            >
              Hoş Geldiniz!
            </Typography>
            
            <Typography
              variant="body2"
              sx={{
                color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                fontSize: '0.85rem',
                lineHeight: 1.4,
                maxWidth: '240px'
              }}
            >
              Hesabınız başarıyla oluşturuldu. Giriş sayfasına yönlendiriliyorsunuz...
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 1.5, pt: 0, justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={handleSuccessClose}
            sx={{
              background: isDarkMode
                ? 'linear-gradient(45deg, #9370DB, #4B0082)'
                : 'linear-gradient(45deg, #800080, #4B0082)',
              color: 'white',
              fontWeight: 'bold',
              px: 2.5,
              py: 0.8,
              borderRadius: 1.5,
              textTransform: 'none',
              fontSize: '0.9rem',
              boxShadow: isDarkMode
                ? '0 2px 8px rgba(147, 112, 219, 0.3)'
                : '0 2px 8px rgba(128, 0, 128, 0.3)',
              '&:hover': {
                background: isDarkMode
                  ? 'linear-gradient(45deg, #4B0082, #9370DB)'
                  : 'linear-gradient(45deg, #4B0082, #800080)',
                transform: 'translateY(-1px)',
                boxShadow: isDarkMode
                  ? '0 4px 12px rgba(147, 112, 219, 0.4)'
                  : '0 4px 12px rgba(128, 0, 128, 0.4)',
              },
              transition: 'all 0.2s ease'
            }}
          >
            Giriş Sayfasına Git
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RegisterPage;

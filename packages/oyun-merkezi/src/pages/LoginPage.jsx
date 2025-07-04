import React, { useState, useEffect } from 'react';
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
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon, DarkMode, LightMode } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState({ type: '', message: '' });
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: email, 2: new password
  const navigate = useNavigate();
  const { login } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    // Local storage'dan kayıtlı bilgileri al
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword');
    const remembered = localStorage.getItem('rememberMe') === 'true';

    if (remembered && savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Lütfen email ve şifrenizi girin');
      return;
    }

    try {
      console.log('Giriş denemesi başlıyor:', { email, password });
      const hashedPassword = SHA256(password).toString();
      console.log('Hash\'lenmiş şifre:', hashedPassword);
      
      const success = await login(email, hashedPassword);
      console.log('Login sonucu:', success);

      if (success) {
        console.log('Giriş başarılı, dashboard\'a yönlendiriliyor');
        // Beni hatırla seçeneği işaretliyse bilgileri kaydet
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
          localStorage.setItem('rememberedPassword', password);
          localStorage.setItem('rememberMe', 'true');
        } else {
          // Seçili değilse kayıtlı bilgileri temizle
          localStorage.removeItem('rememberedEmail');
          localStorage.removeItem('rememberedPassword');
          localStorage.removeItem('rememberMe');
        }
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login hatası detayları:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data
      });
      
      if (error.response?.data?.details) {
        setError(error.response.data.details.reason || error.response.data.message);
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError(error.message || "Giriş başarısız");
      }
    }
  };

  const handleForgotPassword = async () => {
    if (resetStep === 1) {
      // İlk aşama: Email kontrolü
      if (!resetEmail) {
        setResetStatus({ type: 'error', message: 'Lütfen email adresinizi girin' });
        return;
      }

      // Email format kontrolü
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(resetEmail)) {
        setResetStatus({ type: 'error', message: 'Lütfen geçerli bir email adresi girin' });
        return;
      }

      try {
        setResetStatus({ type: 'info', message: 'Email kontrol ediliyor...' });
        
        // Email'in var olup olmadığını kontrol et
        const response = await axios.post('http://localhost:4000/api/auth/check-email', {
          email: resetEmail
        });

        // Eğer buraya kadar geldiyse email var demektir
        setResetStep(2);
        setResetStatus({ type: 'success', message: 'Email doğrulandı. Şimdi yeni şifrenizi girin.' });
        
      } catch (error) {
        console.error('Email kontrol hatası:', error);
        
        let errorMessage = 'Email kontrol edilemedi';
        
        if (error.response?.status === 404) {
          errorMessage = 'Bu email adresi ile kayıtlı kullanıcı bulunamadı';
        } else if (error.response?.status === 400) {
          errorMessage = error.response.data.message || 'Geçersiz email adresi';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message === 'Network Error') {
          errorMessage = 'Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.';
        }
        
        setResetStatus({ 
          type: 'error', 
          message: errorMessage
        });
      }
    } else {
      // İkinci aşama: Yeni şifre belirleme
      if (!newPassword || !confirmNewPassword) {
        setResetStatus({ type: 'error', message: 'Lütfen tüm alanları doldurun' });
        return;
      }

      if (newPassword !== confirmNewPassword) {
        setResetStatus({ type: 'error', message: 'Şifreler eşleşmiyor' });
        return;
      }

      try {
        setResetStatus({ type: 'info', message: 'Şifre güncelleniyor...' });
        
        const response = await axios.post('http://localhost:4000/api/auth/forgot-password', {
          email: resetEmail,
          newPassword: newPassword
        });

        if (response.data.success) {
          setResetStatus({ 
            type: 'success', 
            message: 'Şifreniz başarıyla güncellendi! Giriş sayfasına yönlendiriliyorsunuz...'
          });
          
          // 3 saniye sonra login sayfasına yönlendir
          setTimeout(() => {
            setForgotPasswordOpen(false);
            setResetEmail('');
            setNewPassword('');
            setConfirmNewPassword('');
            setResetStatus({ type: '', message: '' });
            setResetStep(1);
            // Login sayfasına yönlendir
            window.location.reload();
          }, 3000);
        }
      } catch (error) {
        console.error('Şifre güncelleme hatası:', error);
        
        let errorMessage = 'Şifre güncellenemedi';
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message === 'Network Error') {
          errorMessage = 'Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.';
        }
        
        setResetStatus({ 
          type: 'error', 
          message: errorMessage
        });
      }
    }
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
              label="E-posta"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              size="small"
              autoComplete="username"
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
              autoComplete="current-password"
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

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2
            }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    sx={{
                      color: isDarkMode ? '#9370DB' : '#800080',
                      '&.Mui-checked': {
                        color: isDarkMode ? '#4B0082' : '#4B0082',
                      },
                    }}
                  />
                }
                label={
                  <Typography sx={{ 
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                    fontSize: '0.9rem'
                  }}>
                    Beni Hatırla
                  </Typography>
                }
              />
              <Button
                onClick={() => setForgotPasswordOpen(true)}
                sx={{
                  color: isDarkMode ? '#9370DB' : '#800080',
                  fontSize: '0.9rem',
                  '&:hover': {
                    background: isDarkMode
                      ? 'rgba(147, 112, 219, 0.1)'
                      : 'rgba(128, 0, 128, 0.1)',
                  },
                }}
              >
                Şifremi Unuttum
              </Button>
            </Box>

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
              startIcon={<LoginIcon />}
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
              Giriş Yap
            </AnimatedButton>

            <Button
              fullWidth
              variant="text"
              onClick={() => navigate('/register')}
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
              Hesabınız yok mu? Kayıt olun
            </Button>
          </Box>
        </Paper>
      </Container>

      {/* Şifremi Unuttum Dialog */}
      <Dialog 
        open={forgotPasswordOpen} 
        onClose={() => {
          setForgotPasswordOpen(false);
          setResetEmail('');
          setNewPassword('');
          setConfirmNewPassword('');
          setResetStatus({ type: '', message: '' });
          setResetStep(1);
        }}
        PaperProps={{
          sx: {
            background: isDarkMode ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(128, 0, 128, 0.1)'}`,
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle sx={{ 
          color: isDarkMode ? '#fff' : '#000',
          borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(128, 0, 128, 0.1)'}`,
        }}>
          Şifremi Unuttum
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography sx={{ mb: 2, color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)' }}>
            {resetStep === 1 
              ? 'Email adresinizi girin. Kayıtlı kullanıcı kontrolü yapılacak.' 
              : 'Yeni şifrenizi girin.'
            }
          </Typography>
          {resetStep === 1 && (
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              size="small"
              sx={{
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
          )}
          {resetStep === 2 && (
            <>
              <TextField
                fullWidth
                label="Yeni Şifre"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                size="small"
                autoComplete="new-password"
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
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        edge="end"
                        size="small"
                        sx={{ color: isDarkMode ? '#9370DB' : '#4B0082' }}
                      >
                        {showNewPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Yeni Şifreyi Tekrar Girin"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                size="small"
                autoComplete="new-password"
                sx={{
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
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        size="small"
                        sx={{ color: isDarkMode ? '#9370DB' : '#4B0082' }}
                      >
                        {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </>
          )}
          {resetStatus.message && (
            <Alert 
              severity={resetStatus.type} 
              sx={{ mt: 2 }}
            >
              {resetStatus.message}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(128, 0, 128, 0.1)'}` }}>
          <Button
            onClick={() => {
              setForgotPasswordOpen(false);
              setResetEmail('');
              setNewPassword('');
              setConfirmNewPassword('');
              setResetStatus({ type: '', message: '' });
              setResetStep(1);
            }}
            disabled={resetStatus.type === 'info'}
            sx={{ color: isDarkMode ? '#9370DB' : '#800080' }}
          >
            İptal
          </Button>
          {resetStep === 2 && (
            <Button
              onClick={() => {
                setResetStep(1);
                setNewPassword('');
                setConfirmNewPassword('');
                setResetStatus({ type: '', message: '' });
              }}
              sx={{ color: isDarkMode ? '#9370DB' : '#800080' }}
            >
              Geri
            </Button>
          )}
          <Button
            onClick={handleForgotPassword}
            variant="contained"
            disabled={
              resetStatus.type === 'info' || 
              (resetStep === 1 && !resetEmail.trim()) ||
              (resetStep === 2 && (!newPassword.trim() || !confirmNewPassword.trim()))
            }
            sx={{
              background: isDarkMode
                ? 'linear-gradient(45deg, #9370DB 30%, #4B0082 90%)'
                : 'linear-gradient(45deg, #800080 30%, #4B0082 90%)',
              color: 'white',
              '&:hover': {
                background: isDarkMode
                  ? 'linear-gradient(45deg, #4B0082 30%, #9370DB 90%)'
                  : 'linear-gradient(45deg, #4B0082 30%, #800080 90%)',
              },
              '&:disabled': {
                background: 'rgba(128, 128, 128, 0.5)',
                color: 'rgba(255, 255, 255, 0.5)',
              },
            }}
          >
            {resetStatus.type === 'info' 
              ? (resetStep === 1 ? 'Kontrol Ediliyor...' : 'Güncelleniyor...') 
              : (resetStep === 1 ? 'Devam Et' : 'Şifreyi Güncelle')
            }
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LoginPage;
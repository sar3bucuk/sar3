import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ColorModeContext } from './contexts/ColorModeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import OyunDetayPage from './pages/OyunDetayPage';
import { AuthProvider } from './contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/" />;
};

// Game redirect component
const GameRedirect = () => {
  const { oyunAdi, lobiId } = useParams();
  
  React.useEffect(() => {
    // Redirect to the games application with lobby ID if available
    const gameUrl = lobiId 
      ? `http://localhost:3001/oyun/${oyunAdi}/${lobiId}`
      : `http://localhost:3001/oyun/${oyunAdi}`;
    window.location.href = gameUrl;
  }, [oyunAdi, lobiId]);
  
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontSize: '18px'
    }}>
      <img 
        src="/logoo.png" 
        alt="sar3 Logo" 
        style={{ 
          width: '120px', 
          height: 'auto', 
          marginBottom: '20px',
          filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))'
        }} 
      />
      <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
        sar3
      </div>
      <div>Oyun yükleniyor...</div>
    </div>
  );
};

function App() {
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('theme-mode');
    return savedMode || 'light';
  });

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem('theme-mode', newMode);
          return newMode;
        });
      },
      setColorMode: (newMode) => {
        setMode(newMode);
        localStorage.setItem('theme-mode', newMode);
      },
      mode: mode
    }),
    [mode],
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#7B1FA2',
          },
          secondary: {
            main: '#f50057',
          },
          background: {
            default: mode === 'light' ? '#f5f5f5' : '#121212',
            paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
          },
          text: {
            primary: mode === 'light' ? 'rgba(0, 0, 0, 0.87)' : '#ffffff',
            secondary: mode === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.7)',
          },
        },
        components: {
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: mode === 'light' ? '#ffffff' : '#1e1e1e',
                color: mode === 'light' ? 'rgba(0, 0, 0, 0.87)' : '#ffffff',
              },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                backgroundColor: mode === 'light' ? '#ffffff' : '#1e1e1e',
                color: mode === 'light' ? 'rgba(0, 0, 0, 0.87)' : '#ffffff',
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundColor: mode === 'light' ? '#ffffff' : '#1e1e1e',
                color: mode === 'light' ? 'rgba(0, 0, 0, 0.87)' : '#ffffff',
              },
            },
          },
        },
      }),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <LanguageProvider>
            <Router>
              <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <DashboardPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/oyun-detay/:oyunAdi"
                  element={
                    <PrivateRoute>
                      <OyunDetayPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/oyun/:oyunAdi/:lobiId"
                  element={
                    <PrivateRoute>
                      <GameRedirect />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/oyun/:oyunAdi"
                  element={
                    <PrivateRoute>
                      <GameRedirect />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </Router>
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
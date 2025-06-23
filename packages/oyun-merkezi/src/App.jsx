import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ColorModeContext } from './contexts/ColorModeContext';
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
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontSize: '18px'
    }}>
      Oyun yükleniyor...
    </div>
  );
};

function App() {
  const [mode, setMode] = useState('light');

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
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
        </AuthProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
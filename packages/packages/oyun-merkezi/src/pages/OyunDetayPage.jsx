import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import InfoIcon from '@mui/icons-material/Info';
import PeopleIcon from '@mui/icons-material/People';
import TimerIcon from '@mui/icons-material/Timer';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useAuth } from '../contexts/AuthContext';

const OyunDetayPage = () => {
  const { oyunAdi } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();

  const oyunBilgileri = {
    'Tombala': {
      aciklama: 'Tombala, Türkiye\'de özellikle yılbaşı gecelerinde aile ve arkadaş grupları arasında oynanan, şansa dayalı klasik bir sayı oyunudur. Genellikle kartlar ve torbadan çekilen numaralarla oynanır. Oyunun kökeni İtalya\'ya dayansa da, zamanla kültürel bir gelenek hâline gelmiştir.',
      kurallar: [
        '🎯 Oyun Amacı: Oyuncular, üzerlerinde 15 sayı bulunan 3 satırlı kartlar ile oynar. Torbadan rastgele çekilen numaralar anons edilir ve oyuncular kartlarındaki karşılık gelen sayıları kapatırlar. Belirli kombinasyonları ilk tamamlayan oyuncu kazanır.',
        '📌 Oynanış Adımları:',
        '1. Lobiye katıl veya oluştur.',
        '2. Sana verilen tombala kartını incele.',
        '3. Oyun başladığında sayılar otomatik olarak çekilir.',
        '4. Sayı senin kartında varsa tıkla ya da sistem otomatik işaretler (ayarına göre).',
        '5. İlk 1 sıra tamamlanınca "Çinko 1", sonra "Çinko 2", ardından "Tombala!"',
        '6. Kazanan oyuncu oyunu bitirir ve puanlar verilir.',
        '🏆 Kazanma Şartları:',
        '1. Çinko: Kartın bir satırındaki tüm numaralar kapandığında',
        '2. Çinko: İkinci satır da tamamlandığında',
        '3. Tombala: Tüm 3 satır kapandığında kazanılır'
      ],
      ozellikler: [
        '2-6 oyuncu',
        'Oyun süresi: 15-30 dakika',
        'Yaş sınırı: 7+',
        'Zorluk seviyesi: Kolay'
      ],
      gif: '/oyunDetay.gif',
      video: '/tombala-video.mp4'
    }
  };

  const oyun = oyunBilgileri[oyunAdi];

  if (!oyun) {
    return (
      <Container>
        <Typography variant="h4" sx={{ mt: 4, color: '#fff' }}>
          Oyun bulunamadı
        </Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundImage: 'url(/dashboard.gif)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      pt: 4,
      pb: 4
    }}>
      <Container maxWidth="lg">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{
            color: '#fff',
            mb: 3,
            '&:hover': {
              backgroundColor: alpha('#fff', 0.1)
            }
          }}
        >
          Geri Dön
        </Button>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Card sx={{ 
              background: alpha(theme.palette.background.paper, 0.3),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha('#fff', 0.2)}`,
              color: '#fff',
              mb: 3
            }}>
              <CardMedia
                component="img"
                image={oyun.gif}
                alt={oyunAdi}
                sx={{
                  height: '400px',
                  width: 'calc(100% - 32px)',
                  objectFit: 'cover',
                  backgroundColor: alpha('#fff', 0.1),
                  mt: 2,
                  borderRadius: 2,
                  mx: 2
                }}
              />
              <CardContent>
                <Typography variant="h4" gutterBottom>
                  {oyunAdi}
                </Typography>
                <Typography variant="body1" paragraph>
                  {oyun.aciklama}
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ 
              background: alpha(theme.palette.background.paper, 0.3),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha('#fff', 0.2)}`,
              color: '#fff'
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <InfoIcon sx={{ mr: 1 }} />
                  Oyun Özellikleri
                </Typography>
                <List>
                  {oyun.ozellikler.map((ozellik, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={ozellik} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ 
              background: alpha(theme.palette.background.paper, 0.3),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha('#fff', 0.2)}`,
              color: '#fff',
              height: '100%'
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <EmojiEventsIcon sx={{ mr: 1 }} />
                  Oyun Kuralları
                </Typography>
                <List dense>
                  {oyun.kurallar.map((kural, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemText 
                        primary={kural} 
                        primaryTypographyProps={{
                          variant: 'body1',
                          sx: { 
                            whiteSpace: 'pre-line',
                            lineHeight: 1.4,
                            fontSize: '0.95rem',
                            fontWeight: kural.includes('🎯') || kural.includes('📌') || kural.includes('🏆') ? 600 : 400
                          }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<PlayArrowIcon />}
            onClick={() => navigate('/dashboard')}
            sx={{
              backgroundColor: '#fff',
              color: '#7B1FA2',
              px: 4,
              py: 1.5,
              '&:hover': {
                backgroundColor: alpha('#fff', 0.9)
              }
            }}
          >
            Oynamaya Başla
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default OyunDetayPage; 
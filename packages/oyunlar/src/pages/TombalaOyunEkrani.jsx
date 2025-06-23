import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Button, List, ListItem, ListItemText, Avatar, Chip, IconButton } from '@mui/material';
import { useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import ChatWidget from '../components/ChatWidget';

// CSS animasyonu için stil
const pulseAnimation = `
  @keyframes pulse {
    0% {
      transform: scale(1);
      box-shadow: 0 4px 20px rgba(123, 31, 162, 0.4);
    }
    50% {
      transform: scale(1.05);
      box-shadow: 0 6px 30px rgba(123, 31, 162, 0.6);
    }
    100% {
      transform: scale(1);
      box-shadow: 0 4px 20px rgba(123, 31, 162, 0.4);
    }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes scaleIn {
    from { 
      transform: scale(0.5);
      opacity: 0;
    }
    to { 
      transform: scale(1);
      opacity: 1;
    }
  }
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    60% {
      transform: translateY(-5px);
    }
  }
  
  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes slideIn {
    from { 
      transform: translateX(-100%);
      opacity: 0;
    }
    to { 
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

// 1-90 arası rastgele 15 sayı (3x5 kart - her satırda 5 sayı)
function generateCard() {
  const numbers = Array.from({ length: 90 }, (_, i) => i + 1);
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  const card = [];
  let idx = 0;
  for (let row = 0; row < 3; row++) {
    const rowArr = [];
    for (let col = 0; col < 5; col++) {
      rowArr.push(numbers[idx++]);
    }
    card.push(rowArr);
  }
  return card;
}

const TombalaOyunEkrani = () => {
  const { lobiId } = useParams();
  const [card] = useState(generateCard());
  const [drawnNumbers, setDrawnNumbers] = useState([]);
  const [players, setPlayers] = useState([]);
  const [playerCards, setPlayerCards] = useState({}); // Her oyuncu için sabit kartlar
  const [lastDrawn, setLastDrawn] = useState(null);
  const [showAllNumbers, setShowAllNumbers] = useState(false); // Tüm sayıları göster/gizle
  const [playerAchievements, setPlayerAchievements] = useState({}); // Oyuncu başarıları
  const [showAchievement, setShowAchievement] = useState(false); // Başarı gösterimi
  const [currentAchievement, setCurrentAchievement] = useState(null); // Mevcut başarı
  const [gameCompleted, setGameCompleted] = useState(false); // Oyun tamamlandı mı
  const [playerRankings, setPlayerRankings] = useState([]); // Oyuncu sıralaması
  const [lobiData, setLobiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lobi verilerini getir
  useEffect(() => {
    const fetchLobiData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:4000/api/lobbies/${lobiId}`, { 
          withCredentials: true 
        });
        
        const lobi = response.data;
        setLobiData(lobi);
        
        // Katılımcıları oyuncu listesine dönüştür
        const playerList = lobi.katilanlar.map(katilimci => ({
          name: katilimci,
          isHost: katilimci === lobi.kurucu
        }));
        
        setPlayers(playerList);
        
        // Her oyuncu için sabit kart oluştur (rastgelelik için gecikme ile)
        const generatePlayerCards = async () => {
          const cards = {};
          for (let i = 0; i < playerList.length; i++) {
            const player = playerList[i];
            // Her oyuncu için küçük gecikme ekle
            await new Promise(resolve => setTimeout(resolve, 10));
            cards[player.name] = generateCard();
          }
          setPlayerCards(cards);
        };
        
        generatePlayerCards();
        
        setError(null);
      } catch (error) {
        console.error("Lobi verisi alınamadı:", error);
        setError("Lobi verisi yüklenirken hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    if (lobiId) {
      fetchLobiData();
    }
  }, [lobiId]);

  // 1-90 arası rastgele 15 sayı (3x5 kart - her satırda 5 sayı)
  const drawNumber = async () => {
    const remaining = Array.from({ length: 90 }, (_, i) => i + 1).filter(n => !drawnNumbers.includes(n));
    if (remaining.length === 0) return;
    const next = remaining[Math.floor(Math.random() * remaining.length)];
    const newDrawnNumbers = [...drawnNumbers, next];
    setDrawnNumbers(newDrawnNumbers);
    setLastDrawn(next);
    // Başarı kontrolü
    checkAchievements(newDrawnNumbers);
  };

  // Çinko sesi çal
  const playCinkoSound = () => {
    try {
      const audio = new Audio('/cinko.mp3');
      audio.volume = 0.3;
      audio.play();
    } catch (error) {
      console.log('Çinko sesi çalınamadı:', error);
    }
  };

  // Tombala sesi çal
  const playTombalaSound = () => {
    try {
      const audio = new Audio('/tombala.mp3');
      audio.volume = 0.3;
      audio.play();
    } catch (error) {
      console.log('Tombala sesi çalınamadı:', error);
    }
  };

  // Çinko ve Tombala kontrolü
  const checkAchievements = (drawnNums) => {
    const newAchievements = { ...playerAchievements };
    let hasNewAchievement = false;

    players.forEach(player => {
      const playerCard = playerCards[player.name];
      if (!playerCard) return;

      // Her satır için kontrol
      const completedRows = playerCard.map(row => 
        row.every(num => drawnNums.includes(num))
      );

      const completedRowCount = completedRows.filter(completed => completed).length;
      
      // Mevcut başarıları kontrol et
      const currentAchievements = newAchievements[player.name] || { çinko1: false, çinko2: false, tombala: false };
      
      // 1. Çinko (ilk satır)
      if (completedRowCount >= 1 && !currentAchievements.çinko1) {
        newAchievements[player.name] = { ...currentAchievements, çinko1: true };
        setCurrentAchievement({ player: player.name, type: 'ÇİNKO!', message: `${player.name} 1. Çinko yaptı!` });
        setShowAchievement(true);
        hasNewAchievement = true;
        playCinkoSound();
      }
      // 2. Çinko (ikinci satır)
      else if (completedRowCount >= 2 && !currentAchievements.çinko2) {
        newAchievements[player.name] = { ...currentAchievements, çinko2: true };
        setCurrentAchievement({ player: player.name, type: 'ÇİNKO!', message: `${player.name} 2. Çinko yaptı!` });
        setShowAchievement(true);
        hasNewAchievement = true;
        playCinkoSound();
      }
      // Tombala (tüm satırlar)
      else if (completedRowCount >= 3 && !currentAchievements.tombala) {
        newAchievements[player.name] = { ...currentAchievements, tombala: true };
        setCurrentAchievement({ player: player.name, type: 'TOMBALA!', message: `${player.name} TOMBALA yaptı! Oyunu kazandı!` });
        setShowAchievement(true);
        hasNewAchievement = true;
        playTombalaSound();
        
        // Oyun bitti, sıralama hesapla (yeni çekilen sayı dahil)
        setGameCompleted(true);
        const rankings = calculateRankings([...drawnNums, lastDrawn]);
        setPlayerRankings(rankings);
      }
    });

    if (hasNewAchievement) {
      setPlayerAchievements(newAchievements);
      // 3 saniye sonra başarı mesajını gizle
      setTimeout(() => {
        setShowAchievement(false);
        setCurrentAchievement(null);
      }, 3000);
    }
  };

  // Oyuncu sıralamasını hesapla
  const calculateRankings = (drawnNums) => {
    const playerRankings = players.map(player => {
      const playerCard = playerCards[player.name];
      if (!playerCard) return { ...player, completedRows: 0, ranking: 0 };

      // Her satır için kontrol
      const completedRows = playerCard.map(row => 
        row.every(num => drawnNums.includes(num))
      );

      const completedRowCount = completedRows.filter(completed => completed).length;
      
      return {
        ...player,
        completedRows: completedRowCount,
        ranking: 0 // Geçici olarak 0
      };
    });

    // Tamamlanan satır sayısına göre sırala (azalan)
    playerRankings.sort((a, b) => b.completedRows - a.completedRows);

    // Sıralama ata
    let currentRank = 1;
    let currentCompletedRows = playerRankings[0]?.completedRows;
    
    playerRankings.forEach((player, index) => {
      if (player.completedRows < currentCompletedRows) {
        currentRank = index + 1;
        currentCompletedRows = player.completedRows;
      }
      player.ranking = currentRank;
    });

    return playerRankings;
  };

  // Sıralama rengi
  const getRankingColor = (ranking) => {
    switch (ranking) {
      case 1: return '#FFD700'; // Altın
      case 2: return '#C0C0C0'; // Gümüş
      case 3: return '#CD7F32'; // Bronz
      default: return '#7B1FA2'; // Mor
    }
  };

  // Sıralama ikonu
  const getRankingIcon = (ranking) => {
    switch (ranking) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${ranking}`;
    }
  };

  // Sıralama metni
  const getRankingText = (ranking) => {
    switch (ranking) {
      case 1: return '1.';
      case 2: return '2.';
      case 3: return '3.';
      default: return `${ranking}.`;
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <Typography variant="h6">Lobi yükleniyor...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <Typography variant="h6" color="error">{error}</Typography>
      </Box>
    );
  }

  if (!lobiData) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <Typography variant="h6">Lobi bulunamadı</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      width: '100%',
      maxWidth: '100vw',
      backgroundImage: 'url(/dashboard.gif)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      color: 'white',
      margin: 0,
      padding: 0,
      position: 'relative',
      overflowY: 'auto',
      overflowX: 'hidden',
      boxSizing: 'border-box'
    }}>
      <style>{pulseAnimation}</style>
      
      {/* Başarı Modal */}
      {showAchievement && currentAchievement && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          animation: 'fadeIn 0.3s ease-in'
        }}>
          <Box sx={{
            backgroundColor: currentAchievement.type === 'TOMBALA!' ? '#FF5722' : '#7B1FA2',
            color: 'white',
            padding: 4,
            borderRadius: 3,
            textAlign: 'center',
            maxWidth: 400,
            width: '90%',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            animation: 'scaleIn 0.5s ease-out',
            border: '3px solid #FFD700'
          }}>
            <Typography variant="h3" sx={{ 
              fontWeight: 'bold', 
              mb: 2,
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              animation: 'bounce 1s infinite'
            }}>
              {currentAchievement.type}
            </Typography>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {currentAchievement.message}
            </Typography>
            <Box sx={{ 
              width: 60, 
              height: 60, 
              bgcolor: '#FFD700', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto',
              animation: 'rotate 2s linear infinite'
            }}>
              <Typography variant="h4" sx={{ color: '#333', fontWeight: 'bold' }}>
                🎉
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
      
      {/* Oyun Sonu Sıralama Modal */}
      {gameCompleted && playerRankings.length > 0 && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          animation: 'fadeIn 0.5s ease-in'
        }}>
          <Box sx={{
            backgroundColor: 'rgba(255,255,255,0.95)',
            color: '#333',
            padding: 4,
            borderRadius: 3,
            textAlign: 'center',
            maxWidth: 600,
            width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
            animation: 'scaleIn 0.7s ease-out',
            border: '4px solid #FFD700'
          }}>
            <Typography variant="h3" sx={{ 
              fontWeight: 'bold', 
              mb: 3,
              color: '#FF5722',
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
            }}>
              🏆 OYUN SONU 🏆
            </Typography>
            
            <Typography variant="h5" sx={{ mb: 3, color: '#666' }}>
              Final Sıralaması
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              {playerRankings.map((player, index) => (
                <Box key={player.name} sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  mb: 1,
                  borderRadius: 2,
                  backgroundColor: getRankingColor(player.ranking),
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  animation: `slideIn 0.5s ease-out ${index * 0.1}s both`
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      fontWeight: 'bold',
                      fontSize: '1.2rem'
                    }}>
                      {getRankingIcon(player.ranking)}
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {player.name}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {player.completedRows === 3 || player.ranking === 1 ? '3' : player.completedRows}/3 satır tamamladı
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {getRankingText(player.ranking)}
                  </Typography>
                </Box>
              ))}
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => window.location.href = 'http://localhost:5173/dashboard'}
                sx={{
                  backgroundColor: '#7B1FA2',
                  '&:hover': { backgroundColor: '#6a1b9a' },
                  px: 4,
                  py: 1.5
                }}
              >
                Ana Sayfaya Dön
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                onClick={async () => {
                  // Oyunu sıfırla
                  setGameCompleted(false);
                  setPlayerRankings([]);
                  setDrawnNumbers([]);
                  setLastDrawn(null);
                  setShowAllNumbers(false);
                  setPlayerAchievements({});
                  setShowAchievement(false);
                  setCurrentAchievement(null);
                  
                  // Yeni kartlar oluştur
                  const newCards = {};
                  for (let i = 0; i < players.length; i++) {
                    const player = players[i];
                    // Her oyuncu için küçük gecikme ekle
                    await new Promise(resolve => setTimeout(resolve, 10));
                    newCards[player.name] = generateCard();
                  }
                  setPlayerCards(newCards);
                }}
                sx={{
                  color: '#7B1FA2',
                  borderColor: '#7B1FA2',
                  '&:hover': { 
                    borderColor: '#6a1b9a',
                    backgroundColor: 'rgba(123, 31, 162, 0.1)'
                  },
                  px: 4,
                  py: 1.5
                }}
              >
                Tekrar Oyna
              </Button>
            </Box>
          </Box>
        </Box>
      )}
      
      {/* Ana Container - Sağ ve soldan eşit boşluklar */}
      <Box sx={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        px: { xs: 2, sm: 3, md: 4 },
        py: 2,
        width: '100%',
        boxSizing: 'border-box',
        overflowX: 'hidden'
      }}>
        {/* Geri Dön Butonu */}
        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => window.location.href = 'http://localhost:5173/dashboard'}
            sx={{
              color: 'white',
              borderColor: 'rgba(255,255,255,0.5)',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Geri Dön
          </Button>
        </Box>

        {/* Lobi Bilgileri - Daha yukarıda ve küçük */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" align="center" sx={{ mb: 1, opacity: 0.9 }}>
            {lobiData.ad} - Lobi #{lobiId}
          </Typography>
          
          <Typography variant="body2" align="center" sx={{ opacity: 0.7, fontSize: '0.875rem' }}>
            Kurucu: {lobiData.kurucu} | Oyuncu Sayısı: {players.length}
          </Typography>
        </Box>

        <Grid container spacing={2} sx={{ width: '100%', margin: 0, justifyContent: 'center' }}>
          {/* Tüm Oyuncuların Kartları */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2, textAlign: 'center' }}>
              Oyuncu Tombala Kartları
            </Typography>
            <Grid container spacing={2} sx={{ justifyContent: 'center' }}>
              {players.map((player, playerIndex) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={playerIndex}>
                  <Paper elevation={3} sx={{ 
                    p: 2, 
                    backgroundColor: 'rgba(255,255,255,0.1)', 
                    backdropFilter: 'blur(10px)',
                    border: player.isHost ? '2px solid #7B1FA2' : '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 2,
                    minHeight: 200
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ 
                        width: 24, 
                        height: 24, 
                        mr: 1,
                        bgcolor: player.isHost ? '#7B1FA2' : '#666',
                        fontSize: '0.75rem'
                      }}>
                        {player.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2" sx={{ 
                        color: 'white', 
                        fontWeight: player.isHost ? 'bold' : 'normal',
                        flex: 1
                      }}>
                        {player.name}
                      </Typography>
                      {player.isHost && (
                        <Chip 
                          label="Kurucu" 
                          size="small" 
                          sx={{ 
                            backgroundColor: '#7B1FA2', 
                            color: 'white',
                            fontSize: '0.6rem',
                            height: 20
                          }} 
                        />
                      )}
                    </Box>
                    
                    {/* Başarı Göstergeleri */}
                    {playerAchievements[player.name] && (
                      <Box sx={{ display: 'flex', gap: 0.5, mb: 1, justifyContent: 'center' }}>
                        {playerAchievements[player.name].çinko1 && (
                          <Chip 
                            label="1.Ç" 
                            size="small" 
                            sx={{ 
                              backgroundColor: '#4CAF50', 
                              color: 'white',
                              fontSize: '0.6rem',
                              height: 18
                            }} 
                          />
                        )}
                        {playerAchievements[player.name].çinko2 && (
                          <Chip 
                            label="2.Ç" 
                            size="small" 
                            sx={{ 
                              backgroundColor: '#FF9800', 
                              color: 'white',
                              fontSize: '0.6rem',
                              height: 18
                            }} 
                          />
                        )}
                        {playerAchievements[player.name].tombala && (
                          <Chip 
                            label="T" 
                            size="small" 
                            sx={{ 
                              backgroundColor: '#FF5722', 
                              color: 'white',
                              fontSize: '0.6rem',
                              height: 18,
                              fontWeight: 'bold'
                            }} 
                          />
                        )}
                      </Box>
                    )}
                    
                    {/* Oyuncu Kartı */}
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: 0.5,
                      alignItems: 'center',
                      justifyContent: 'center',
                      flex: 1
                    }}>
                      {playerCards[player.name] && playerCards[player.name].map((row, i) => (
                        <Box key={i} sx={{ display: 'flex', gap: 0.5 }}>
                          {row.map((num, j) => (
                            <Box
                              key={j}
                              sx={{
                                width: 28,
                                height: 28,
                                bgcolor: drawnNumbers.includes(num) ? '#7B1FA2' : 'rgba(255,255,255,0.9)',
                                color: drawnNumbers.includes(num) ? '#fff' : '#7B1FA2',
                                border: '1px solid #7B1FA2',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: 11,
                                borderRadius: 1,
                                transition: 'all 0.2s',
                                cursor: 'pointer',
                                '&:hover': {
                                  transform: 'scale(1.05)',
                                  boxShadow: '0 2px 8px rgba(123, 31, 162, 0.3)'
                                }
                              }}
                            >
                              {num}
                            </Box>
                          ))}
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>
          
          {/* Alt Panel: Oyuncular ve Sayı Çekme */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              {/* Oyuncular Paneli */}
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 2, backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                  <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>Oyuncular ({players.length})</Typography>
                  <List>
                    {players.map((player, idx) => (
                      <ListItem key={idx} sx={{ 
                        borderRadius: 1, 
                        mb: 1,
                        backgroundColor: player.isHost ? 'rgba(123, 31, 162, 0.3)' : 'rgba(255,255,255,0.05)'
                      }}>
                        <Avatar sx={{ 
                          width: 32, 
                          height: 32, 
                          mr: 2,
                          bgcolor: player.isHost ? '#7B1FA2' : '#666'
                        }}>
                          {player.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <ListItemText 
                          primary={player.name}
                          primaryTypographyProps={{ color: 'white' }}
                          secondary={player.isHost ? 'Kurucu' : 'Oyuncu'}
                          secondaryTypographyProps={{ color: 'rgba(255,255,255,0.7)' }}
                        />
                        {player.isHost && (
                          <Chip 
                            label="Kurucu" 
                            size="small" 
                            sx={{ 
                              backgroundColor: '#7B1FA2', 
                              color: 'white',
                              fontSize: '0.7rem'
                            }} 
                          />
                        )}
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
              
              {/* Sayı Çekme Paneli */}
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 2, backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                  <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                    Çekilen Sayılar ({drawnNumbers.length}/90)
                  </Typography>
                  
                  {/* Son çekilen sayı gösterimi */}
                  {lastDrawn && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h6" sx={{ color: 'white', textAlign: 'center', mb: 1 }}>
                        Son Çekilen:
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        mb: 2
                      }}>
                        <Box sx={{ 
                          width: 60, 
                          height: 60, 
                          bgcolor: '#7B1FA2', 
                          color: '#fff', 
                          borderRadius: '50%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontWeight: 'bold',
                          fontSize: '1.5rem',
                          boxShadow: '0 4px 20px rgba(123, 31, 162, 0.4)',
                          animation: 'pulse 2s infinite'
                        }}>
                          {lastDrawn}
                        </Box>
                      </Box>
                    </Box>
                  )}
                  
                  {/* Tüm sayıları göster/gizle butonu */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{ 
                        backgroundColor: '#7B1FA2',
                        '&:hover': {
                          backgroundColor: '#6a1b9a'
                        }
                      }}
                      onClick={drawNumber}
                      disabled={drawnNumbers.length >= 90}
                    >
                      {drawnNumbers.length >= 90 ? 'Tüm Sayılar Çekildi' : 'Sayı Çek'}
                    </Button>
                    
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ 
                        color: 'white',
                        borderColor: 'rgba(255,255,255,0.5)',
                        '&:hover': {
                          borderColor: 'white',
                          backgroundColor: 'rgba(255,255,255,0.1)'
                        }
                      }}
                      onClick={() => setShowAllNumbers(!showAllNumbers)}
                    >
                      {showAllNumbers ? 'Tüm Sayıları Gizle' : 'Tüm Sayıları Göster'}
                    </Button>
                  </Box>
                  
                  {/* Tüm çekilen sayılar (gizli/görünür) */}
                  {showAllNumbers && (
                    <Box sx={{ minHeight: 40, display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center' }}>
                      {drawnNumbers.map((num, idx) => (
                        <Box key={idx} sx={{ 
                          width: 24, 
                          height: 24, 
                          bgcolor: num === lastDrawn ? '#FF5722' : '#7B1FA2', 
                          color: '#fff', 
                          borderRadius: '50%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontWeight: 'bold',
                          fontSize: '0.7rem',
                          border: num === lastDrawn ? '2px solid #FF9800' : 'none'
                        }}>
                          {num}
                        </Box>
                      ))}
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
      <ChatWidget />
    </Box>
  );
};

export default TombalaOyunEkrani;

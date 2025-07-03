import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Button, List, ListItem, ListItemText, Avatar, Chip, IconButton, Dialog, DialogContent, DialogTitle } from '@mui/material';
import { useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PeopleIcon from '@mui/icons-material/People';
import axios from 'axios';
import ChatWidget from '../components/ChatWidget';
import VolumeDownIcon from '@mui/icons-material/VolumeDown';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

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
      // Her sayıyı obje olarak oluştur, marked özelliği ile
      rowArr.push({
        number: numbers[idx++],
        marked: false
      });
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
  const [usersList, setUsersList] = useState([]); // Kullanıcı listesi
  const [pointsDistributed, setPointsDistributed] = useState(false); // Puanlar dağıtıldı mı
  const [pointsResults, setPointsResults] = useState([]); // Puan dağıtım sonuçları
  const [volume, setVolume] = useState(50); // Ses seviyesi (0-100)
  const [isAutoMode, setIsAutoMode] = useState(false); // Otomatik/Manuel mod
  const [selectedPlayer, setSelectedPlayer] = useState(null); // Seçilen oyuncu
  const [showPlayersModal, setShowPlayersModal] = useState(false); // Oyuncular modalı
  const [playerPoints, setPlayerPoints] = useState({}); // Oyuncu puanları
  const [originalTitle, setOriginalTitle] = useState(''); // Orijinal sayfa başlığı
  const [achievementCheckTimeout, setAchievementCheckTimeout] = useState(null); // Başarı kontrolü için timeout

  // Sekme başlığı uyarısı
  useEffect(() => {
    // Orijinal başlığı kaydet
    setOriginalTitle(document.title);
    
    // Sayfa görünürlüğü değiştiğinde başlığı güncelle
    const handleVisibilityChange = () => {
      if (document.hidden && !gameCompleted && drawnNumbers.length > 0) {
        document.title = '⚠️ Oyun Devam Ediyor! - Geri Dönün';
      } else if (!document.hidden) {
        document.title = originalTitle || 'Tombala Oyunu';
      }
    };

    // Event listener'ı ekle
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Component unmount olduğunda event listener'ı temizle
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Başlığı orijinal haline döndür
      document.title = originalTitle || 'Tombala Oyunu';
    };
  }, [gameCompleted, originalTitle, drawnNumbers.length]);

  // Kullanıcı listesini getir
  useEffect(() => {
    axios.get('http://localhost:4000/api/users', { withCredentials: true })
      .then(res => setUsersList(res.data))
      .catch(err => console.error('Kullanıcı listesi alınamadı:', err));
  }, []);

  // Kullanıcı avatarını getir
  const getUserAvatar = (name) => {
    if (!name) return undefined;
    const [username, tag] = name.split('#');
    if (!username || !tag) return undefined;
    const user = usersList.find(
      u => u.username === username && String(u.tag) === String(tag)
    );
    return user?.avatar || undefined;
  };

  // Kullanıcı puanını getir
  const getUserPoints = (name) => {
    if (!name) return 0;
    const [username, tag] = name.split('#');
    if (!username || !tag) return 0;
    const user = usersList.find(
      u => u.username === username && String(u.tag) === String(tag)
    );
    return user?.points || 0;
  };

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

  // Ses seviyesini localStorage'dan yükle
  useEffect(() => {
    const savedVolume = localStorage.getItem('volume');
    if (savedVolume) {
      setVolume(parseInt(savedVolume));
    }
  }, []);

  // Sayı işaretleme fonksiyonu
  const toggleNumberMark = (playerName, rowIndex, colIndex) => {
    const cell = playerCards[playerName]?.[rowIndex]?.[colIndex];
    if (!cell) return;
    
    // Sadece çekilmiş sayılar işaretlenebilir
    if (!drawnNumbers.includes(cell.number)) {
      console.log('❌ Çekilmemiş sayı işaretlenemez:', { number: cell.number });
      return;
    }
    
    console.log('🔢 Sayı işaretleme:', { playerName, rowIndex, colIndex, number: cell.number, currentMarked: cell.marked });
    
    setPlayerCards(prevCards => {
      const newCards = { ...prevCards };
      if (newCards[playerName] && newCards[playerName][rowIndex]) {
        newCards[playerName][rowIndex][colIndex] = {
          ...newCards[playerName][rowIndex][colIndex],
          marked: !newCards[playerName][rowIndex][colIndex].marked
        };
        console.log('✅ İşaretleme güncellendi:', { 
          playerName, 
          number: cell.number, 
          newMarked: newCards[playerName][rowIndex][colIndex].marked 
        });
      }
      return newCards;
    });
    
    // İşaretleme sonrası başarı kontrolü yap (debounced)
    if (achievementCheckTimeout) {
      clearTimeout(achievementCheckTimeout);
    }
    const timeout = setTimeout(() => {
      checkAchievements();
    }, 200);
    setAchievementCheckTimeout(timeout);
  };

  // Çinko ve Tombala kontrolü - Manuel işaretlemeye göre
  const checkAchievements = () => {
    const newAchievements = { ...playerAchievements };
    let hasNewAchievement = false;

    players.forEach(player => {
      const playerCard = playerCards[player.name];
      if (!playerCard) return;

      // 3 satır, her satırda 5 sayı olacak şekilde kontrol et
      const completedRows = playerCard.map(row =>
        row.every(cell => cell.marked) // Sadece marked özelliğini kontrol et
      );

      // Mevcut başarıları kontrol et
      const currentAchievements = newAchievements[player.name] || { çinko1: false, çinko2: false, tombala: false };

      // Tamamlanan satır sayısını hesapla
      const completedRowCount = completedRows.filter(completed => completed).length;
      
      console.log('🎯 Başarı kontrolü:', { 
        player: player.name, 
        completedRowCount, 
        currentAchievements,
        completedRows: completedRows.map((completed, index) => ({ row: index, completed }))
      });
      
      // Hangi başarıların verilmesi gerektiğini kontrol et
      if (completedRowCount >= 1 && !currentAchievements.çinko1) {
        newAchievements[player.name] = { ...currentAchievements, çinko1: true };
        setCurrentAchievement({ player: player.name, type: 'ÇİNKO!', message: `${player.name} 1. Çinko yaptı!` });
        setShowAchievement(true);
        hasNewAchievement = true;
        playCinkoSound();
      }
      else if (completedRowCount >= 2 && !currentAchievements.çinko2) {
        newAchievements[player.name] = { ...currentAchievements, çinko2: true };
        setCurrentAchievement({ player: player.name, type: 'ÇİNKO!', message: `${player.name} 2. Çinko yaptı!` });
        setShowAchievement(true);
        hasNewAchievement = true;
        playCinkoSound();
      }
      else if (completedRowCount === 3 && !currentAchievements.tombala) {
        newAchievements[player.name] = { ...currentAchievements, tombala: true };
        setCurrentAchievement({ player: player.name, type: 'TOMBALA!', message: `${player.name} TOMBALA yaptı! Oyunu kazandı!` });
        setShowAchievement(true);
        hasNewAchievement = true;
        playTombalaSound();
        // Oyun bitti, sıralama hesapla
        setGameCompleted(true);
        const rankings = calculateRankings();
        setPlayerRankings(rankings);
        // Puan dağıtımını başlat
        setTimeout(() => {
          distributePoints(rankings);
        }, 1000);
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

  // Oyuncu sıralamasını hesapla - Manuel işaretlemeye göre
  const calculateRankings = () => {
    const playerRankings = players.map(player => {
      const playerCard = playerCards[player.name];
      if (!playerCard) return { ...player, completedRows: 0, ranking: 0 };

      // Her satır için kontrol
      const completedRows = playerCard.map(row => 
        row.every(cell => cell.marked) // Sadece marked özelliğini kontrol et
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

  // Çinko sesi çal
  const playCinkoSound = () => {
    try {
      const audio = new Audio('/cinko.mp3');
      // Ses seviyesini localStorage'dan al ve 0-1 arasına çevir
      const savedVolume = localStorage.getItem('volume');
      const volumeLevel = savedVolume ? parseInt(savedVolume) / 100 : 0.5;
      audio.volume = volumeLevel;
      audio.play();
    } catch (error) {
      console.log('Çinko sesi çalınamadı:', error);
    }
  };

  // Tombala sesi çal
  const playTombalaSound = () => {
    try {
      const audio = new Audio('/tombala.mp3');
      // Ses seviyesini localStorage'dan al ve 0-1 arasına çevir
      const savedVolume = localStorage.getItem('volume');
      const volumeLevel = savedVolume ? parseInt(savedVolume) / 100 : 0.5;
      audio.volume = volumeLevel;
      audio.play();
    } catch (error) {
      console.log('Tombala sesi çalınamadı:', error);
    }
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

  // Puan dağıtımı fonksiyonu
  const distributePoints = async (rankings) => {
    if (pointsDistributed) return; // Puanlar zaten dağıtılmışsa tekrar dağıtma
    
    try {
      // İlk 3 sıradaki oyuncuları al
      const winners = rankings
        .filter(player => player.ranking <= 3)
        .map(player => {
          const [username, tag] = player.name.split('#');
          return { username, tag };
        });

      if (winners.length === 0) return;

      // Backend'e puan dağıtım isteği gönder
      const response = await axios.post('http://localhost:4000/api/game/end', {
        lobiId: lobiId,
        winners: winners
      }, { withCredentials: true });

      console.log('🏆 Puan dağıtım sonucu:', response.data);
      
      setPointsResults(response.data.updatedUsers);
      setPointsDistributed(true);
      
      // Kullanıcı listesini güncelle
      const usersResponse = await axios.get('http://localhost:4000/api/users', { withCredentials: true });
      setUsersList(usersResponse.data);
      
    } catch (error) {
      console.error('❌ Puan dağıtım hatası:', error);
    }
  };

  // Otomatik sayı çekme için efekt
  useEffect(() => {
    if (isAutoMode && drawnNumbers.length < 90) {
      const interval = setInterval(() => {
        drawNumber();
      }, 1000);
      return () => clearInterval(interval);
    }
    // Otomatik moddan çıkınca veya 90'a ulaşınca timer'ı temizle
    return undefined;
  }, [isAutoMode, drawnNumbers.length]);

  // 1-90 arası rastgele 15 sayı (3x5 kart - her satırda 5 sayı)
  const drawNumber = async () => {
    const remaining = Array.from({ length: 90 }, (_, i) => i + 1).filter(n => !drawnNumbers.includes(n));
    if (remaining.length === 0) {
      // Tüm sayılar çekildi, ama oyun devam edebilir
      console.log('🎯 Tüm sayılar çekildi! Oyuncular işaretlemeye devam edebilir.');
      
      // Eğer henüz tombala yapılmamışsa, oyun devam eder
      if (!gameCompleted) {
        // Otomatik modu durdur
        setIsAutoMode(false);
      }
      return;
    }
    const next = remaining[Math.floor(Math.random() * remaining.length)];
    const newDrawnNumbers = [...drawnNumbers, next];
    setDrawnNumbers(newDrawnNumbers);
    setLastDrawn(next);
    // Sayı çekildiğinde başarı kontrolü yapmaya gerek yok, sadece işaretleme sonrası kontrol edilecek
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
            maxWidth: 700,
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
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
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {getRankingText(player.ranking)}
                    </Typography>
                    {pointsResults.length > 0 && player.ranking <= 3 && (
                      <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.8rem' }}>
                        +{player.ranking === 1 ? 100 : player.ranking === 2 ? 50 : 25} puan
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Puan Dağıtım Sonuçları */}
            {pointsResults.length > 0 && (
              <Box sx={{ 
                mb: 3, 
                p: 2, 
                backgroundColor: '#f0f8ff', 
                borderRadius: 2,
                border: '2px solid #4CAF50'
              }}>
                <Typography variant="h6" sx={{ color: '#2E7D32', mb: 2, fontWeight: 'bold' }}>
                  🎉 Puanlar Başarıyla Dağıtıldı!
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {pointsResults.map((result, index) => (
                    <Typography key={index} variant="body2" sx={{ color: '#666' }}>
                      <strong>{result.username}#{result.tag}</strong>: +{result.pointsAdded} puan 
                      (Toplam: {result.totalPoints} puan)
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
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
                  setPointsDistributed(false);
                  setPointsResults([]);
                  
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
        {/* Geri Dön Butonu ve Ses Kontrolü */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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

            {/* Oyuncular Butonu - Geri Dön'ün yanında */}
            <IconButton
              onClick={() => setShowPlayersModal(true)}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255,255,255,0.3)',
                color: 'white',
                width: 40,
                height: 40,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  transform: 'scale(1.1)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              <PeopleIcon />
            </IconButton>
          </Box>

          {/* Butonlar ve Manuel/Otomatik Mod */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            mb: 3
          }}>
            {/* Manuel/Otomatik Mod Ayarı */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              backgroundColor: 'rgba(255,255,255,0.1)',
              padding: 1,
              borderRadius: 2,
              backdropFilter: 'blur(10px)'
            }}>
              <Typography variant="body2" sx={{
                color: 'white',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
              }}>
                {isAutoMode ? '🤖' : '👤'}
              </Typography>
              <Button
                variant={isAutoMode ? "contained" : "outlined"}
                size="small"
                sx={{
                  backgroundColor: isAutoMode ? '#4CAF50' : 'transparent',
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.6)',
                  borderWidth: 1,
                  fontSize: '0.7rem',
                  py: 0.3,
                  px: 1.5,
                  borderRadius: 1,
                  fontWeight: 'bold',
                  minWidth: '60px',
                  '&:hover': {
                    backgroundColor: isAutoMode ? '#45a049' : 'rgba(255,255,255,0.1)',
                    borderColor: 'white'
                  }
                }}
                onClick={() => setIsAutoMode(!isAutoMode)}
              >
                {isAutoMode ? 'Otomatik' : 'Manuel'}
              </Button>
            </Box>

            {/* Sayı Çek ve Göster Butonları */}
            <Box sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Button
                variant="contained"
                size="small"
                sx={{
                  backgroundColor: '#7B1FA2',
                  fontSize: '0.95rem',
                  py: 0.7,
                  px: 2.5,
                  borderRadius: 2,
                  fontWeight: 'bold',
                  boxShadow: '0 2px 8px rgba(123, 31, 162, 0.3)',
                  '&:hover': {
                    backgroundColor: '#6a1b9a',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 3px 12px rgba(123, 31, 162, 0.5)'
                  },
                  '&:disabled': {
                    backgroundColor: '#666',
                    transform: 'none',
                    boxShadow: 'none'
                  }
                }}
                onClick={drawNumber}
                disabled={drawnNumbers.length >= 90}
              >
                {drawnNumbers.length >= 90 ? '🎯 Tüm Sayılar Çekildi' : '🎲 SAYI ÇEK'}
              </Button>
              <Button
                variant="outlined"
                size="small"
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.7)',
                  borderWidth: 1.5,
                  fontSize: '0.95rem',
                  py: 0.7,
                  px: 2.5,
                  borderRadius: 2,
                  fontWeight: 'bold',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-1px)'
                  }
                }}
                onClick={() => setShowAllNumbers(!showAllNumbers)}
              >
                {showAllNumbers ? '👁️ GİZLE' : '👁️ GÖSTER'}
              </Button>
            </Box>
          </Box>

          {/* Ses Kontrolü */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            backgroundColor: 'rgba(255,255,255,0.1)',
            padding: 1,
            borderRadius: 2,
            backdropFilter: 'blur(10px)'
          }}>
            <VolumeDownIcon sx={{ color: 'white', fontSize: 20 }} />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => {
                const newVolume = parseInt(e.target.value);
                setVolume(newVolume);
                localStorage.setItem('volume', newVolume);
              }}
              style={{
                width: '100px',
                height: '4px',
                borderRadius: '2px',
                background: 'rgba(255,255,255,0.3)',
                outline: 'none',
                cursor: 'pointer'
              }}
            />
            <VolumeUpIcon sx={{ color: 'white', fontSize: 20 }} />
            <Typography variant="body2" sx={{ color: 'white', minWidth: '30px', textAlign: 'center' }}>
              {volume}%
            </Typography>
          </Box>
        </Box>

        {/* Sayı Çekme Paneli - Üstte - Arka planla bütünleşik */}
        <Box sx={{ 
          width: '100%', 
          textAlign: 'center', 
          mt: 2,
          mb: 7,
        }}>
          
          {/* Son çekilen sayı gösterimi */}
          {lastDrawn && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                mb: 2
              }}>
                <Box sx={{ 
                  width: 56, 
                  height: 56, 
                  bgcolor: '#7B1FA2', 
                  color: '#fff', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                  boxShadow: '0 4px 12px rgba(123, 31, 162, 0.4)',
                  animation: 'pulse 2s infinite',
                  border: '3px solid #FFD700'
                }}>
                  {lastDrawn}
                </Box>
              </Box>
            </Box>
          )}
          
          {/* Tüm çekilen sayılar (gizli/görünür) */}
          {showAllNumbers && (
            <Box sx={{ 
              minHeight: 60, 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 1, 
              justifyContent: 'center',
              p: 2,
              backgroundColor: 'rgba(0,0,0,0.4)',
              borderRadius: 2,
              maxHeight: 150,
              overflowY: 'auto',
              maxWidth: '80%',
              margin: '0 auto'
            }}>
              {drawnNumbers.map((num, idx) => (
                <Box key={idx} sx={{ 
                  width: 28, 
                  height: 28, 
                  bgcolor: num === lastDrawn ? '#FF5722' : '#7B1FA2', 
                  color: '#fff', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                  border: num === lastDrawn ? '2px solid #FFD700' : '1px solid rgba(255,255,255,0.3)',
                  boxShadow: num === lastDrawn 
                    ? '0 3px 8px rgba(255, 87, 34, 0.5)' 
                    : '0 1px 4px rgba(123, 31, 162, 0.3)',
                  animation: num === lastDrawn ? 'pulse 1s infinite' : 'none'
                }}>
                  {num}
                </Box>
              ))}
            </Box>
          )}
        </Box>

        <Grid container spacing={2} sx={{ width: '100%', margin: 0, justifyContent: 'center' }}>
          {/* Tüm Oyuncuların Kartları - Tek sıra halinde yan yana */}
          <Grid item xs={12}>
            <Grid container spacing={2} sx={{ justifyContent: 'center' }}>
              {players.map((player, playerIndex) => (
                <Grid item xs={12} sm={6} md={4} lg={2.4} key={playerIndex}>
                  <Paper elevation={8} sx={{ 
                    p: 2, 
                    backgroundColor: 'rgba(255,255,255,0.15)', 
                    backdropFilter: 'blur(15px)',
                    border: player.isHost ? '3px solid #7B1FA2' : '2px solid rgba(255,255,255,0.3)',
                    borderRadius: 3,
                    minHeight: 200,
                    maxWidth: 320,
                    margin: '0 auto',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
                      borderColor: player.isHost ? '#9C27B0' : 'rgba(255,255,255,0.5)'
                    }
                  }}>
                    {/* Oyuncu Bilgisi - Daha kompakt */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 1,
                      justifyContent: 'center',
                      gap: 1
                    }}>
                      <Avatar sx={{ 
                        width: 24, 
                        height: 24, 
                        bgcolor: player.isHost ? '#7B1FA2' : '#666',
                        fontSize: '0.7rem',
                        border: player.isHost ? '2px solid #FFD700' : 'none'
                      }}>
                        {getUserAvatar(player.name) ? (
                          <img 
                            src={getUserAvatar(player.name)} 
                            alt="avatar" 
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover', 
                              borderRadius: '50%' 
                            }} 
                          />
                        ) : (
                          player.name.charAt(0).toUpperCase()
                        )}
                      </Avatar>
                      <Typography variant="body2" sx={{ 
                        color: 'white', 
                        fontWeight: player.isHost ? 'bold' : 'normal',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                        fontSize: { xs: '0.8rem', md: '0.9rem' }
                      }}>
                        {player.name}
                      </Typography>
                      {player.isHost && (
                        <Chip 
                          label="👑 Kurucu" 
                          size="small" 
                          sx={{ 
                            backgroundColor: '#7B1FA2', 
                            color: 'white',
                            fontSize: '0.6rem',
                            height: 20,
                            fontWeight: 'bold'
                          }} 
                        />
                      )}

                    </Box>
                    
                    {/* Başarı Göstergeleri - Daha belirgin */}
                    {playerAchievements[player.name] && (
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 0.5, 
                        mb: 1, 
                        justifyContent: 'center',
                        flexWrap: 'wrap'
                      }}>
                        {playerAchievements[player.name].çinko1 && (
                          <Chip 
                            label="🥇 1.ÇİNKO" 
                            size="small" 
                            sx={{ 
                              backgroundColor: '#4CAF50', 
                              color: 'white',
                              fontSize: '0.6rem',
                              height: 20,
                              fontWeight: 'bold',
                              boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
                            }} 
                          />
                        )}
                        {playerAchievements[player.name].çinko2 && (
                          <Chip 
                            label="🥈 2.ÇİNKO" 
                            size="small" 
                            sx={{ 
                              backgroundColor: '#FF9800', 
                              color: 'white',
                              fontSize: '0.6rem',
                              height: 20,
                              fontWeight: 'bold',
                              boxShadow: '0 2px 8px rgba(255, 152, 0, 0.3)'
                            }} 
                          />
                        )}
                        {playerAchievements[player.name].tombala && (
                          <Chip 
                            label="🏆 TOMBALA!" 
                            size="small" 
                            sx={{ 
                              backgroundColor: '#FF5722', 
                              color: 'white',
                              fontSize: '0.6rem',
                              height: 20,
                              fontWeight: 'bold',
                              boxShadow: '0 2px 8px rgba(255, 87, 34, 0.3)',
                              animation: 'pulse 1s infinite'
                            }} 
                          />
                        )}
                      </Box>
                    )}
                    
                    {/* Oyuncu Kartı - Manuel işaretleme ile */}
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                      flex: 1
                    }}>
                      {playerCards[player.name] && playerCards[player.name].map((row, i) => (
                        <Box key={i} sx={{ display: 'flex', gap: 1 }}>
                          {row.map((cell, j) => (
                            <Box
                              key={j}
                              onClick={() => toggleNumberMark(player.name, i, j)}
                              sx={{
                                width: { xs: 28, sm: 32, md: 36 },
                                height: { xs: 28, sm: 32, md: 36 },
                                bgcolor: cell.marked 
                                  ? '#7B1FA2' 
                                  : 'rgba(255,255,255,0.95)',
                                color: cell.marked 
                                  ? '#fff' 
                                  : '#7B1FA2',
                                border: cell.marked 
                                  ? '2px solid #4CAF50' 
                                  : '2px solid #7B1FA2',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: { xs: 12, sm: 13, md: 14 },
                                borderRadius: 2,
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                boxShadow: cell.marked 
                                  ? '0 4px 12px rgba(76, 175, 80, 0.4)' 
                                  : '0 2px 8px rgba(123, 31, 162, 0.2)',
                                opacity: 1,
                                '&:hover': {
                                  transform: 'scale(1.1)',
                                  boxShadow: cell.marked
                                    ? '0 6px 16px rgba(76, 175, 80, 0.6)'
                                    : '0 4px 12px rgba(123, 31, 162, 0.4)'
                                }
                              }}
                            >
                              {cell.number}
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
        </Grid>

      </Box>

      {/* Oyuncular Modal */}
      <Dialog
        open={showPlayersModal}
        onClose={() => setShowPlayersModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(15px)',
            borderRadius: 3,
            border: '2px solid rgba(123, 31, 162, 0.3)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: '#7B1FA2',
          color: 'white',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '1.5rem',
          py: 2
        }}>
          👥 Oyuncular ve Puanları
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <List>
            {players.map((player, idx) => (
              <ListItem key={idx} sx={{ 
                borderRadius: 2, 
                mb: 2,
                backgroundColor: player.isHost ? 'rgba(123, 31, 162, 0.1)' : 'rgba(0,0,0,0.02)',
                border: player.isHost ? '2px solid #7B1FA2' : '1px solid rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: player.isHost ? 'rgba(123, 31, 162, 0.15)' : 'rgba(0,0,0,0.05)',
                  transform: 'translateX(5px)'
                }
              }}>
                <Avatar sx={{ 
                  width: 48, 
                  height: 48, 
                  mr: 2,
                  bgcolor: player.isHost ? '#7B1FA2' : '#666',
                  border: player.isHost ? '3px solid #FFD700' : 'none'
                }}>
                  {getUserAvatar(player.name) ? (
                    <img 
                      src={getUserAvatar(player.name)} 
                      alt="avatar" 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover', 
                        borderRadius: '50%' 
                      }} 
                    />
                  ) : (
                    player.name.charAt(0).toUpperCase()
                  )}
                </Avatar>
                <ListItemText 
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" sx={{ 
                        fontWeight: player.isHost ? 'bold' : 'normal',
                        color: '#333'
                      }}>
                        {player.name}
                      </Typography>
                      {player.isHost && (
                        <Chip 
                          label="👑 Kurucu" 
                          size="small" 
                          sx={{ 
                            backgroundColor: '#7B1FA2', 
                            color: 'white',
                            fontSize: '0.7rem',
                            fontWeight: 'bold'
                          }} 
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        {player.isHost ? 'Kurucu' : 'Oyuncu'}
                      </Typography>
                      <Chip 
                        label={`🏆 ${getUserPoints(player.name)} Puan`}
                        size="small"
                        sx={{ 
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.8rem'
                        }}
                      />
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      <ChatWidget lobiId={lobiId} />
    </Box>
  );
};

export default TombalaOyunEkrani;

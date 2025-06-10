import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Divider } from '@mui/material';

const OyunDetay = () => {
  const { oyunAdi } = useParams();

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>{decodeURIComponent(oyunAdi)}</Typography>
      
      <Divider sx={{ my: 2 }} />

      <Typography variant="h6">Oyun Hakkında</Typography>
      <Typography paragraph>Bu alanda oyunun açıklaması yer alacak.</Typography>

      <Typography variant="h6" sx={{ mt: 4 }}>Lobi Oluştur</Typography>
      {/* Lobi oluşturma bileşeni */}

      <Typography variant="h6" sx={{ mt: 4 }}>Aktif Lobiler</Typography>
      {/* Lobilerin listesi */}

      <Typography variant="h6" sx={{ mt: 4 }}>Geçmiş Oyunlar</Typography>
      {/* Oyun geçmişi */}

      <Typography variant="h6" sx={{ mt: 4 }}>Nasıl Oynanır?</Typography>
      {/* Kılavuz içeriği */}

      <Typography variant="h6" sx={{ mt: 4 }}>Ayarlar</Typography>
      {/* Ayar bileşeni */}
    </Box>
  );
};

export default OyunDetay;
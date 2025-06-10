import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { useParams } from 'react-router-dom';

const TombalaOyunEkrani = () => {
  const { lobiId } = useParams();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Tombala - Lobi #{lobiId}
      </Typography>

      <Grid container spacing={2}>
        {/* Oyuncu Kartı */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6">Senin Kartın</Typography>
            {/* Kart bileşeni buraya gelecek */}
            <Box sx={{ mt: 2, height: 200, bgcolor: '#f5f5f5' }} />
          </Paper>
        </Grid>

        {/* Oyuncular Paneli */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6">Oyuncular</Typography>
            {/* Oyuncu listesi buraya gelecek */}
            <Box sx={{ mt: 2, height: 200, bgcolor: '#f0f0f0' }} />
          </Paper>
        </Grid>

        {/* Alt panel: Çekilen sayılar */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6">Çekilen Sayılar</Typography>
            {/* Çekilen sayılar listesi */}
            <Box sx={{ mt: 2, height: 100, bgcolor: '#eeeeee' }} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TombalaOyunEkrani;

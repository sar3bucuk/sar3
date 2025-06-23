# 🎲 Tombala Oyun Merkezi

Modern web teknolojileri ile geliştirilmiş, gerçek zamanlı çok oyunculu tombala oyunu. React, Material-UI ve Node.js kullanılarak oluşturulmuş interaktif bir oyun platformu.

## 🌟 Özellikler

### 🎮 Oyun Özellikleri
- **Gerçek Zamanlı Çok Oyunculu**: Birden fazla oyuncu aynı anda oynayabilir
- **Otomatik Kart Oluşturma**: Her oyuncu için rastgele 3x5 tombala kartları
- **Çinko ve Tombala Sistemi**: 
  - 1. Çinko: İlk satır tamamlandığında
  - 2. Çinko: İkinci satır tamamlandığında  
  - Tombala: Tüm 3 satır tamamlandığında
- **Ses Efektleri**: Çinko ve tombala için özel ses efektleri
- **Oyun Sonu Sıralaması**: Tüm oyuncular için final sıralama
- **Tekrar Oyna**: Aynı lobide yeni oyun başlatma

### 💬 Chat Sistemi
- **Sağ Alt Köşe Chat Widget**: Açılıp kapanabilen sohbet kutusu
- **Modern UI**: Koyu tema ile uyumlu tasarım
- **Okunmamış Mesaj Rozeti**: Yeni mesaj bildirimi
- **Gerçek Zamanlı Mesajlaşma**: Oyuncular arası iletişim

### 🎨 Kullanıcı Arayüzü
- **Responsive Tasarım**: Mobil ve masaüstü uyumlu
- **Material-UI**: Modern ve tutarlı tasarım sistemi
- **Animasyonlar**: Smooth geçişler ve hover efektleri
- **Koyu Tema**: Göz yormayan koyu arka plan

## 🚀 Kurulum

### Gereksinimler
- Node.js (v16 veya üzeri)
- npm veya yarn
- Modern web tarayıcısı

### Adım 1: Projeyi İndirin
```bash
git clone [repository-url]
cd sar3-Kopya-3
```

### Adım 2: Bağımlılıkları Yükleyin
```bash
# Ana proje bağımlılıkları
npm install

# Oyun merkezi bağımlılıkları
cd packages/oyun-merkezi
npm install

# Oyunlar paketi bağımlılıkları
cd ../oyunlar
npm install
```

### Adım 3: Ses Dosyalarını Ekleyin
`packages/oyunlar/public/` klasörüne aşağıdaki ses dosyalarını ekleyin:
- `cinko.mp3` - Çinko ses efekti
- `tombala.mp3` - Tombala ses efekti

### Adım 4: Backend Sunucusunu Başlatın
```bash
# Ana dizinde
node index.js
```

### Adım 5: Frontend Uygulamalarını Başlatın
```bash
# Oyun merkezi (Dashboard)
cd packages/oyun-merkezi
npm run dev

# Oyunlar (Tombala oyunu)
cd packages/oyunlar
npm run start
```

## 🎯 Kullanım

### Oyun Merkezi (Dashboard)
1. `http://localhost:5173` adresine gidin
2. Kayıt olun veya giriş yapın
3. Yeni lobi oluşturun veya mevcut lobiye katılın

### Tombala Oyunu
1. Lobiye katıldıktan sonra oyun otomatik başlar
2. Her oyuncu 3x5'lik tombala kartı alır
3. "Sayı Çek" butonu ile torbadan sayı çekilir
4. Çekilen sayılar kartlarda vurgulanır
5. Satırlar tamamlandıkça çinko/tombala bildirimi gelir
6. Oyun sonunda final sıralama gösterilir

### Chat Sistemi
- Sağ alt köşedeki 💬 ikonuna tıklayın
- Mesaj yazın ve "Gönder" butonuna basın
- Enter tuşu ile de mesaj gönderebilirsiniz

## 📁 Proje Yapısı

```
sar3-Kopya-3/
├── packages/
│   ├── oyun-merkezi/          # Ana dashboard uygulaması
│   │   ├── src/
│   │   │   ├── components/    # React bileşenleri
│   │   │   │   └── main.jsx       # Ana giriş noktası
│   │   │   ├── pages/         # Sayfa bileşenleri
│   │   │   ├── context/       # React context'leri
│   │   └── main.jsx
│   │   └── package.json
│   │
│   └── oyunlar/               # Tombala oyun uygulaması
│       ├── src/
│       │   ├── components/    # Oyun bileşenleri
│       │   │   └── ChatWidget.jsx  # Chat widget
│       │   ├── pages/         # Oyun sayfaları
│       │   │   └── TombalaOyunEkrani.jsx  # Ana oyun ekranı
│       │   └── main.jsx
│       └── package.json
│
├── public/                    # Statik dosyalar
├── package.json              # Ana proje konfigürasyonu
└── README.md                 # Bu dosya
```

## 🛠️ Teknik Detaylar

### Frontend Teknolojileri
- **React 18**: Modern React hooks ve functional components
- **Material-UI (MUI)**: UI bileşen kütüphanesi
- **Vite**: Hızlı build tool
- **React Router**: Sayfa yönlendirme
- **Axios**: HTTP istekleri

### Backend Teknolojileri
- **Node.js**: Server-side JavaScript
- **Express.js**: Web framework
- **Socket.io**: Gerçek zamanlı iletişim (gelecek özellik)

### Oyun Algoritması
- **Kart Oluşturma**: Fisher-Yates shuffle algoritması
- **Rastgele Sayı Çekme**: Math.random() ile rastgele seçim
- **Başarı Kontrolü**: Satır bazlı tamamlanma kontrolü
- **Sıralama Sistemi**: Tamamlanan satır sayısına göre sıralama

## 🎨 Tema ve Stil

### Renk Paleti
- **Ana Renk**: #7B1FA2 (Mor)
- **Arka Plan**: Koyu gradient
- **Metin**: Beyaz ve açık mor tonları
- **Vurgu**: Altın (#FFD700)

### Animasyonlar
- **Pulse**: Son çekilen sayı için
- **Fade In/Out**: Modal geçişleri
- **Scale**: Hover efektleri
- **Slide**: Sıralama listesi

## 🔧 Geliştirme

### Yeni Özellik Ekleme
1. İlgili paket klasörüne gidin
2. Yeni bileşen veya sayfa oluşturun
3. Routing ekleyin (gerekirse)
4. Test edin ve commit yapın

### Ses Dosyası Ekleme
1. Ses dosyasını `public/` klasörüne ekleyin
2. `TombalaOyunEkrani.jsx`'te ses çalma fonksiyonunu güncelleyin
3. Test edin

### Chat Sistemi Geliştirme
1. `ChatWidget.jsx` dosyasını düzenleyin
2. Backend entegrasyonu için Socket.io ekleyin
3. Gerçek zamanlı mesajlaşma özelliğini aktifleştirin


## 📞 Destek

Herhangi bir sorun yaşarsanız:
1. GitHub Issues'da sorun bildirin
2. Detaylı hata mesajı ekleyin
3. Hangi adımları takip ettiğinizi belirtin

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

**🎉 İyi oyunlar! Tombala oyununun keyfini çıkarın! 🎉**

# SAR3 - Lerna Monorepo

Bu proje Lerna monorepo yapısı kullanarak geliştirilmiş bir oyun platformudur.

## 📁 Proje Yapısı

```
sar3/
├── packages/
│   ├── oyun-merkezi/     # Ana sar3 uygulaması (React)
│   └── oyunlar/          # Oyun uygulamaları (React)
├── index.js              # Backend API server
├── lerna.json            # Lerna konfigürasyonu
└── package.json          # Root package.json
```

## 🚀 Kurulum

### 1. Bağımlılıkları Yükle
```bash
npm install
```

### Tüm Uygulamaları Paralel Çalıştır
```bash
npm run dev
```

### Sadece Backend'i Çalıştır
```bash
npm start
```

### Belirli Bir Paketi Çalıştır
```bash
# sar3 Ana Uygulama
cd packages/oyun-merkezi && npm run dev

# Oyunlar
cd packages/oyunlar && npm run dev
```

## 📦 Build

### Tüm Paketleri Build Et
```bash
npm run build
```

### Preview
```bash
npm run preview
```

## 🧹 Temizlik

### Node Modules Temizle
```bash
npm run clean
```

## 📋 Lerna Komutları

### Paketleri Listele
```bash
npx lerna list
```

### Paketleri Bootstrap Et
```bash
npx lerna bootstrap
```

### Tüm Paketlerde Script Çalıştır
```bash
npx lerna run dev --parallel
npx lerna run build
```

### Paket Versiyonlarını Güncelle
```bash
npx lerna version
```

### Paketleri Publish Et
```bash
npx lerna publish
```

## 🔧 Teknolojiler

- **Backend**: Node.js, Express.js
- **Frontend**: React, Vite
- **UI**: Material-UI
- **Monorepo**: Lerna + NPM Workspaces
- **Authentication**: JWT
- **Session**: Express Session

## 🌐 Portlar

- **Backend API**: http://localhost:4000
- **sar3 Ana Uygulama**: http://localhost:5173 (Vite default)
- **Oyunlar**: http://localhost:5174 (Vite default)

## 📝 Notlar

- Bu proje Lerna monorepo yapısı kullanır
- Her paket kendi bağımlılıklarını yönetir
- Ortak bağımlılıklar root package.json'da tanımlı
- NPM workspaces ile entegre çalışır

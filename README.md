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
npm run start:all
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

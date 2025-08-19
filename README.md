# 🎬 Film & Dizi Keşif Uygulaması

TMDB API kullanarak geliştirilmiş React Native Expo uygulaması.

## ✨ Özellikler

- 🏠 **Ana Sayfa**: Random filmler ve diziler
- 🔍 **Arama**: Film/dizi arama
- 📋 **İzleme Listesi**: Local storage ile kaydetme
- 🎭 **Kategoriler**: Film türlerine göre filtreleme
- 📱 **Detay Sayfası**: Film/dizi detayları ve oyuncular
- 💾 **Local Storage**: İzleme listesi cihaza kaydedilir

## 🚀 Kurulum

### Gereksinimler
- Node.js (v16 veya üzeri)
- npm veya yarn
- Expo CLI

### Adımlar

1. **Repository'yi klonlayın**
```bash
git clone https://github.com/rozerinsoftware/mobilapp.git
cd mobilapp
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Uygulamayı başlatın**
```bash
npx expo start
```

4. **Test edin**
- **Telefon**: Expo Go uygulaması ile QR kodu tarayın
- **Web**: Terminal'de `w` tuşuna basın
- **Android**: Terminal'de `a` tuşuna basın

## 📱 Kullanım

### Ana Sayfa
- Filmler ve diziler arasında geçiş yapın
- Kalp ikonuna tıklayarak izleme listesine ekleyin

### Arama
- Film veya dizi adı yazarak arama yapın
- Sonuçlara tıklayarak detay sayfasına gidin

### İzleme Listesi
- Kaydettiğiniz filmleri görün
- Filmlerden çıkarın veya detaylarını görün

### Kategoriler
- Film türlerine göre keşfedin
- Kategoriye tıklayarak filmleri görün

## 🛠️ Teknolojiler

- **React Native**: 0.79.5
- **Expo**: SDK 53
- **TypeScript**: 5.8.3
- **React Navigation**: Tab + Stack navigation
- **AsyncStorage**: Local data persistence
- **TMDB API**: Film/dizi verileri

## 📁 Proje Yapısı

```
src/
├── components/          # Yeniden kullanılabilir bileşenler
├── screens/            # Ekran bileşenleri
│   ├── HomeScreen.tsx      # Ana sayfa
│   ├── SearchScreen.tsx    # Arama sayfası
│   ├── WatchlistScreen.tsx # İzleme listesi
│   ├── MovieDetailScreen.tsx # Detay sayfası
│   ├── CategoriesScreen.tsx # Kategoriler
│   └── GenreMoviesScreen.tsx # Kategori filmleri
└── services/
    └── api.ts          # TMDB API servisleri
```

## 🔧 API Anahtarı

TMDB API anahtarı `src/services/api.ts` dosyasında tanımlıdır. Kendi API anahtarınızı almak için:
1. https://developer.themoviedb.org adresine gidin
2. Hesap oluşturun
3. API anahtarı alın
4. `src/services/api.ts` dosyasındaki `API_KEY` değişkenini güncelleyin

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Push edin (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

## 📞 İletişim

Proje hakkında sorularınız için GitHub Issues kullanabilirsiniz.

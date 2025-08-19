import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/api';

// Film/Dizi tipi tanımı
interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: 'movie' | 'tv';
}

export default function HomeScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'movies' | 'tv'>('movies');
  const [movies, setMovies] = useState<MediaItem[]>([]);
  const [tvShows, setTvShows] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [watchlistStatus, setWatchlistStatus] = useState<{[key: number]: boolean}>({});
  const fadeAnim = new Animated.Value(0);

  // Film verilerini çekme fonksiyonu
  const fetchMovies = async () => {
    try {
      const data = await apiService.getRandomMovies(1);
      setMovies(data.results);
    } catch (error) {
      console.error('Film verileri çekilemedi:', error);
    }
  };

  // TV dizilerini çekme fonksiyonu
  const fetchTVShows = async () => {
    try {
      const data = await apiService.getRandomTVShows(1);
      setTvShows(data.results);
    } catch (error) {
      console.error('TV dizileri çekilemedi:', error);
    }
  };

  // Tüm verileri çek
  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchMovies(), fetchTVShows()]);
    setLoading(false);
    setRefreshing(false);
  };

  // Sayfa yüklendiğinde verileri çek
  useEffect(() => {
    fetchAllData();
    checkWatchlistStatus();
    
    // Fade animasyonu başlat
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  // İzleme listesi durumunu kontrol et
  const checkWatchlistStatus = async () => {
    try {
      const watchlist = await AsyncStorage.getItem('watchlist');
      if (watchlist) {
        const watchlistArray = JSON.parse(watchlist);
        const status: {[key: number]: boolean} = {};
        watchlistArray.forEach((item: any) => {
          status[item.id] = true;
        });
        setWatchlistStatus(status);
      }
    } catch (error) {
      console.error('İzleme listesi kontrol edilemedi:', error);
    }
  };

  // İzleme listesine ekle/çıkar
  const toggleWatchlist = async (item: MediaItem) => {
    try {
      const watchlist = await AsyncStorage.getItem('watchlist');
      let watchlistArray = watchlist ? JSON.parse(watchlist) : [];

      if (watchlistStatus[item.id]) {
        // Listeden çıkar
        watchlistArray = watchlistArray.filter((listItem: any) => listItem.id !== item.id);
        Alert.alert('Başarılı', 'İçerik izleme listenizden çıkarıldı');
      } else {
        // Listeye ekle
        const mediaItem = {
          id: item.id,
          title: item.title || item.name,
          poster_path: item.poster_path,
          vote_average: item.vote_average,
          release_date: item.release_date || item.first_air_date,
          media_type: item.media_type || (activeTab === 'movies' ? 'movie' : 'tv'),
        };
        watchlistArray.push(mediaItem);
        Alert.alert('Başarılı', 'İçerik izleme listenize eklendi');
      }

      await AsyncStorage.setItem('watchlist', JSON.stringify(watchlistArray));
      checkWatchlistStatus();
    } catch (error) {
      console.error('İzleme listesi güncellenemedi:', error);
      Alert.alert('Hata', 'İzleme listesi güncellenemedi');
    }
  };

  // Yenileme fonksiyonu
  const onRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  // Film/Dizi kartı bileşeni
  const renderMediaCard = ({ item }: { item: MediaItem }) => {
    const title = item.title || item.name || 'Bilinmeyen Başlık';
    const releaseDate = item.release_date || item.first_air_date;
    const mediaType = item.media_type || (activeTab === 'movies' ? 'movie' : 'tv');

    const handleCardPress = () => {
      console.log('Kart tıklandı:', item.id, mediaType, title); // Debug için
      try {
        navigation.navigate('MovieDetail', { 
          movieId: item.id, 
          mediaType: mediaType 
        });
      } catch (error) {
        console.error('Navigation error:', error);
      }
    };

    return (
      <View style={styles.card}>
        <TouchableOpacity
          onPress={handleCardPress}
          style={styles.cardTouchable}
          activeOpacity={0.8}
        >
          <Image
            source={{
              uri: apiService.getPosterUrl(item.poster_path, 'w500') || 'https://via.placeholder.com/300x450?text=No+Image',
            }}
            style={styles.poster}
            resizeMode="cover"
          />
          
          <View style={styles.cardContent}>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.rating}>{item.vote_average.toFixed(1)}</Text>
              {releaseDate && (
                <Text style={styles.year}>
                  • {new Date(releaseDate).getFullYear()}
                </Text>
              )}
            </View>

            <View style={styles.mediaTypeContainer}>
              <Text style={styles.mediaType}>
                {mediaType === 'movie' ? '🎬 Film' : '📺 Dizi'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.watchlistButton}
            onPress={(e) => {
              e.stopPropagation(); // Ana kartın tıklamasını engelle
              toggleWatchlist(item);
            }}
          >
            <Ionicons
              name={watchlistStatus[item.id] ? "heart" : "heart-outline"}
              size={20}
              color={watchlistStatus[item.id] ? "#FF3B30" : "#666"}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    );
  };

  // Sekme değiştirme fonksiyonu
  const handleTabChange = (tab: 'movies' | 'tv') => {
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>İçerikler yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Film & Dizi Keşfi</Text>
      </View>

      {/* Tab Buttons */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'movies' && styles.activeTabButton]}
          onPress={() => handleTabChange('movies')}
        >
          <Ionicons 
            name="film" 
            size={20} 
            color={activeTab === 'movies' ? '#007AFF' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'movies' && styles.activeTabText]}>
            Filmler
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'tv' && styles.activeTabButton]}
          onPress={() => handleTabChange('tv')}
        >
          <Ionicons 
            name="tv" 
            size={20} 
            color={activeTab === 'tv' ? '#007AFF' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'tv' && styles.activeTabText]}>
            Diziler
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <FlatList
        data={activeTab === 'movies' ? movies : tvShows}
        renderItem={renderMediaCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        showsVerticalScrollIndicator={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.row}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  activeTabButton: {
    backgroundColor: '#e3f2fd',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
  },
  listContainer: {
    padding: 10,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardTouchable: {
    flex: 1,
    borderRadius: 12,
  },
  poster: {
    width: '100%',
    height: 200,
  },
  cardContent: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 6,
    lineHeight: 18,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  rating: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  year: {
    marginLeft: 6,
    fontSize: 12,
    color: '#666',
  },
  mediaTypeContainer: {
    marginTop: 4,
  },
  mediaType: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '500',
  },
  watchlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 6,
  },
});

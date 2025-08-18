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

// Film tipi tanımı
interface Movie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
}

export default function HomeScreen({ navigation }: any) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [watchlistStatus, setWatchlistStatus] = useState<{[key: number]: boolean}>({});
  const fadeAnim = new Animated.Value(0);

  // Film verilerini çekme fonksiyonu
  const fetchMovies = async () => {
    try {
      const data = await apiService.getPopularMovies(1);
      console.log('API Response:', data); // Debug için
      console.log('First movie poster:', data.results[0]?.poster_path); // Debug için
      setMovies(data.results);
    } catch (error) {
      console.error('Film verileri çekilemedi:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Sayfa yüklendiğinde filmleri çek
  useEffect(() => {
    fetchMovies();
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
  const toggleWatchlist = async (movie: Movie) => {
    try {
      const watchlist = await AsyncStorage.getItem('watchlist');
      let watchlistArray = watchlist ? JSON.parse(watchlist) : [];

      if (watchlistStatus[movie.id]) {
        // Listeden çıkar
        watchlistArray = watchlistArray.filter((item: any) => item.id !== movie.id);
        Alert.alert('Başarılı', 'Film izleme listenizden çıkarıldı');
      } else {
        // Listeye ekle
        const movieItem = {
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          vote_average: movie.vote_average,
          release_date: movie.release_date,
          media_type: 'movie',
        };
        watchlistArray.push(movieItem);
        Alert.alert('Başarılı', 'Film izleme listenize eklendi');
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
    fetchMovies();
  };

  // Film kartı bileşeni
  const renderMovieCard = ({ item }: { item: Movie }) => (
    <TouchableOpacity
      style={styles.movieCard}
      onPress={() => navigation.navigate('MovieDetail', { movieId: item.id })}
    >
      <Image
        source={{
          uri: item.poster_path 
            ? apiService.getPosterUrl(item.poster_path, 'w500')
            : 'https://via.placeholder.com/300x450?text=No+Image'
        }}
        style={styles.poster}
        resizeMode="cover"
        onError={(error) => console.log('Image error:', error.nativeEvent)} // Debug için
        onLoad={() => console.log('Image loaded for:', item.title)} // Debug için
      />
      
      {/* İzleme listesi butonu */}
      <TouchableOpacity
        style={styles.watchlistButton}
        onPress={(e) => {
          e.stopPropagation();
          toggleWatchlist(item);
        }}
      >
        <Ionicons
          name={watchlistStatus[item.id] ? "heart" : "heart-outline"}
          size={20}
          color={watchlistStatus[item.id] ? "#FF3B30" : "#fff"}
        />
      </TouchableOpacity>

      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.rating}>{item.vote_average.toFixed(1)}</Text>
        </View>
        <Text style={styles.releaseDate}>
          {new Date(item.release_date).getFullYear()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <View style={styles.loadingIconContainer}>
            <Ionicons name="film" size={48} color="#007AFF" />
            <ActivityIndicator size="large" color="#007AFF" style={styles.loadingSpinner} />
          </View>
          <Text style={styles.loadingTitle}>Filmler Yükleniyor</Text>
          <Text style={styles.loadingSubtitle}>En popüler filmleri getiriyoruz...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎬 Film Keşfi</Text>
        <Text style={styles.headerSubtitle}>Popüler filmleri keşfedin</Text>
      </View>
      
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <FlatList
          data={movies}
          renderItem={renderMovieCard}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>
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
  loadingContent: {
    alignItems: 'center',
    padding: 40,
  },
  loadingIconContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  loadingSpinner: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 10,
  },
  row: {
    justifyContent: 'space-between',
  },
  movieCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  poster: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  movieInfo: {
    padding: 12,
  },
  movieTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    lineHeight: 18,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  releaseDate: {
    fontSize: 12,
    color: '#999',
  },
  watchlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    padding: 6,
    zIndex: 1,
  },
});

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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/api';

// Film tipi
interface Movie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
}

export default function GenreMoviesScreen({ route, navigation }: any) {
  const { genreId, genreName } = route.params;
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [watchlistStatus, setWatchlistStatus] = useState<{[key: number]: boolean}>({});

  // Kategori filmlerini çek
  const fetchGenreMovies = async () => {
    try {
      const data = await apiService.getMoviesByGenre(genreId, 1);
      setMovies(data.results);
    } catch (error) {
      console.error('Kategori filmleri çekilemedi:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

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

  // Sayfa yüklendiğinde filmleri çek
  useEffect(() => {
    fetchGenreMovies();
    checkWatchlistStatus();
  }, [genreId]);

  // İzleme listesine ekle/çıkar
  const toggleWatchlist = async (movie: Movie) => {
    try {
      const watchlist = await AsyncStorage.getItem('watchlist');
      let watchlistArray = watchlist ? JSON.parse(watchlist) : [];

      if (watchlistStatus[movie.id]) {
        // Listeden çıkar
        watchlistArray = watchlistArray.filter((item: any) => item.id !== movie.id);
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
      }

      await AsyncStorage.setItem('watchlist', JSON.stringify(watchlistArray));
      checkWatchlistStatus();
    } catch (error) {
      console.error('İzleme listesi güncellenemedi:', error);
    }
  };

  // Yenileme fonksiyonu
  const onRefresh = () => {
    setRefreshing(true);
    fetchGenreMovies();
  };

  // Film kartı
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
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>{genreName} filmleri yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{genreName}</Text>
        <View style={styles.placeholder} />
      </View>
      
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
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

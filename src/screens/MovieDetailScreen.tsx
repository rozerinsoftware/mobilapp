import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/api';

// Film detay tipi
interface MovieDetail {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  release_date: string;
  runtime: number;
  genres: Array<{ id: number; name: string }>;
  credits: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      profile_path: string;
    }>;
  };
  media_type?: 'movie' | 'tv';
}

export default function MovieDetailScreen({ route, navigation }: any) {
  const { movieId, mediaType = 'movie' } = route.params;
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);

  // Film detaylarını çek
  const fetchMovieDetails = async () => {
    try {
      const data = await apiService.getMovieDetails(movieId, mediaType);
      setMovie(data);
    } catch (error) {
      console.error('Film detayları çekilemedi:', error);
      Alert.alert('Hata', 'Film detayları yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  // İzleme listesinde olup olmadığını kontrol et
  const checkWatchlistStatus = async () => {
    try {
      const watchlist = await AsyncStorage.getItem('watchlist');
      if (watchlist) {
        const watchlistArray = JSON.parse(watchlist);
        const isInWatchlist = watchlistArray.some((item: any) => item.id === movieId);
        setInWatchlist(isInWatchlist);
      }
    } catch (error) {
      console.error('İzleme listesi kontrol edilemedi:', error);
    }
  };

  // İzleme listesine ekle/çıkar
  const toggleWatchlist = async () => {
    if (!movie) return;

    try {
      const watchlist = await AsyncStorage.getItem('watchlist');
      let watchlistArray = watchlist ? JSON.parse(watchlist) : [];

      if (inWatchlist) {
        // Listeden çıkar
        watchlistArray = watchlistArray.filter((item: any) => item.id !== movieId);
        Alert.alert('Başarılı', 'Film izleme listenizden çıkarıldı');
      } else {
        // Listeye ekle
        const movieItem = {
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          vote_average: movie.vote_average,
          release_date: movie.release_date,
          media_type: mediaType,
        };
        watchlistArray.push(movieItem);
        Alert.alert('Başarılı', 'Film izleme listenize eklendi');
      }

      await AsyncStorage.setItem('watchlist', JSON.stringify(watchlistArray));
      setInWatchlist(!inWatchlist);
    } catch (error) {
      console.error('İzleme listesi güncellenemedi:', error);
      Alert.alert('Hata', 'İzleme listesi güncellenemedi');
    }
  };

  useEffect(() => {
    fetchMovieDetails();
    checkWatchlistStatus();
  }, [movieId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Film detayları yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  if (!movie) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Film bulunamadı</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Backdrop Image */}
        <View style={styles.backdropContainer}>
          <Image
            source={{
              uri: `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`,
            }}
            style={styles.backdrop}
            resizeMode="cover"
          />
          <View style={styles.backdropOverlay} />
          
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Watchlist Button */}
          <TouchableOpacity
            style={styles.watchlistButton}
            onPress={toggleWatchlist}
          >
            <Ionicons
              name={inWatchlist ? "heart" : "heart-outline"}
              size={24}
              color={inWatchlist ? "#FF3B30" : "#fff"}
            />
          </TouchableOpacity>
        </View>

        {/* Movie Info */}
        <View style={styles.movieInfo}>
          <View style={styles.posterContainer}>
            <Image
              source={{
                uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
              }}
              style={styles.poster}
              resizeMode="cover"
            />
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.title}>{movie.title}</Text>
            
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.rating}>{movie.vote_average.toFixed(1)}</Text>
              <Text style={styles.year}>
                • {new Date(movie.release_date).getFullYear()}
              </Text>
              {movie.runtime && (
                <Text style={styles.runtime}>• {movie.runtime} dk</Text>
              )}
            </View>

            <View style={styles.genresContainer}>
              {movie.genres.slice(0, 3).map((genre) => (
                <View key={genre.id} style={styles.genreTag}>
                  <Text style={styles.genreText}>{genre.name}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Özet</Text>
          <Text style={styles.overview}>{movie.overview}</Text>
        </View>

        {/* Cast */}
        {movie.credits?.cast && movie.credits.cast.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Oyuncular</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {movie.credits.cast.slice(0, 10).map((actor) => (
                <View key={actor.id} style={styles.actorCard}>
                  <Image
                    source={{
                      uri: actor.profile_path
                        ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
                        : 'https://via.placeholder.com/100x150?text=No+Image'
                    }}
                    style={styles.actorImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.actorName} numberOfLines={2}>
                    {actor.name}
                  </Text>
                  <Text style={styles.actorCharacter} numberOfLines={1}>
                    {actor.character}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  backdropContainer: {
    height: 250,
    position: 'relative',
  },
  backdrop: {
    width: '100%',
    height: '100%',
  },
  backdropOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  watchlistButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  movieInfo: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    marginTop: -50,
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  posterContainer: {
    marginRight: 15,
  },
  poster: {
    width: 100,
    height: 150,
    borderRadius: 8,
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    lineHeight: 24,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  year: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  runtime: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  genreTag: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  genreText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  overview: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  actorCard: {
    width: 100,
    marginRight: 15,
    alignItems: 'center',
  },
  actorImage: {
    width: 80,
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  actorName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 2,
  },
  actorCharacter: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../services/api';

// İzleme listesi film tipi
interface WatchlistItem {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  media_type: 'movie' | 'tv';
}

export default function WatchlistScreen({ navigation }: any) {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  // İzleme listesini yükle
  const loadWatchlist = async () => {
    try {
      const savedWatchlist = await AsyncStorage.getItem('watchlist');
      if (savedWatchlist) {
        setWatchlist(JSON.parse(savedWatchlist));
      }
    } catch (error) {
      console.error('İzleme listesi yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sayfa yüklendiğinde listeyi yükle
  useEffect(() => {
    loadWatchlist();
  }, []);

  // Sayfa odaklandığında listeyi yenile
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadWatchlist();
    });

    return unsubscribe;
  }, [navigation]);

  // Filmden çıkar
  const removeFromWatchlist = async (movieId: number) => {
    Alert.alert(
      'Filmden Çıkar',
      'Bu filmi izleme listenizden çıkarmak istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Çıkar',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedWatchlist = watchlist.filter(item => item.id !== movieId);
              await AsyncStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
              setWatchlist(updatedWatchlist);
            } catch (error) {
              console.error('Film çıkarılamadı:', error);
            }
          },
        },
      ]
    );
  };

  // Film kartı
  const renderWatchlistItem = ({ item }: { item: WatchlistItem }) => (
    <TouchableOpacity
      style={styles.movieCard}
      onPress={() => navigation.navigate('MovieDetail', { 
        movieId: item.id,
        mediaType: item.media_type 
      })}
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
      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.rating}>{item.vote_average.toFixed(1)}</Text>
        </View>
        <View style={styles.typeContainer}>
          <Text style={styles.mediaType}>
            {item.media_type === 'movie' ? '🎬 Film' : '📺 Dizi'}
          </Text>
          <Text style={styles.releaseDate}>
            {new Date(item.release_date).getFullYear()}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFromWatchlist(item.id)}
      >
        <Ionicons name="close-circle" size={24} color="#FF3B30" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>İzleme listesi yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📋 İzleme Listem</Text>
        <Text style={styles.headerSubtitle}>
          {watchlist.length} film/dizi kaydedildi
        </Text>
      </View>

      {watchlist.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="list-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>İzleme Listeniz Boş</Text>
          <Text style={styles.emptySubtitle}>
            Film veya dizi arayıp listenize ekleyin
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('Arama')}
          >
            <Text style={styles.browseButtonText}>Film Ara</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={watchlist}
          renderItem={renderWatchlistItem}
          keyExtractor={(item) => `${item.media_type}-${item.id}`}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    fontSize: 16,
    color: '#666',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mediaType: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  releaseDate: {
    fontSize: 12,
    color: '#999',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
  },
});

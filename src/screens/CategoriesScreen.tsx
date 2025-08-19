import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../services/api';

// Kategori tipi
interface Genre {
  id: number;
  name: string;
}

// Kategori renkleri
const genreColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
];

export default function CategoriesScreen({ navigation }: any) {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Kategorileri çek
  const fetchGenres = async () => {
    try {
      const data = await apiService.getGenres();
      setGenres(data.genres);
    } catch (error) {
      console.error('Kategoriler çekilemedi:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Sayfa yüklendiğinde kategorileri çek
  useEffect(() => {
    fetchGenres();
  }, []);

  // Yenileme fonksiyonu
  const onRefresh = () => {
    setRefreshing(true);
    fetchGenres();
  };

  // Kategori kartı
  const renderGenreCard = ({ item, index }: { item: Genre; index: number }) => (
    <TouchableOpacity
      style={[
        styles.genreCard,
        { backgroundColor: genreColors[index % genreColors.length] }
      ]}
      onPress={() => navigation.navigate('GenreMovies', { 
        genreId: item.id,
        genreName: item.name 
      })}
    >
      <View style={styles.genreContent}>
        <Text style={styles.genreName}>{item.name}</Text>
        <Ionicons name="chevron-forward" size={24} color="#fff" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Kategoriler yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎭 Kategoriler</Text>
        <Text style={styles.headerSubtitle}>Film türlerine göre keşfedin</Text>
      </View>
      
      <FlatList
        data={genres}
        renderItem={renderGenreCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={true}
        scrollEnabled={true}
        bounces={true}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={8}
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
    padding: 15,
  },
  genreCard: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  genreContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  genreName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});

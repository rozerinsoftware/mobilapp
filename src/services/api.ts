// TMDB API anahtarınızı buraya ekleyin
// https://developer.themoviedb.org/docs/getting-started adresinden alabilirsiniz
const API_KEY = 'cc5fff3b0a01c6ac9050634393f55196'; // TMDB API anahtarı

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// API istekleri için yardımcı fonksiyonlar
export const apiService = {
  // Popüler filmleri getir
  getPopularMovies: async (page: number = 1) => {
    try {
      const response = await fetch(
        `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=tr-TR&page=${page}`
      );
      return await response.json();
    } catch (error) {
      console.error('Popüler filmler getirilemedi:', error);
      throw error;
    }
  },

  // Film arama
  searchMovies: async (query: string, page: number = 1) => {
    try {
      const response = await fetch(
        `${BASE_URL}/search/multi?api_key=${API_KEY}&language=tr-TR&query=${encodeURIComponent(query)}&page=${page}`
      );
      return await response.json();
    } catch (error) {
      console.error('Film arama hatası:', error);
      throw error;
    }
  },

  // Film detayları
  getMovieDetails: async (movieId: number, mediaType: 'movie' | 'tv' = 'movie') => {
    try {
      const response = await fetch(
        `${BASE_URL}/${mediaType}/${movieId}?api_key=${API_KEY}&language=tr-TR&append_to_response=credits,videos,similar`
      );
      return await response.json();
    } catch (error) {
      console.error('Film detayları getirilemedi:', error);
      throw error;
    }
  },

  // Film poster URL'i oluştur
  getPosterUrl: (posterPath: string, size: 'w200' | 'w500' | 'original' = 'w500') => {
    if (!posterPath) return null;
    return `${IMAGE_BASE_URL}/${size}${posterPath}`;
  },

  // Backdrop URL'i oluştur
  getBackdropUrl: (backdropPath: string, size: 'w300' | 'w780' | 'original' = 'w780') => {
    if (!backdropPath) return null;
    return `${IMAGE_BASE_URL}/${size}${backdropPath}`;
  },
};

export default apiService;

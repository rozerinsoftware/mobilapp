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

  // Random filmleri getir (trending + popular karışımı)
  getRandomMovies: async (page: number = 1) => {
    try {
      // Hem trending hem de popular filmleri al
      const [trendingResponse, popularResponse] = await Promise.all([
        fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=tr-TR&page=${page}`),
        fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=tr-TR&page=${page}`)
      ]);
      
      const trendingData = await trendingResponse.json();
      const popularData = await popularResponse.json();
      
      // İki listeyi karıştır
      const combinedResults = [...trendingData.results, ...popularData.results];
      const shuffledResults = combinedResults.sort(() => Math.random() - 0.5);
      
      return {
        ...trendingData,
        results: shuffledResults.slice(0, 20) // İlk 20 filmi al
      };
    } catch (error) {
      console.error('Random filmler getirilemedi:', error);
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

  // TV dizilerini getir
  getPopularTVShows: async (page: number = 1) => {
    try {
      const response = await fetch(
        `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=tr-TR&page=${page}`
      );
      return await response.json();
    } catch (error) {
      console.error('TV dizileri getirilemedi:', error);
      throw error;
    }
  },

  // Random TV dizileri getir
  getRandomTVShows: async (page: number = 1) => {
    try {
      // Hem trending hem de popular TV dizilerini al
      const [trendingResponse, popularResponse] = await Promise.all([
        fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}&language=tr-TR&page=${page}`),
        fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&language=tr-TR&page=${page}`)
      ]);
      
      const trendingData = await trendingResponse.json();
      const popularData = await popularResponse.json();
      
      // İki listeyi karıştır
      const combinedResults = [...trendingData.results, ...popularData.results];
      const shuffledResults = combinedResults.sort(() => Math.random() - 0.5);
      
      return {
        ...trendingData,
        results: shuffledResults.slice(0, 20) // İlk 20 diziyi al
      };
    } catch (error) {
      console.error('Random TV dizileri getirilemedi:', error);
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
    if (!posterPath) return undefined;
    return `${IMAGE_BASE_URL}/${size}${posterPath}`;
  },

  // Backdrop URL'i oluştur
  getBackdropUrl: (backdropPath: string, size: 'w300' | 'w780' | 'original' = 'w780') => {
    if (!backdropPath) return undefined;
    return `${IMAGE_BASE_URL}/${size}${backdropPath}`;
  },

  // Film kategorilerini getir
  getGenres: async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=tr-TR`
      );
      return await response.json();
    } catch (error) {
      console.error('Kategoriler getirilemedi:', error);
      throw error;
    }
  },

  // Kategori bazlı filmleri getir
  getMoviesByGenre: async (genreId: number, page: number = 1) => {
    try {
      const response = await fetch(
        `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=tr-TR&with_genres=${genreId}&page=${page}&sort_by=popularity.desc`
      );
      return await response.json();
    } catch (error) {
      console.error('Kategori filmleri getirilemedi:', error);
      throw error;
    }
  },

  // Benzer filmleri getir
  getSimilarMovies: async (movieId: number, page: number = 1) => {
    try {
      const response = await fetch(
        `${BASE_URL}/movie/${movieId}/similar?api_key=${API_KEY}&language=tr-TR&page=${page}`
      );
      return await response.json();
    } catch (error) {
      console.error('Benzer filmler getirilemedi:', error);
      throw error;
    }
  },
};

export default apiService;

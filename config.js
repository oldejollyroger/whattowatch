// config.js

// !!! IMPORTANT: PASTE YOUR TMDB API KEY HERE !!!
const TMDB_API_KEY = '22f17214f2c35b01940cdfed47d738c2';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const translations = {
    en: {
        title: "Movie & TV Picker",
        subtitle: "What should we watch tonight? Find your next favorite movie or TV show",
        movies: "Movies",
        tvShows: "TV Shows",
        surpriseMe: "Surprise Me!",
        searching: "Searching...",
        noResults: "No results found. Try different filters!",
        welcome: "Select your country to begin!",
        year: "Year",
        rating: "Rating",
        availableOn: "Available on",
        notAvailable: "Streaming info not found.",
    },
    es: {
        title: "Selector de Pelis y Series",
        subtitle: "¿Qué vemos esta noche?",
        movies: "Películas",
        tvShows: "Series",
        surpriseMe: "¡Sorpréndeme!",
        searching: "Buscando...",
        noResults: "No se encontraron resultados. ¡Prueba otros filtros!",
        welcome: "¡Selecciona tu país para empezar!",
        year: "Año",
        rating: "Nota",
        availableOn: "Disponible en",
        notAvailable: "No se encontró información de streaming.",
    }
};
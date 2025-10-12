// config.js

// !!! IMPORTANT: PASTE YOUR TMDB API KEY HERE !!!
const TMDB_API_KEY = '22f17214f2c35b01940cdfed47d738c2';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// NEW: Curated list of top countries for streaming services
const TOP_COUNTRIES = [
    'US', 'GB', 'CA', 'AU', 'DE', 'FR', 'ES', 'IT', 'JP', 'KR', 'BR', 'MX', 'IN', 'NL', 'SE', 'AR',
    'AT', 'BE', 'CH', 'CL', 'CO', 'CZ', 'DK', 'FI', 'HK', 'HU', 'ID', 'IE', 'IL', 'MY', 'NZ', 'NO',
    'PE', 'PH', 'PL', 'PT', 'RO', 'RU', 'SA', 'SG', 'TH', 'TR', 'AE', 'ZA', 'TW', 'EG', 'GR', 'NG'
];
// NEW: Accent Color Definitions
const ACCENT_COLORS = [
    { name: 'Cyberpunk', color: '#a855f7', text: '#d8b4fe', from: '#a855f7', to: '#ec4899' },
    { name: 'Ocean', color: '#22d3ee', text: '#67e8f9', from: '#22d3ee', to: '#3b82f6' },
    { name: 'Forest', color: '#4ade80', text: '#d0f2b2', from: '#22c55e', to: '#a3e635' },
    { name: 'Sunset', color: '#f97316', text: '#fbbf24', from: '#fb923c', to: '#f59e0b' }
];
const translations = {
    en: {
        title: "Movie & TV Picker",
        subtitle: "Find your next favorite movie or TV show.",
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
        // NEW translations
        selectCountry: "Select Your Country",
        searchCountry: "Search for your country...",
        changeCountry: "Change Country"
    },
    es: {
        title: "Selector de Pelis y Series",
        subtitle: "Encuentra tu próxima película o serie favorita.",
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
        // NEW translations
        selectCountry: "Selecciona Tu País",
        searchCountry: "Busca tu país...",
        changeCountry: "Cambiar País"
    }
};
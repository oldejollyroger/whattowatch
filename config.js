// config.js

// !!! IMPORTANT: PASTE YOUR TMDB API KEY HERE !!!
const TMDB_API_KEY = '22f17214f2c35b01940cdfed47d738c2E';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// List of top countries for streaming services
const TOP_COUNTRIES = [ 'US', 'GB', 'CA', 'AU', 'DE', 'FR', 'ES', 'IT', 'JP', 'KR', 'BR', 'MX', 'IN', 'NL', 'SE', 'AR', 'AT', 'BE', 'CH', 'CL', 'CO', 'CZ', 'DK', 'FI', 'HK', 'HU', 'ID', 'IE', 'IL', 'MY', 'NZ', 'NO', 'PE', 'PH', 'PL', 'PT', 'RO', 'RU', 'SA', 'SG', 'TH', 'TR', 'AE', 'ZA', 'TW', 'EG', 'GR', 'NG' ];

// Accent Color Themes
const ACCENT_COLORS = [
    { name: 'Cyberpunk', from: '#a855f7', to: '#ec4899', color: '#a855f7', text: '#d8b4fe' },
    { name: 'Ocean',     from: '#22d3ee', to: '#3b82f6', color: '#22d3ee', text: '#67e8f9' },
    { name: 'Forest',    from: '#4ade80', to: '#a3e635', color: '#4ade80', text: '#d0f2b2' },
    { name: 'Sunset',    from: '#fb923c', to: '#f59e0b', color: '#f97316', text: '#fbbf24' },
    { name: 'Crimson',   from: '#ef4444', to: '#f43f5e', color: '#ef4444', text: '#fca5a5' },
    { name: 'Mint',      from: '#10b981', to: '#6ee7b7', color: '#10b981', text: '#a7f3d0' },
];

const translations = {
    en: {
        title: "What to Watch", // UPDATED
        subtitle: "Find your next favorite movie or TV show.",
        movies: "Movies",
        tvShows: "TV Shows",
        surpriseMe: "Surprise Me!",
        searching: "Searching...",
        noResults: "No results found. Try different filters!",
        year: "Year",
        rating: "Rating",
        availableOn: "Available on",
        notAvailable: "Streaming info not found.",
        selectCountry: "Select Your Country",
        searchCountry: "Search for your country...",
        changeCountry: "Change Country"
    },
    es: {
        title: "Qué Mirar", // UPDATED
        subtitle: "Encuentra tu próxima película o serie favorita.",
        movies: "Películas",
        tvShows: "Series",
        surpriseMe: "¡Sorpréndeme!",
        searching: "Buscando...",
        noResults: "No se encontraron resultados. ¡Prueba otros filtros!",
        year: "Año",
        rating: "Nota",
        availableOn: "Disponible en",
        notAvailable: "No se encontró información de streaming.",
        selectCountry: "Selecciona Tu País",
        searchCountry: "Busca tu país...",
        changeCountry: "Cambiar País"
    }
};
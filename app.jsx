// app.jsx - Version with New Features

const App = () => {
    // Bring React hooks into scope
    const { useState, useEffect, useCallback } = React;

    // --- State Management ---
    const [language, setLanguage] = useState('en');
    const [userRegion, setUserRegion] = useState(() => localStorage.getItem('moviePicker_userRegion') || null);
    const [mediaType, setMediaType] = useState('movie');
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [appStatus, setAppStatus] = useState('loading'); // 'loading', 'ready', 'error'
    const [isDiscovering, setIsDiscovering] = useState(false);
    const [error, setError] = useState(null);
    const [availableRegions, setAvailableRegions] = useState([]);
    
    // NEW STATE for theme and genre filters
    const [theme, setTheme] = useState(() => localStorage.getItem('moviePicker_theme') || 'dark');
    const [genreFilter, setGenreFilter] = useState(''); // Stores the ID of the selected genre

    const t = translations[language] || translations['en'];

    // --- API Fetcher ---
    const fetchApi = useCallback(async (path, params = {}) => {
        if (!TMDB_API_KEY || TMDB_API_KEY === 'YOUR_API_KEY_HERE') {
            throw new Error("API Key is missing or invalid in config.js");
        }
        const query = new URLSearchParams({ api_key: TMDB_API_KEY, ...params });
        const response = await fetch(`${TMDB_BASE_URL}/${path}?${query}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.status_message || "API request failed");
        }
        return response.json();
    }, []);
    
    // --- Effects ---
    useEffect(() => {
        if (userRegion) {
            localStorage.setItem('moviePicker_userRegion', userRegion);
        }
    }, [userRegion]);

    // NEW EFFECT for managing theme
    useEffect(() => {
        // This applies the theme class to the root <html> element
        if (theme === 'dark') {
            document.documentElement.classList.add('dark-mode');
            document.documentElement.classList.remove('light-mode');
        } else {
            document.documentElement.classList.add('light-mode');
            document.documentElement.classList.remove('dark-mode');
        }
        localStorage.setItem('moviePicker_theme', theme);
    }, [theme]);
    
    // Initialize the app (fetch countries)
    useEffect(() => {
        fetchApi('configuration/countries')
            .then(data => {
                setAvailableRegions(data.sort((a, b) => a.english_name.localeCompare(b.english_name)));
                setAppStatus('ready'); // Success!
            })
            .catch((err) => {
                console.error("Initialization failed:", err);
                setError(err.message);
                setAppStatus('error');
            });
    }, [fetchApi]);

    // --- Event Handlers ---
    // NEW HANDLER for changing country
    const handleChangeCountry = () => {
        localStorage.removeItem('moviePicker_userRegion');
        setUserRegion(null); // Update state to immediately trigger re-render to the selection screen
    };
    
    const handleSurpriseMe = useCallback(async () => {
        setIsDiscovering(true);
        setError(null);
        setSelectedMedia(null);
        try {
            const discoverParams = {
                'vote_count.gte': 150,
                'sort_by': 'popularity.desc',
                'watch_region': userRegion,
                'with_watch_monetization_types': 'flatrate',
                // NEW: Add genre to the request if one is selected
                'with_genres': genreFilter || undefined,
            };
            
            const initialData = await fetchApi(`discover/${mediaType}`, discoverParams);
            const totalPages = Math.min(initialData.total_pages, 200);
            if (totalPages === 0) throw new Error(t.noResults);
            
            const randomPage = Math.floor(Math.random() * totalPages) + 1;
            
            const pageData = await fetchApi(`discover/${mediaType}`, {...discoverParams, page: randomPage });
            const results = pageData.results;
            if (!results || results.length === 0) throw new Error(t.noResults);
            
            const randomResult = results[Math.floor(Math.random() * results.length)];
            const details = await fetchApi(`${mediaType}/${randomResult.id}`, { append_to_response: 'watch/providers' });
            
            setSelectedMedia({
                title: randomResult.title || randomResult.name,
                year: (randomResult.release_date || randomResult.first_air_date || 'N/A').substring(0, 4),
                poster: randomResult.poster_path ? `${TMDB_IMAGE_BASE_URL}${randomResult.poster_path}` : 'https://via.placeholder.com/500x750.png?text=No+Image',
                rating: randomResult.vote_average.toFixed(1),
                overview: randomResult.overview,
                providers: details['watch/providers']?.results?.[userRegion]?.flatrate || [],
            });

        } catch (err) {
            setError(err.message);
        } finally {
            setIsDiscovering(false);
        }
    }, [mediaType, userRegion, fetchApi, t, genreFilter]); // Added genreFilter dependency

    // --- Helper Data ---
    // NEW: Data for genre filter buttons
    const quickGenres = (mediaType === 'movie')
        ? [ { id: '28', name: 'Action' }, { id: '35', name: 'Comedy' }, { id: '878', name: 'Sci-Fi' }, { id: '27', name: 'Horror' }, { id: '10749', name: 'Romance' } ]
        : [ { id: '10759', name: 'Action' }, { id: '35', name: 'Comedy' }, { id: '99', name: 'Documentary' }, { id: '18', name: 'Drama' }, { id: '10765', name: 'Sci-Fi' } ];

    // --- Render Logic ---
    if (appStatus === 'loading') { return <div className="min-h-screen flex items-center justify-center"><div className="loader"></div></div>; }
    
    if (appStatus === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md text-center bg-red-900/50 border border-red-700 p-6 rounded-lg">
                    <h1 className="text-2xl font-bold text-white mb-2">Application Error</h1>
                    <p className="text-red-200">{error}</p>
                    <p className="text-xs text-gray-400 mt-4">Please check your API key in config.js and your internet connection.</p>
                </div>
            </div>
        );
    }
    
    if (!userRegion) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-sm text-center">
                    <h1 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">{t.welcome}</h1>
                    <select
                        onChange={(e) => setUserRegion(e.target.value)}
                        defaultValue=""
                        className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="" disabled>Select your country</option>
                        {availableRegions.map(r => <option key={r.iso_3166_1} value={r.iso_3166_1}>{r.english_name}</option>)}
                    </select>
                </div>
            </div>
        );
    }
    
    // Main App View
    return (
        <div className="container mx-auto max-w-2xl p-4 sm:p-6 text-center">
            
            {/* NEW: TOP RIGHT UTILITY BUTTONS (THEME & COUNTRY) */}
            <div className="absolute top-4 right-4 flex items-center space-x-2">
                <button onClick={handleChangeCountry} className="px-3 py-2 text-xs bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition">
                    Change Country
                </button>
                <button onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')} className="theme-toggle" title="Toggle Theme">
                    {theme === 'dark' ? 
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"></path></svg> : 
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                    }
                </button>
            </div>

            <header className="mb-8 pt-12"> {/* Added pt-12 to make space for buttons */}
                <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">{t.title}</h1>
                <p className="text-lg text-gray-400 mt-2">{t.subtitle}</p>
                <div className="mt-6 inline-flex p-1 rounded-full media-type-switcher">
                    <button onClick={() => setMediaType('movie')} className={`px-5 py-2 text-sm rounded-full media-type-btn ${mediaType === 'movie' ? 'media-type-btn-active' : ''}`}>{t.movies}</button>
                    <button onClick={() => setMediaType('tv')} className={`px-5 py-2 text-sm rounded-full media-type-btn ${mediaType === 'tv' ? 'media-type-btn-active' : ''}`}>{t.tvShows}</button>
                </div>
            </header>

            {/* NEW: GENRE FILTER BUTTONS */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
                {quickGenres.map(genre => (
                    <button
                        key={genre.id}
                        onClick={() => setGenreFilter(prev => prev === genre.id ? '' : genre.id)}
                        className={`quick-filter-btn px-4 py-1.5 text-sm rounded-full ${genreFilter === genre.id ? 'quick-filter-btn-active' : ''}`}
                    >
                        {genre.name}
                    </button>
                ))}
            </div>

            <button
                onClick={handleSurpriseMe}
                disabled={isDiscovering}
                className="w-full max-w-xs px-8 py-4 text-lg font-bold text-white rounded-lg shadow-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-purple-500 to-pink-500"
            >
                {isDiscovering ? t.searching : t.surpriseMe}
            </button>
            
            {error && !selectedMedia && <p className="text-red-400 mt-4">{error}</p>}
            
            <main className="mt-8">
                {isDiscovering && <div className="loader mx-auto"></div>}
                
                {selectedMedia && (
                    <div className="w-full container-style p-6 text-left movie-card-enter">
                        <div className="sm:flex sm:space-x-6">
                            <div className="sm:w-1/3 flex-shrink-0">
                                <img src={selectedMedia.poster} alt={`Poster for ${selectedMedia.title}`} className="rounded-lg shadow-lg w-full" />
                            </div>
                            <div className="mt-4 sm:mt-0">
                                <h2 className="text-3xl font-bold text-white">{selectedMedia.title}</h2>
                                <div className="flex items-center space-x-4 text-gray-400 mt-1">
                                    <span>{`${t.year}: ${selectedMedia.year}`}</span>
                                    <span>{`${t.rating}: ${selectedMedia.rating} ⭐`}</span>
                                </div>
                                <p className="text-gray-300 mt-4 text-base leading-relaxed">{selectedMedia.overview}</p>
                                <div className="mt-4">
                                    <h3 className="font-semibold text-white">{t.availableOn}</h3>
                                    {selectedMedia.providers.length > 0 ? (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {selectedMedia.providers.map(p => <img key={p.provider_id} src={`${TMDB_IMAGE_BASE_URL}${p.logo_path}`} alt={p.provider_name} title={p.provider_name} className="platform-logo" />)}
                                        </div>
                                    ) : <p className="text-gray-400">{t.notAvailable}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
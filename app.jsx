// app.jsx

const App = () => {
    const { useState, useEffect, useCallback } = React;

    // --- State Management ---
    const [language, setLanguage] = useState('en');
    const [userRegion, setUserRegion] = useState(null);
    const [mediaType, setMediaType] = useState('movie');
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [isDiscovering, setIsDiscovering] = useState(false);
    const [error, setError] = useState(null);
    const [availableRegions, setAvailableRegions] = useState([]);
    
    const t = translations[language] || translations['en'];

    // --- API Fetcher ---
    const fetchApi = useCallback(async (path, params = {}) => {
        if (!TMDB_API_KEY || TMDB_API_KEY === 'YOUR_API_KEY_HERE') {
            throw new Error("Missing API Key in config.js");
        }
        const query = new URLSearchParams({ api_key: TMDB_API_KEY, ...params });
        const response = await fetch(`${TMDB_BASE_URL}/${path}?${query}`);
        if (!response.ok) throw new Error("API request failed");
        return response.json();
    }, []);

    // --- Effects ---
    useEffect(() => {
        fetchApi('configuration/countries')
            .then(data => setAvailableRegions(data.sort((a, b) => a.english_name.localeCompare(b.english_name))))
            .catch(() => setError("Could not load country list."));
    }, [fetchApi]);

    // --- Event Handlers ---
    const handleSurpriseMe = useCallback(async () => {
        setIsDiscovering(true);
        setError(null);
        setSelectedMedia(null);
        try {
            const initialData = await fetchApi(`discover/${mediaType}`, {
                'vote_count.gte': 100,
                watch_region: userRegion,
                with_watch_monetization_types: 'flatrate',
                sort_by: 'popularity.desc'
            });

            if (initialData.total_results === 0) {
                setError(t.noResults);
                return;
            }
            
            const totalPages = Math.min(initialData.total_pages, 200);
            const randomPage = Math.floor(Math.random() * totalPages) + 1;
            
            const finalData = await fetchApi(`discover/${mediaType}`, {
                'vote_count.gte': 100,
                watch_region: userRegion,
                with_watch_monetization_types: 'flatrate',
                sort_by: 'popularity.desc',
                page: randomPage
            });
            
            const results = finalData.results;
            if (results && results.length > 0) {
                const randomResult = results[Math.floor(Math.random() * results.length)];
                
                const details = await fetchApi(`${mediaType}/${randomResult.id}`, { append_to_response: 'watch/providers' });
                
                const providers = details['watch/providers']?.results?.[userRegion]?.flatrate || [];
                
                setSelectedMedia({
                    title: randomResult.title || randomResult.name,
                    year: (randomResult.release_date || randomResult.first_air_date || '').substring(0, 4),
                    poster: randomResult.poster_path ? `${TMDB_IMAGE_BASE_URL}${randomResult.poster_path}` : 'https://via.placeholder.com/500x750.png?text=No+Image',
                    rating: randomResult.vote_average.toFixed(1),
                    overview: randomResult.overview,
                    providers: providers,
                });
            } else {
                setError(t.noResults);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsDiscovering(false);
        }
    }, [mediaType, userRegion, fetchApi, t]);

    // --- Render Logic ---
    if (!userRegion) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-sm text-center">
                    <h1 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">{t.welcome}</h1>
                    {availableRegions.length > 0 ? (
                        <select
                            onChange={(e) => setUserRegion(e.target.value)}
                            defaultValue=""
                            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="" disabled>Select your country</option>
                            {availableRegions.map(r => <option key={r.iso_3166_1} value={r.iso_3166_1}>{r.english_name}</option>)}
                        </select>
                    ) : ( <div className="loader mx-auto"></div> )}
                </div>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto max-w-2xl p-4 sm:p-6 text-center">
            <header className="mb-8">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">{t.title}</h1>
                <p className="text-lg text-gray-400 mt-2">{t.subtitle}</p>
                <div className="mt-6 inline-flex p-1 rounded-full media-type-switcher">
                    <button onClick={() => setMediaType('movie')} className={`px-5 py-2 text-sm rounded-full media-type-btn ${mediaType === 'movie' ? 'media-type-btn-active' : ''}`}>{t.movies}</button>
                    <button onClick={() => setMediaType('tv')} className={`px-5 py-2 text-sm rounded-full media-type-btn ${mediaType === 'tv' ? 'media-type-btn-active' : ''}`}>{t.tvShows}</button>
                </div>
            </header>

            <button
                onClick={handleSurpriseMe}
                disabled={isDiscovering}
                className="w-full max-w-xs px-8 py-4 text-lg font-bold text-white rounded-lg shadow-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-purple-500 to-pink-500"
            >
                {isDiscovering ? t.searching : t.surpriseMe}
            </button>
            
            {error && <p className="text-red-400 mt-4">{error}</p>}
            
            <main className="mt-8">
                {isDiscovering ? <div className="loader mx-auto"></div> :
                 selectedMedia && (
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

ReactDOM.render(<App />, document.getElementById('root'));
// app.jsx - Final Feature-Complete Version with Cast, Trailers, etc.

// --- Custom Hooks ---
const useDebounce = (value, delay) => { /* Unchanged */ };

// --- Reusable UI Components ---

const TrailerModal = ({ trailerKey, onClose }) => {
    if (!trailerKey) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="relative w-full max-w-4xl" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="modal-close-btn text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="trailer-responsive">
                    <iframe src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`} frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen title="Movie Trailer"></iframe>
                </div>
            </div>
        </div>
    );
};

const ActorDetailsModal = ({ actor, onClose }) => {
    if (!actor) return null;
    // Sort the actor's known-for work by popularity
    const knownFor = [...(actor.movie_credits?.cast || []), ...(actor.tv_credits?.cast || [])]
        .filter(item => item.poster_path)
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 10);
        
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content relative w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                 <button onClick={onClose} className="modal-close-btn text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="overflow-y-auto">
                    <div className="p-6 md:flex md:space-x-8">
                        <div className="md:w-1/3 flex-shrink-0 text-center">
                            <img src={actor.profile_path ? `${TMDB_IMAGE_BASE_URL}${actor.profile_path}` : 'https://via.placeholder.com/500x750.png?text=No+Image'} alt={actor.name} className="rounded-lg shadow-lg w-2/3 md:w-full mx-auto" />
                        </div>
                        <div className="mt-4 md:mt-0 md:w-2/3">
                            <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)]">{actor.name}</h2>
                            <p className="mt-4 text-base leading-relaxed max-h-60 overflow-y-auto">{actor.biography || "No biography available."}</p>
                        </div>
                    </div>
                    {knownFor.length > 0 && (
                        <div className="p-6 border-t border-[var(--color-card-border)]">
                            <h3 className="text-xl font-semibold mb-4 text-[var(--color-accent-text)]">Known For</h3>
                            <div className="horizontal-scroll-container">
                                {knownFor.map(item => (
                                    <div key={item.credit_id} className="flex-shrink-0 w-32 text-center">
                                        <img src={`${TMDB_IMAGE_BASE_URL}${item.poster_path}`} alt={item.title || item.name} className="rounded-lg" />
                                        <span className="block mt-2 text-xs text-gray-400">{item.title || item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


// All other components (SettingsMenu, SearchBar, AdvancedFilters, GenreFilters, CountrySelector) should be pasted here, unchanged from the last working version.


const App = () => {
    const { useState, useEffect, useCallback } = React;
    
    // --- State Management ---
    const [userRegion, setUserRegion] = useState(() => localStorage.getItem('moviePicker_userRegion') || null);
    const [mediaType, setMediaType] = useState('movie');
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [appStatus, setAppStatus] = useState('loading');
    const [isDiscovering, setIsDiscovering] = useState(false);
    const [error, setError] = useState(null);
    const [availableRegions, setAvailableRegions] = useState([]);
    const [displayMode, setDisplayMode] = useState(() => localStorage.getItem('moviePicker_displayMode') || 'dark');
    const [accent, setAccent] = useState(() => { const saved = localStorage.getItem('moviePicker_accent'); return saved ? JSON.parse(saved) : ACCENT_COLORS[0]; });
    const [filters, setFilters] = useState(() => { const saved = localStorage.getItem('moviePicker_filters_v2'); return saved ? JSON.parse(saved) : { quickGenre: '', includeGenres: [], excludeGenres: [], platforms: [] }; });
    const [allGenres, setAllGenres] = useState([]);
    const [allPlatforms, setAllPlatforms] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    
    // NEW: Unified modal state
    const [modal, setModal] = useState({ type: null, data: null }); // type: 'trailer' or 'actor'

    const t = translations['en'];

    // --- Effects (unchanged from last time) ---
    // ... all useEffects for theme, localStorage, and initialization remain the same ...

    const fetchApi = useCallback(async (path, params = {}) => { /* Unchanged */ }, []);

    // **MAJOR UPDATE**: This function now processes the full data payload
    const processMediaDetails = (details, mediaType, region) => {
        const trailer = details.videos?.results?.find(v => v.site === 'YouTube' && v.type === 'Trailer');
        return {
            title: details.title || details.name,
            id: details.id,
            year: (details.release_date || details.first_air_date || 'N/A').substring(0, 4),
            poster: details.poster_path ? `${TMDB_IMAGE_BASE_URL}${details.poster_path}` : 'https://via.placeholder.com/500x750.png?text=No+Image',
            rating: details.vote_average?.toFixed(1) || 'N/A',
            overview: details.overview,
            providers: details['watch/providers']?.results?.[region]?.flatrate || [],
            // NEW restored data
            cast: details.credits?.cast?.slice(0, 10) || [],
            similar: details.similar?.results?.filter(s => s.poster_path).slice(0, 10) || [],
            trailerKey: trailer ? trailer.key : null,
            mediaType: mediaType,
        };
    };

    // --- Event Handlers ---
    const handleChangeCountry = () => setUserRegion(null);
    
    // UPDATED handleSurpriseMe
    const handleSurpriseMe = useCallback(async () => {
        setIsDiscovering(true); setError(null); setSelectedMedia(null);
        try {
            const genresToInclude = [filters.quickGenre, ...filters.includeGenres].filter(Boolean).join(',');
            const discoverParams = {'vote_count.gte': 100, 'sort_by': 'popularity.desc', 'watch_region': userRegion, 'with_watch_monetization_types': 'flatrate'};
            if (genresToInclude) discoverParams['with_genres'] = genresToInclude;
            if (filters.excludeGenres.length > 0) discoverParams['without_genres'] = filters.excludeGenres.join(',');
            if (filters.platforms.length > 0) discoverParams['with_watch_providers'] = filters.platforms.join('|');
            
            const initialData = await fetchApi(`discover/${mediaType}`, discoverParams);
            const totalPages = Math.min(initialData.total_pages, 500); // Increased page limit for more variety
            if (totalPages === 0) throw new Error(t.noResults);
            
            const randomPage = Math.floor(Math.random() * totalPages) + 1;
            const pageData = await fetchApi(`discover/${mediaType}`, {...discoverParams, page: randomPage });
            const results = pageData.results;
            if (!results || results.length === 0) throw new Error(t.noResults);
            
            const randomResult = results[Math.floor(Math.random() * results.length)];
            
            // Fetch FULL details for the chosen media
            const details = await fetchApi(`${mediaType}/${randomResult.id}`, { append_to_response: 'videos,credits,similar,watch/providers' });
            
            setSelectedMedia(processMediaDetails(details, mediaType, userRegion));
        } catch (err) { setError(err.message); } finally { setIsDiscovering(false); }
    }, [mediaType, userRegion, fetchApi, t, filters, processMediaDetails]);
    
    // UPDATED handleResultClick
    const handleResultClick = async (result) => {
        setError(null);
        setSelectedMedia(null); // Clear previous selection to show loading state
        setIsDiscovering(true); // Reuse the loader
        try {
            const details = await fetchApi(`${result.mediaType}/${result.id}`, { append_to_response: 'videos,credits,similar,watch/providers' });
            setSelectedMedia(processMediaDetails(details, result.mediaType, userRegion));
        } catch (err) {
            setError("Could not fetch details for this title.");
        } finally {
            setIsDiscovering(false);
        }
    };
    
    // NEW: handler for actor click
    const handleActorClick = useCallback(async (actorId) => {
        try {
            setModal({ type: 'actor', data: null }); // Open modal with loader
            const actorDetails = await fetchApi(`person/${actorId}`, { append_to_response: 'movie_credits,tv_credits' });
            setModal({ type: 'actor', data: actorDetails });
        } catch (err) {
            console.error("Failed to fetch actor details", err);
            setModal({ type: null, data: null }); // Close modal on error
        }
    }, [fetchApi]);
    
    // --- Render Logic ---
    if (appStatus === 'loading' || (appStatus === 'ready' && !userRegion && availableRegions.length === 0)) { /* ... loading render */ }
    if (appStatus === 'error') { /* ... error render */ }
    if (appStatus === 'ready' && !userRegion) { /* ... country selector render */ }
    
    return (
        <div className="container mx-auto max-w-4xl p-4 sm:p-6 text-center">
            
            <div className="absolute top-4 right-4">
                <SettingsMenu t={t} currentTheme={accent} onSelectTheme={setAccent} onCountryChange={handleChangeCountry} displayMode={displayMode} onDisplayModeChange={setDisplayMode} />
            </div>

            <header className="mb-4 pt-16">
                 {/* ... header untouched ... */}
            </header>
            
            <SearchBar onSearch={handleSearch} searchResults={searchResults} onResultClick={handleResultClick} />
            
            <div className="text-center my-4 text-gray-400 font-semibold">— OR —</div>
            
            {/* ... Filters and Surprise Me Button are unchanged ... */}
            
            <main className="mt-8">
                {isDiscovering && <div className="loader mx-auto"></div>}
                
                {selectedMedia && !isDiscovering && (
                    <div className="w-full container-style p-6 text-left movie-card-enter">
                        {/* MAIN DETAILS */}
                        <div className="sm:flex sm:space-x-8">
                            <div className="sm:w-1/3 flex-shrink-0">
                                <img src={selectedMedia.poster} alt={`Poster for ${selectedMedia.title}`} className="rounded-lg shadow-lg w-full" />
                                {selectedMedia.trailerKey && (
                                    <button onClick={() => setModal({ type: 'trailer', data: selectedMedia.trailerKey })} className="card-action-btn trailer-btn mt-4">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                                        Watch Trailer
                                    </button>
                                )}
                            </div>
                            <div className="mt-4 sm:mt-0 flex-grow">
                                <h2 className="text-3xl font-bold">{selectedMedia.title}</h2>
                                <div className="flex items-center space-x-4 text-gray-400 mt-1">
                                    <span>{`${t.year}: ${selectedMedia.year}`}</span>
                                    <span>{`${t.rating}: ${selectedMedia.rating} ⭐`}</span>
                                </div>
                                <p className="mt-4 text-base leading-relaxed">{selectedMedia.overview}</p>
                                <div className="mt-6">
                                    <h3 className="font-semibold">{t.availableOn}</h3>
                                    {selectedMedia.providers.length > 0 ? (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {selectedMedia.providers.map(p => <img key={p.provider_id} src={`${TMDB_IMAGE_BASE_URL}${p.logo_path}`} alt={p.provider_name} title={p.provider_name} className="platform-logo" />)}
                                        </div>
                                    ) : <p className="text-gray-400">{t.notAvailable}</p>}
                                </div>
                            </div>
                        </div>
                        
                        {/* CAST DETAILS */}
                        {selectedMedia.cast.length > 0 && (
                            <div className="mt-8 pt-6 border-t border-[var(--color-card-border)]">
                                <h3 className="text-xl font-semibold mb-4 text-[var(--color-accent-text)]">Main Cast</h3>
                                <div className="horizontal-scroll-container">
                                    {selectedMedia.cast.map(actor => (
                                        <button key={actor.id} className="flex-shrink-0 w-24 text-center actor-card" onClick={() => handleActorClick(actor.id)}>
                                            <img src={actor.profile_path ? `${TMDB_IMAGE_BASE_URL}${actor.profile_path}` : 'https://via.placeholder.com/200x300.png?text=?'} alt={actor.name} className="actor-thumbnail" />
                                            <span className="actor-name">{actor.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* SIMILAR TITLES */}
                        {selectedMedia.similar.length > 0 && (
                            <div className="mt-8 pt-6 border-t border-[var(--color-card-border)]">
                                <h3 className="text-xl font-semibold mb-4 text-[var(--color-accent-text)]">Similar Titles</h3>
                                <div className="horizontal-scroll-container">
                                    {selectedMedia.similar.map(item => (
                                        <button key={item.id} className="flex-shrink-0 w-32 text-center actor-card" onClick={() => handleResultClick(item)}>
                                            <img src={`${TMDB_IMAGE_BASE_URL}${item.poster_path}`} alt={item.title || item.name} className="rounded-lg w-full" />
                                            <span className="block mt-2 text-xs text-gray-400">{item.title || item.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Render modals based on state */}
            {modal.type === 'trailer' && <TrailerModal trailerKey={modal.data} onClose={() => setModal({ type: null, data: null })} />}
            {modal.type === 'actor' && <ActorDetailsModal actor={modal.data} onClose={() => setModal({ type: null, data: null })} />}
        </div>
    );
};
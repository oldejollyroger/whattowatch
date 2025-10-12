// app.jsx - Final Polished Version with Bug Fixes

// --- Custom Hooks & Reusable Components ---
// All components from the last update (SearchBar, SettingsMenu, AdvancedFilters, etc.)
// should be pasted here. For brevity, they are omitted but they are required.
// For example:
// const useDebounce = ...
// const SearchBar = ...
// const SettingsMenu = ...
// const AdvancedFilters = ...
// const GenreFilters = ...
// const CountrySelector = ...

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
    const [accent, setAccent] = useState(() => {
        const savedAccent = localStorage.getItem('moviePicker_accent');
        return savedAccent ? JSON.parse(savedAccent) : ACCENT_COLORS[0];
    });
    const [filters, setFilters] = useState(() => {
        const savedFilters = localStorage.getItem('moviePicker_filters_v2');
        return savedFilters ? JSON.parse(savedFilters) : { quickGenre: '', includeGenres: [], excludeGenres: [], platforms: [] };
    });
    const [allGenres, setAllGenres] = useState([]);
    const [allPlatforms, setAllPlatforms] = useState([]);
    const [searchResults, setSearchResults] = useState([]);

    const t = translations['en'];

    // --- Effects ---
    useEffect(() => { /* ... Dynamic Theme Effect is unchanged ... */ }, [displayMode, accent]);
    
    // Save state to localStorage
    useEffect(() => {
        if (userRegion) {
            localStorage.setItem('moviePicker_userRegion', userRegion);
        } else {
            // FIX: Ensure if userRegion is cleared, it's removed from storage
            localStorage.removeItem('moviePicker_userRegion');
        }
        localStorage.setItem('moviePicker_filters_v2', JSON.stringify(filters));
    }, [userRegion, filters]);

    const fetchApi = useCallback(async (path, params = {}) => { /* ... Unchanged ... */ }, []);
    
    // **MAJOR FIX**: Split initialization into separate, dependent effects for stability
    useEffect(() => {
        // Step 1: Always fetch countries on load
        setAppStatus('loading');
        fetchApi('configuration/countries')
            .then(data => {
                const filteredCountries = data.filter(c => TOP_COUNTRIES.includes(c.iso_3166_1)).sort((a,b) => a.english_name.localeCompare(b.english_name));
                setAvailableRegions(filteredCountries);
                setAppStatus('ready');
            })
            .catch(err => {
                setError(err.message);
                setAppStatus('error');
            });
    }, [fetchApi]);

    useEffect(() => {
        // Step 2: Fetch region-specific data ONLY when userRegion or mediaType changes
        if (!userRegion) {
            // Clear data if no region is selected
            setAllGenres([]);
            setAllPlatforms([]);
            return;
        }

        const fetchRegionData = async () => {
            try {
                const [genresData, platformsData] = await Promise.all([
                    fetchApi(`genre/${mediaType}/list`),
                    fetchApi(`watch/providers/${mediaType}`, { watch_region: userRegion })
                ]);
                setAllGenres(genresData.genres || []);
                setAllPlatforms(platformsData.results || []);
            } catch (err) {
                console.error("Failed to fetch region data:", err);
                setError("Could not load data for the selected region.");
            }
        };
        fetchRegionData();
    }, [userRegion, mediaType, fetchApi]);

    // --- Event Handlers ---
    const handleChangeCountry = () => setUserRegion(null);
    
    const handleSurpriseMe = useCallback(async () => {
        setIsDiscovering(true); setError(null); setSelectedMedia(null);
        try {
            const genresToInclude = [filters.quickGenre, ...filters.includeGenres].filter(Boolean).join(',');
            
            const discoverParams = {
                'vote_count.gte': 50,
                'sort_by': 'popularity.desc',
                'watch_region': userRegion,
                'with_watch_monetization_types': 'flatrate',
            };
            
            // **MAJOR FIX**: Correctly add optional parameters
            if (genresToInclude) discoverParams['with_genres'] = genresToInclude;
            if (filters.excludeGenres.length > 0) discoverParams['without_genres'] = filters.excludeGenres.join(',');
            // **MAJOR FIX**: Platform filter requires | separator, NOT comma
            if (filters.platforms.length > 0) discoverParams['with_watch_providers'] = filters.platforms.join('|');
            
            // ... The rest of the Surprise Me logic is unchanged and now correct ...
            const initialData = await fetchApi(`discover/${mediaType}`, discoverParams);
            const totalPages = Math.min(initialData.total_pages, 200);
            if (totalPages === 0) throw new Error(t.noResults);
            
            const randomPage = Math.floor(Math.random() * totalPages) + 1;
            const pageData = await fetchApi(`discover/${mediaType}`, {...discoverParams, page: randomPage });
            const results = pageData.results;
            if (!results || results.length === 0) throw new Error(t.noResults);
            
            const randomResult = results[Math.floor(Math.random() * results.length)];
            const details = await fetchApi(`${mediaType}/${randomResult.id}`, { append_to_response: 'watch/providers' });
            setSelectedMedia({ title: randomResult.title || randomResult.name, id: randomResult.id, year: (randomResult.release_date || randomResult.first_air_date || 'N/A').substring(0, 4), poster: randomResult.poster_path ? `${TMDB_IMAGE_BASE_URL}${randomResult.poster_path}` : 'https://via.placeholder.com/500x750.png?text=No+Image', rating: randomResult.vote_average.toFixed(1), overview: randomResult.overview, providers: details['watch/providers']?.results?.[userRegion]?.flatrate || [], });
        } catch (err) { setError(err.message); } finally { setIsDiscovering(false); }
    }, [mediaType, userRegion, fetchApi, t, filters]);
    
    // ... handleSearch and handleResultClick are unchanged ...
    
    // --- Render Logic (Completely Overhauled for Clarity) ---
    if (appStatus === 'loading') {
        return <div className="min-h-screen flex items-center justify-center"><div className="loader"></div></div>;
    }
    
    if (appStatus === 'error') {
        // ... Error UI ...
    }
    
    // **MAJOR FIX**: This is the new gatekeeper. If the app is ready but no region is selected, show the selector.
    if (appStatus === 'ready' && !userRegion) {
        return <CountrySelector countries={availableRegions} onSelect={(region) => setUserRegion(region)} t={t} />;
    }
    
    // If we reach here, app is ready and a region is selected. Render the main app.
    return (
        <div className="container mx-auto max-w-4xl p-4 sm:p-6 text-center">
            
            <div className="absolute top-4 right-4">
                <SettingsMenu
                    t={t}
                    currentTheme={accent}
                    onSelectTheme={setAccent}
                    onCountryChange={handleChangeCountry}
                    displayMode={displayMode}
                    onDisplayModeChange={setDisplayMode}
                />
            </div>

            <header className="mb-4 pt-16">
                 {/* ... header untouched ... */}
            </header>
            
            <SearchBar /* ... unchanged */ />
            <div className="text-center my-4 text-gray-400 font-semibold">— OR —</div>
            
            <GenreFilters /* ... unchanged */ />
            <AdvancedFilters /* ... unchanged */ />
            
            <button 
                onClick={handleSurpriseMe} 
                disabled={isDiscovering} 
                className="w-full max-w-xs px-8 py-4 text-lg font-bold text-white rounded-full surprise-me-btn disabled:opacity-50 disabled:cursor-not-allowed">
                {isDiscovering ? t.searching : t.surpriseMe}
            </button>
            
            <main className="mt-8">
                 {/* ... main card display untouched ... */}
            </main>
        </div>
    );
};
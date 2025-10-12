// app.jsx - Final Version with Settings Dropdown and Bug Fixes

// --- Reusable UI Components ---

const SettingsMenu = ({ t, currentTheme, onSelectTheme, onCountryChange, displayMode, onDisplayModeChange }) => {
    const { useState, useEffect, useRef } = React;
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} className="settings-menu-container">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="theme-toggle" // Reusing the theme-toggle style for the gear icon
                title="Settings"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </button>
            {isOpen && (
                <div className="settings-dropdown">
                    <div className="space-y-4">
                        {/* Accent Color Selector */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-400 mb-2">Accent Color</h4>
                            <div className="flex items-center justify-around bg-gray-700/50 p-2 rounded-full border border-gray-600">
                                {ACCENT_COLORS.map(c => (
                                    <button
                                        key={c.name}
                                        onClick={() => { onSelectTheme(c); setIsOpen(false); }}
                                        className={`w-6 h-6 rounded-full transition-transform duration-150 transform hover:scale-110`}
                                        style={{ backgroundColor: c.color }}
                                        title={c.name}
                                    >
                                        {currentTheme.name === c.name && <svg className="w-6 h-6 text-white p-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Light/Dark Mode Toggle */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-400 mb-2">Display Mode</h4>
                            <div className="flex items-center p-1 rounded-full bg-gray-700/50 border border-gray-600">
                                <button onClick={() => onDisplayModeChange('light')} className={`w-1/2 py-1 text-sm rounded-full ${displayMode === 'light' ? 'bg-white text-black' : 'text-gray-300'}`}>Light</button>
                                <button onClick={() => onDisplayModeChange('dark')} className={`w-1/2 py-1 text-sm rounded-full ${displayMode === 'dark' ? 'bg-[var(--color-accent)] text-white' : 'text-gray-300'}`}>Dark</button>
                            </div>
                        </div>
                        
                        {/* Change Country Button */}
                        <button onClick={() => { onCountryChange(); setIsOpen(false); }} className="w-full text-left px-3 py-2 text-sm bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition">
                            {t.changeCountry}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// AdvancedFilters and other components are mostly unchanged, just ensure they are here
const AdvancedFilters = ({ t, genres, platforms, filters, onFilterChange }) => { /* Unchanged from last time, paste it here */ 
    const { useState, useRef } = React;
    const [isOpen, setIsOpen] = useState(false);
    const [platformSearch, setPlatformSearch] = useState('');
    const contentRef = useRef(null);

    const handleGenreChange = (genreId, type) => {
        const currentList = filters[type];
        const newList = currentList.includes(genreId) ? currentList.filter(id => id !== genreId) : [...currentList, genreId];
        const otherType = type === 'includeGenres' ? 'excludeGenres' : 'includeGenres';
        const otherList = filters[otherType].filter(id => id !== genreId);
        onFilterChange({ ...filters, [type]: newList, [otherType]: otherList });
    };

    const handlePlatformChange = (platformId) => {
        const newList = filters.platforms.includes(platformId) ? filters.platforms.filter(id => id !== platformId) : [...filters.platforms, platformId];
        onFilterChange({ ...filters, platforms: newList });
    };

    const filteredPlatforms = platforms.filter(p => p.provider_name.toLowerCase().includes(platformSearch.toLowerCase()));

    return ( <div className="advanced-filters-container max-w-2xl mx-auto"> <button onClick={() => setIsOpen(!isOpen)} className="w-full text-lg font-bold flex justify-between items-center text-[var(--color-accent)]"> <span>Advanced Filters</span> <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}> <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg> </span> </button> <div ref={contentRef} style={{ maxHeight: isOpen ? `${contentRef.current.scrollHeight}px` : '0px' }} className="filters-content"> <div className="filter-grid"> <div className="filter-section"> <h4 className="font-semibold mb-2 text-white">Include Genres</h4> <div className="filter-list"> {genres.map(genre => ( <label key={genre.id} className={`filter-label ${filters.excludeGenres.includes(genre.id) ? 'disabled' : ''}`}> <input type="checkbox" className="filter-custom-input" checked={filters.includeGenres.includes(genre.id)} disabled={filters.excludeGenres.includes(genre.id)} onChange={() => handleGenreChange(genre.id, 'includeGenres')} /> {genre.name} </label>))} </div> </div> <div className="filter-section"> <h4 className="font-semibold mb-2 text-white">Exclude Genres</h4> <div className="filter-list"> {genres.map(genre => ( <label key={genre.id} className={`filter-label ${filters.includeGenres.includes(genre.id) ? 'disabled' : ''}`}> <input type="checkbox" className="filter-custom-input" checked={filters.excludeGenres.includes(genre.id)} disabled={filters.includeGenres.includes(genre.id)} onChange={() => handleGenreChange(genre.id, 'excludeGenres')} /> {genre.name} </label>))} </div> </div> <div className="filter-section"> <h4 className="font-semibold mb-2 text-white">Platforms</h4> <input type="text" placeholder="Search platforms..." value={platformSearch} onChange={(e) => setPlatformSearch(e.target.value)} className="platform-search-input" /> <div className="filter-list"> {filteredPlatforms.map(platform => ( <label key={platform.provider_id} className="filter-label"> <input type="checkbox" className="filter-custom-input" checked={filters.platforms.includes(platform.provider_id)} onChange={() => handlePlatformChange(platform.provider_id)} /> {platform.provider_name} </label>))} </div> </div> </div> </div> </div> );
};

const GenreFilters = ({ t, mediaType, currentGenre, onGenreSelect }) => { /* Unchanged */ 
    const quickGenres = (mediaType === 'movie') ? [ { id: '28', name: 'Action' }, { id: '35', name: 'Comedy' }, { id: '878', name: 'Sci-Fi' }, { id: '27', name: 'Horror' }, { id: '10749', name: 'Romance' } ] : [ { id: '10759', name: 'Action' }, { id: '35', name: 'Comedy' }, { id: '99', name: 'Documentary' }, { id: '18', name: 'Drama' }, { id: '10765', name: 'Sci-Fi' } ];
    return ( <div className="w-full max-w-2xl mx-auto mb-8"> <h3 className="px-1 text-sm font-semibold text-gray-400 mb-2 text-left">Quick Filters</h3> <div className="horizontal-scroll-container"> {quickGenres.map(genre => ( <button key={genre.id} onClick={() => onGenreSelect(genre.id)} className={`quick-filter-btn px-4 py-1.5 text-sm ${currentGenre === genre.id ? 'quick-filter-btn-active' : ''}`}>{genre.name}</button>))} </div> </div>);
};
const CountrySelector = ({ countries, onSelect, t }) => { /* Unchanged */ 
    const [searchTerm, setSearchTerm] = React.useState('');
    const filteredCountries = countries.filter(country => country.english_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return ( <div className="modal-overlay"> <div className="country-selector-modal"> <div className="p-4 border-b border-[var(--color-card-border)]"> <h2 className="text-xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">{t.selectCountry}</h2> <input type="text" placeholder={t.searchCountry} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-3 mt-4 rounded-lg bg-gray-700/50 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500" /> </div> <div className="country-list"> {filteredCountries.map(country => ( <button key={country.iso_3166_1} onClick={() => onSelect(country.iso_3166_1)} className="country-list-item">{country.english_name}</button>))} </div> </div> </div>);
};

const App = () => {
    const { useState, useEffect, useCallback } = React;
    // ... basic states are the same ...
    const [userRegion, setUserRegion] = useState(() => localStorage.getItem('moviePicker_userRegion') || null);
    const [mediaType, setMediaType] = useState('movie');
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [appStatus, setAppStatus] = useState('loading');
    const [isDiscovering, setIsDiscovering] = useState(false);
    const [error, setError] = useState(null);
    const [availableRegions, setAvailableRegions] = useState([]);
    
    // NEW: state for light/dark display mode
    const [displayMode, setDisplayMode] = useState(() => localStorage.getItem('moviePicker_displayMode') || 'dark');
    
    // Theme is now called 'accent' for clarity
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

    const t = translations['en']; // Hardcoded to English for simplicity, can be changed back
    
    // --- Dynamic Theme Effect ---
    useEffect(() => {
        document.documentElement.className = displayMode === 'dark' ? 'dark-mode' : 'light-mode';
        localStorage.setItem('moviePicker_displayMode', displayMode);

        const r = document.documentElement;
        r.style.setProperty('--color-accent', accent.color);
        r.style.setProperty('--color-accent-text', accent.text);
        r.style.setProperty('--color-accent-gradient-from', accent.from);
        r.style.setProperty('--color-accent-gradient-to', accent.to);
        
        const hexToRgb = (hex) => { const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex); return r ? {r:parseInt(r[1],16), g:parseInt(r[2],16), b:parseInt(r[3],16)} : null; };
        const rgb = hexToRgb(accent.color); 
        if (rgb) {
            r.style.setProperty('--color-accent-rgb', `${rgb.r},${rgb.g},${rgb.b}`);
        }

        localStorage.setItem('moviePicker_accent', JSON.stringify(accent));
    }, [displayMode, accent]);
    
    // Save other state...
    useEffect(() => { if (userRegion) localStorage.setItem('moviePicker_userRegion', userRegion); }, [userRegion]);
    useEffect(() => { localStorage.setItem('moviePicker_filters_v2', JSON.stringify(filters)); }, [filters]);
    
    const fetchApi = useCallback(async (path, params = {}) => { /* Unchanged */
        if (!TMDB_API_KEY || TMDB_API_KEY === 'YOUR_API_KEY_HERE') throw new Error("API Key is missing or invalid in config.js");
        const query = new URLSearchParams({ api_key: TMDB_API_KEY, ...params });
        const response = await fetch(`${TMDB_BASE_URL}/${path}?${query}`);
        if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.status_message || "API request failed"); }
        return response.json();
    }, []);
    
    // Initialize App Effect
    useEffect(() => {
        const initializeApp = async () => {
            try {
                const [countriesData, genresData] = await Promise.all([
                    fetchApi('configuration/countries'),
                    fetchApi(`genre/${mediaType}/list`)
                ]);

                const filteredCountries = countriesData.filter(c => TOP_COUNTRIES.includes(c.iso_3166_1)).sort((a,b) => a.english_name.localeCompare(b.english_name));
                setAvailableRegions(filteredCountries);
                setAllGenres(genresData.genres || []);

                if (userRegion) {
                    // FIX: This now fetches all providers, then filters to 'flatrate'
                    const platformsData = await fetchApi(`watch/providers/${mediaType}`, { watch_region: userRegion });
                    setAllPlatforms(platformsData.results || []); // Keep all providers for the filter
                } else {
                     setAllPlatforms([]);
                }
                
                setAppStatus('ready');
            } catch (err) {
                console.error("Initialization failed:", err); setError(err.message); setAppStatus('error');
            }
        };
        initializeApp();
    }, [fetchApi, mediaType, userRegion]);

    const handleChangeCountry = () => { localStorage.removeItem('moviePicker_userRegion'); setUserRegion(null); };
    
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
            
            // FIX: Conditionally add parameters to avoid sending empty ones
            if (genresToInclude) discoverParams['with_genres'] = genresToInclude;
            if (filters.excludeGenres.length > 0) discoverParams['without_genres'] = filters.excludeGenres.join(',');
            if (filters.platforms.length > 0) discoverParams['with_watch_providers'] = filters.platforms.join('|');

            // ... Rest of the function is the same
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

    if (appStatus === 'loading') { return <div className="min-h-screen flex items-center justify-center"><div className="loader"></div></div>; }
    if (appStatus === 'error') { /* error render */ return ( <div className="min-h-screen flex items-center justify-center p-4"> <div className="w-full max-w-md text-center bg-red-900/50 border border-red-700 p-6 rounded-lg"> <h1 className="text-2xl font-bold text-white mb-2">Application Error</h1> <p className="text-red-200">{error}</p> <p className="text-xs text-gray-400 mt-4">Please check your API key and internet connection.</p> </div> </div>); }
    if (appStatus === 'ready' && !userRegion) { return <CountrySelector countries={availableRegions} onSelect={(region) => setUserRegion(region)} t={t} />; }
    
    return (
        <div className="container mx-auto max-w-4xl p-4 sm:p-6 text-center">
            
            {/* NEW: Use the SettingsMenu component */}
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
                 {/* Header JSX remains the same */}
                 <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)]">{t.title}</h1>
                 <p className="text-lg text-gray-400 mt-2">{t.subtitle}</p>
                 <div className="mt-6 inline-flex p-1 rounded-full media-type-switcher">
                    <button onClick={() => setMediaType('movie')} className={`px-5 py-2 text-sm rounded-full media-type-btn ${mediaType === 'movie' ? 'media-type-btn-active' : ''}`}>{t.movies}</button>
                    <button onClick={() => setMediaType('tv')} className={`px-5 py-2 text-sm rounded-full media-type-btn ${mediaType === 'tv' ? 'media-type-btn-active' : ''}`}>{t.tvShows}</button>
                 </div>
            </header>
            
            <GenreFilters t={t} mediaType={mediaType} currentGenre={filters.quickGenre} onGenreSelect={(genreId) => setFilters(f => ({ ...f, quickGenre: f.quickGenre === genreId ? '' : genreId }))} />
            
            <AdvancedFilters t={t} genres={allGenres} platforms={allPlatforms} filters={filters} onFilterChange={setFilters} />
            
            <button onClick={handleSurpriseMe} disabled={isDiscovering} className="w-full max-w-xs px-8 py-4 text-lg font-bold text-white rounded-full surprise-me-btn disabled:opacity-50 disabled:cursor-not-allowed">
                {isDiscovering ? t.searching : t.surpriseMe}
            </button>
            
            {/* The rest of the main app JSX is unchanged */}
            {error && !selectedMedia && <p className="text-red-400 mt-4">{error}</p>}
            <main className="mt-8"> {isDiscovering && <div className="loader mx-auto"></div>} {selectedMedia && ( <div className="w-full container-style p-6 text-left movie-card-enter"> <div className="sm:flex sm:space-x-6"> <div className="sm:w-1/3 flex-shrink-0"> <img src={selectedMedia.poster} alt={`Poster for ${selectedMedia.title}`} className="rounded-lg shadow-lg w-full" /> </div> <div className="mt-4 sm:mt-0"> <h2 className="text-3xl font-bold text-white">{selectedMedia.title}</h2> <div className="flex items-center space-x-4 text-gray-400 mt-1"> <span>{`${t.year}: ${selectedMedia.year}`}</span> <span>{`${t.rating}: ${selectedMedia.rating} ⭐`}</span> </div> <p className="text-gray-300 mt-4 text-base leading-relaxed">{selectedMedia.overview}</p> <div className="mt-4"> <h3 className="font-semibold text-white">{t.availableOn}</h3> {selectedMedia.providers.length > 0 ? ( <div className="flex flex-wrap gap-2 mt-2"> {selectedMedia.providers.map(p => <img key={p.provider_id} src={`${TMDB_IMAGE_BASE_URL}${p.logo_path}`} alt={p.provider_name} title={p.provider_name} className="platform-logo" />)} </div> ) : <p className="text-gray-400">{t.notAvailable}</p>} </div> </div> </div> </div>)} </main>
        </div>
    );
};
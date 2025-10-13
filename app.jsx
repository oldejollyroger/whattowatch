// app.jsx - Definitive Final Version with Country Selector Fix

// --- Custom Hooks ---
const useDebounce = (value, delay) => { const { useState, useEffect } = React; const [debouncedValue, setDebouncedValue] = useState(value); useEffect(() => { const handler = setTimeout(() => setDebouncedValue(value), delay); return () => clearTimeout(handler); }, [value, delay]); return debouncedValue; };
const useLocalStorage = (key, initialValue) => { const { useState } = React; const [storedValue, setStoredValue] = useState(() => { try { const item = window.localStorage.getItem(key); return item ? JSON.parse(item) : initialValue; } catch (error) { return initialValue; }}); const setValue = (value) => { try { const v = value instanceof Function ? value(storedValue) : value; setStoredValue(v); window.localStorage.setItem(key, JSON.stringify(v)); } catch (e) { console.error(e); }}; return [storedValue, setValue]; };

// --- Helper Functions ---
const getSeasonalGenres = () => { const month = new Date().getMonth(); if (month === 9) return [{id: '27', name: 'Horror'}, {id: '9648', name: 'Mystery'}, {id: '53', name: 'Thriller'}]; if (month === 11) return [{id: '10751', name: 'Family'}, {id: '35', name: 'Comedy'}, {id: '10749', name: 'Romance'}]; if (month === 1) return [{id: '10749', name: 'Romance'}, {id: '35', name: 'Comedy'}]; return [{id:'28', name:'Action'}, {id:'878', name:'Sci-Fi'}, {id:'18', name:'Drama'}]; };


// --- Reusable UI Components (All component definitions go here first) ---
const UserListModal = ({ title, items, onRemove, onClose }) => { /* ... Paste full component code here ... */ };
const TrailerModal = ({ trailerKey, onClose }) => { /* ... Paste full component code here ... */ };
const ActorDetailsModal = ({ actor, onClose }) => { /* ... Paste full component code here ... */ };
const SettingsMenu = ({ onCountryChange, onSelectTheme, currentTheme, displayMode, onDisplayModeChange, onOpenWatched, onOpenWatchlist, t }) => { /* ... Paste full component code here ... */ };
const SearchBar = ({ onSearch, onResultClick, searchResults }) => { /* ... Paste full component code here ... */ };
const CountrySelector = ({ countries, onSelect, t }) => { const [searchTerm, setSearchTerm] = React.useState(''); const filteredCountries = countries.filter(c => c.english_name.toLowerCase().includes(searchTerm.toLowerCase())); return ( <div className="modal-overlay"><div className="country-selector-modal"><div className="p-4 border-b border-[var(--color-card-border)]"><h2 className="text-xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)]">{t.selectCountry}</h2><input type="text" placeholder={t.searchCountry} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-3 mt-4 rounded-lg bg-gray-700/50 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500" /></div><div className="country-list">{ (searchTerm.length > 0 || countries.length < 15) && filteredCountries.map(c => (<button key={c.iso_3166_1} onClick={() => onSelect(c.iso_3166_1)} className="country-list-item">{c.english_name}</button>))}</div></div></div>);};
const FilterModal = ({ isOpen, onClose, allGenres, allPlatforms, filters, onFilterChange, onClearFilters }) => { /* ... Paste full component code here ... */ };


// --- Main App Component ---
const App = () => {
    const { useState, useEffect, useCallback } = React;
    const [userRegion, setUserRegion] = useLocalStorage('whattowatch_userRegion', null);
    const [mediaType, setMediaType] = useState('movie');
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [appStatus, setAppStatus] = useState('loading'); // 'loading', 'ready', 'error'
    const [isDiscovering, setIsDiscovering] = useState(false);
    const [error, setError] = useState(null);
    const [availableRegions, setAvailableRegions] = useState([]);
    const [displayMode, setDisplayMode] = useLocalStorage('whattowatch_displayMode', 'dark');
    const [accent, setAccent] = useLocalStorage('whattowatch_accent', ACCENT_COLORS[0]);
    const [filters, setFilters] = useLocalStorage('whattowatch_filters_v4', { quickGenre: '', includeGenres: [], excludeGenres: [], platforms: [], indie: false });
    const [allGenres, setAllGenres] = useState([]);
    const [allPlatforms, setAllPlatforms] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [modal, setModal] = useState({ type: null, data: null });
    const [watchedList, setWatchedList] = useLocalStorage('whattowatch_watched', {});
    const [watchList, setWatchList] = useLocalStorage('whattowatch_watchlist', {});
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    
    const t = translations['en'];

    // ... All useEffects and handlers are here, unchanged from the previous complete version ...
    // Theme effect
    useEffect(() => { document.documentElement.className = displayMode === 'dark' ? 'dark-mode' : 'light-mode'; /* ... rest of theme logic ... */ }, [displayMode, accent]);
    
    // API and Data Processing
    const fetchApi = useCallback(async (path, params = {}) => { /* ... */ }, []);
    const processMediaDetails = useCallback((d, mt, rg) => { /* ... */ }, []);

    // Initial Data Fetch
    useEffect(() => { setAppStatus('loading'); fetchApi('configuration/countries').then(data => { setAvailableRegions(data.filter(c => TOP_COUNTRIES.includes(c.iso_3166_1)).sort((a,b) => a.english_name.localeCompare(b.english_name))); setAppStatus('ready'); }).catch(err => { setError(err.message); setAppStatus('error'); }); }, [fetchApi]);
    useEffect(() => { if (!userRegion) { setAllGenres([]); setAllPlatforms([]); return; } const fetchData = async () => { try { const [g, p] = await Promise.all([fetchApi(`genre/${mediaType}/list`), fetchApi(`watch/providers/${mediaType}`, { watch_region: userRegion })]); setAllGenres(g.genres || []); setAllPlatforms(p.results || []); } catch (err) { setError("Could not load data."); }}; fetchData(); }, [userRegion, mediaType, fetchApi]);

    // Handlers
    const handleChangeCountry = () => setUserRegion(null);
    const handleToggleWatched = (media) => setWatchedList(p => { const n = {...p}; if(n[media.id]) delete n[media.id]; else n[media.id] = {id:media.id, title:media.title, year:media.year, poster:media.poster}; return n; });
    const handleToggleWatchlist = (media) => setWatchList(p => { const n = {...p}; if(n[media.id]) delete n[media.id]; else n[media.id] = {id:media.id, title:media.title, year:media.year, poster:media.poster}; return n; });
    const handleClearFilters = () => setFilters({ quickGenre: '', includeGenres: [], excludeGenres: [], platforms: [], indie: false });

    // Surprise Me (Corrected version)
    const handleSurpriseMe = useCallback(async () => {
        setIsDiscovering(true); setError(null); setSelectedMedia(null);
        try {
            const params = {'sort_by': 'popularity.desc', 'watch_region': userRegion, 'with_watch_monetization_types': 'flatrate', 'vote_count.gte': filters.indie ? 10 : 250 };
            const genresToInclude = [filters.quickGenre, ...filters.includeGenres].filter(Boolean).join(',');
            if (genresToInclude) params['with_genres'] = genresToInclude;
            if (filters.excludeGenres.length) params['without_genres'] = filters.excludeGenres.join(',');
            if (filters.platforms.length) params['with_watch_providers'] = filters.platforms.join('|');
            const data = await fetchApi(`discover/${mediaType}`, params); const totalPages = Math.min(data.total_pages, 500); if (totalPages === 0) throw new Error(t.noResults);
            const pageData = await fetchApi(`discover/${mediaType}`, {...params, page: Math.floor(Math.random()*totalPages)+1}); const results = pageData.results.filter(r => r.poster_path && !watchedList[r.id]);
            if (results.length === 0) { const altData = await fetchApi(`discover/${mediaType}`, {...params, page: 1}); if (altData.results.length === 0) throw new Error("No results found."); setSelectedMedia(processMediaDetails(altData.results[0], mediaType, userRegion)); return; }
            const randomResult = results[Math.floor(Math.random() * results.length)]; const details = await fetchApi(`${mediaType}/${randomResult.id}`, { append_to_response: 'videos,credits,similar,watch/providers,release_dates' });
            setSelectedMedia(processMediaDetails(details, mediaType, userRegion));
        } catch (err) { setError(err.message); } finally { setIsDiscovering(false); }
    }, [mediaType, userRegion, filters, watchedList, fetchApi, processMediaDetails, t]);

    // Search and Actor Click handlers are unchanged
    const handleSearch = useCallback(async (q) => { /* ... */ }, [fetchApi]);
    const handleResultClick = useCallback(async (res) => { /* ... */ }, [fetchApi, userRegion, processMediaDetails]);
    const handleActorClick = useCallback(async (id) => { /* ... */ }, [fetchApi]);
    
    // --- Render Logic (THE CRITICAL FIX IS HERE) ---
    
    if (appStatus === 'loading') {
        return <div className="min-h-screen flex items-center justify-center"><div className="loader"></div></div>;
    }
    
    if (appStatus === 'error') {
        return ( <div className="min-h-screen flex items-center justify-center p-4"><div className="w-full max-w-md text-center bg-red-900/50 border border-red-700 p-6 rounded-lg"><h1 className="text-2xl font-bold text-white mb-2">Application Error</h1><p className="text-red-200">{error}</p></div></div>);
    }
    
    // **CORRECTED LOGIC:** If the app is ready but the user region is not set, ALWAYS show the selector.
    if (appStatus === 'ready' && !userRegion) {
        return <CountrySelector countries={availableRegions} onSelect={setUserRegion} t={t} />;
    }
    
    // If we get here, it means the app is ready and a region is selected. Render the main application.
    return (
        <div className="container mx-auto max-w-4xl p-4 sm:p-6">
            <header className="app-header">
                <div className="app-title-container">
                    <h1 className="app-title">{t.title}</h1>
                    <p className="app-subtitle">{t.subtitle}</p>
                </div>
                <div className="header-actions">
                    <SearchBar onSearch={handleSearch} searchResults={searchResults} onResultClick={handleResultClick} />
                    <SettingsMenu t={t} currentTheme={accent} onSelectTheme={setAccent} onCountryChange={handleChangeCountry} displayMode={displayMode} onDisplayModeChange={setDisplayMode} onOpenWatched={() => setModal({type:'watched'})} onOpenWatchlist={() => setModal({type:'watchlist'})}/>
                </div>
            </header>
            
            <main className="text-center">
                <div className="flex flex-col md:flex-row justify-center items-center gap-4 my-6">
                    <div className="inline-flex p-1 rounded-full media-type-switcher">
                        <button onClick={() => setMediaType('movie')} className={`px-5 py-2 text-sm rounded-full media-type-btn ${mediaType === 'movie' ? 'media-type-btn-active' : ''}`}>{t.movies}</button>
                        <button onClick={() => setMediaType('tv')} className={`px-5 py-2 text-sm rounded-full media-type-btn ${mediaType === 'tv' ? 'media-type-btn-active' : ''}`}>{t.tvShows}</button>
                    </div>
                    <button onClick={() => setIsFilterModalOpen(true)} className="filter-btn">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                        Filters
                    </button>
                    <button onClick={handleSurpriseMe} disabled={isDiscovering} className="w-full md:w-auto px-8 py-3 text-lg font-bold text-white rounded-full surprise-me-btn disabled:opacity-50 disabled:cursor-not-allowed">
                        {isDiscovering ? 'Searching...' : 'Surprise Me!'}
                    </button>
                </div>

                {/* All main content and modals go here as before */}
                
            </main>

            {/* Render modals based on state */}
            {isFilterModalOpen && <FilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} allGenres={allGenres} allPlatforms={allPlatforms} filters={filters} onFilterChange={setFilters} onClearFilters={handleClearFilters} />}
            {modal.type === 'trailer' && <TrailerModal trailerKey={modal.data} onClose={() => setModal({type:null})} />}
            {modal.type === 'actor' && <ActorDetailsModal actor={modal.data} onClose={() => setModal({type:null})} />}
            {modal.type === 'watched' && <UserListModal title="My Watched List" items={Object.values(watchedList)} onRemove={(id) => handleToggleWatched({id})} onClose={()=>setModal({type:null})} />}
            {modal.type === 'watchlist' && <UserListModal title="My Watchlist" items={Object.values(watchList)} onRemove={(id) => handleToggleWatchlist({id})} onClose={()=>setModal({type:null})} />}
        </div>
    );
};
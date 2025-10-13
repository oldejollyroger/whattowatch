// app.jsx - Definitive, Standalone, Feature-Complete Version

// --- Custom Hooks ---
const useDebounce = (value, delay) => {
    const { useState, useEffect } = React;
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => { const handler = setTimeout(() => setDebouncedValue(value), delay); return () => clearTimeout(handler); }, [value, delay]);
    return debouncedValue;
};

const useLocalStorage = (key, initialValue) => {
    const { useState } = React;
    const [storedValue, setStoredValue] = useState(() => { try { const item = window.localStorage.getItem(key); return item ? JSON.parse(item) : initialValue; } catch (error) { return initialValue; }});
    const setValue = (value) => { try { const valueToStore = value instanceof Function ? value(storedValue) : value; setStoredValue(valueToStore); window.localStorage.setItem(key, JSON.stringify(valueToStore)); } catch (error) { console.error(error); }};
    return [storedValue, setValue];
};

// --- Reusable UI Components ---

const UserListModal = ({ title, items, onRemove, onClose }) => (
    <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content relative w-full max-w-xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-[var(--color-card-border)] flex justify-between items-center">
                <h2 className="text-xl font-bold text-[var(--color-accent-text)]">{title}</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto">
                {items.length > 0 ? items.map(item => (
                    <div key={item.id} className="user-list-item">
                        <img src={item.poster ? `${TMDB_IMAGE_BASE_URL}${item.poster}` : 'https://via.placeholder.com/96x144.png?text=?'} alt={item.title} />
                        <div className="user-list-item-info">
                            <div className="user-list-item-title">{item.title}</div>
                            <div className="user-list-item-year">{item.year}</div>
                        </div>
                        <button onClick={() => onRemove(item.id)} className="user-list-remove-btn">Remove</button>
                    </div>
                )) : <p className="text-center text-gray-400">This list is empty.</p>}
            </div>
        </div>
    </div>
);

const TrailerModal = ({ trailerKey, onClose }) => {
    if (!trailerKey) return null;
    return ( <div className="modal-overlay" onClick={onClose}> <div className="relative w-full max-w-4xl" onClick={e => e.stopPropagation()}> <button onClick={onClose} className="modal-close-btn text-white"> <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> </button> <div className="trailer-responsive"> <iframe src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`} frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen title="Movie Trailer"></iframe> </div> </div> </div>);
};

const ActorDetailsModal = ({ actor, onClose }) => {
    if (!actor) return null;
    const knownFor = [...(actor.movie_credits?.cast || []), ...(actor.tv_credits?.cast || [])].filter(item => item.poster_path).sort((a, b) => b.popularity - a.popularity).slice(0, 10);
    return ( <div className="modal-overlay" onClick={onClose}> <div className="modal-content relative w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}> <button onClick={onClose} className="modal-close-btn text-white"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button> <div className="overflow-y-auto"> <div className="p-6 md:flex md:space-x-8"> <div className="md:w-1/3 flex-shrink-0 text-center"><img src={actor.profile_path ? `${TMDB_IMAGE_BASE_URL}${actor.profile_path}` : 'https://via.placeholder.com/500x750.png?text=No+Image'} alt={actor.name} className="rounded-lg shadow-lg w-2/3 md:w-full mx-auto" /></div> <div className="mt-4 md:mt-0 md:w-2/3"><h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)]">{actor.name}</h2><p className="mt-4 text-base leading-relaxed max-h-60 overflow-y-auto">{actor.biography || "No biography available."}</p></div> </div> {knownFor.length > 0 && (<div className="p-6 border-t border-[var(--color-card-border)]"><h3 className="text-xl font-semibold mb-4 text-[var(--color-accent-text)]">Known For</h3><div className="horizontal-scroll-container">{knownFor.map(item => (<div key={item.credit_id || item.id} className="flex-shrink-0 w-32 text-center"><img src={`${TMDB_IMAGE_BASE_URL}${item.poster_path}`} alt={item.title || item.name} className="rounded-lg" /><span className="block mt-2 text-xs text-gray-400">{item.title || item.name}</span></div>))}</div></div>)}</div> </div> </div>);
};

const SettingsMenu = ({ onCountryChange, onSelectTheme, currentTheme, displayMode, onDisplayModeChange, onOpenWatched, onOpenWatchlist }) => {
    const { useState, useEffect, useRef } = React; const [isOpen, setIsOpen] = useState(false); const dropdownRef = useRef(null);
    useEffect(() => { const handleClickOutside = (event) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false); }; document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside); }, []);
    return ( <div ref={dropdownRef} className="settings-menu-container"> <button onClick={() => setIsOpen(!isOpen)} className="theme-toggle" title="Settings"> <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> </button> {isOpen && ( <div className="settings-dropdown"> <div className="space-y-4">
        <div> <h4 className="text-sm font-semibold text-gray-400 mb-2">Accent Color</h4> <div className="flex items-center justify-around bg-gray-700/50 p-2 rounded-full border border-gray-600"> {ACCENT_COLORS.map(c => ( <button key={c.name} onClick={() => onSelectTheme(c)} className={`w-6 h-6 rounded-full transition-transform duration-150 transform hover:scale-110`} style={{ backgroundColor: c.color }} title={c.name}> {currentTheme.name === c.name && <svg className="w-6 h-6 text-white p-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>} </button>))} </div> </div>
        <div> <h4 className="text-sm font-semibold text-gray-400 mb-2">Display Mode</h4> <div className="flex items-center p-1 rounded-full bg-gray-700/50 border border-gray-600"> <button onClick={() => onDisplayModeChange('light')} className={`w-1/2 py-1 text-sm rounded-full ${displayMode === 'light' ? 'bg-white text-black' : 'text-gray-300'}`}>Light</button> <button onClick={() => onDisplayModeChange('dark')} className={`w-1/2 py-1 text-sm rounded-full ${displayMode === 'dark' ? 'bg-[var(--color-accent)] text-white' : 'text-gray-300'}`}>Dark</button> </div> </div>
        <div className="space-y-2 pt-2 border-t border-[var(--color-card-border)]">
            <button onClick={() => { onOpenWatchlist(); setIsOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-300 rounded-lg hover:bg-gray-700/50 transition">My Watchlist</button>
            <button onClick={() => { onOpenWatched(); setIsOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-300 rounded-lg hover:bg-gray-700/50 transition">Watched List</button>
            <button onClick={() => { onCountryChange(); setIsOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-300 rounded-lg hover:bg-gray-700/50 transition">Change Country</button>
        </div>
    </div> </div>)} </div>);
};

const SearchBar = ({ onSearch, onResultClick, searchResults }) => { const { useState, useEffect, useRef } = React; const [query, setQuery] = useState(''); const debouncedQuery = useDebounce(query, 300); const searchRef = useRef(null); const [isFocused, setIsFocused] = useState(false); useEffect(() => { onSearch(debouncedQuery); }, [debouncedQuery, onSearch]); useEffect(() => { const handleClickOutside = (event) => { if (searchRef.current && !searchRef.current.contains(event.target)) setIsFocused(false); }; document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside); }, []); const handleResultItemClick = (result) => { setQuery(''); setIsFocused(false); onResultClick(result); }; return ( <div ref={searchRef} className="search-container"> <div className="search-icon"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></div> <input type="text" placeholder="Search for a movie or TV show..." value={query} onChange={(e) => setQuery(e.target.value)} onFocus={() => setIsFocused(true)} className="search-input" /> {isFocused && searchResults.length > 0 && ( <div className="search-results-dropdown">{searchResults.map(result => ( <div key={result.id} className="search-result-item" onClick={() => handleResultItemClick(result)}><img src={result.poster} alt={result.title} /><div className="search-result-info"><span className="search-result-title">{result.title}</span><span className="search-result-year">{result.year}</span></div></div>))}</div>)}</div>);};

const AdvancedFilters = ({ genres, platforms, filters, onFilterChange }) => { const { useState, useRef } = React; const [isOpen, setIsOpen] = useState(false); const [platformSearch, setPlatformSearch] = useState(''); const contentRef = useRef(null); const handleGenreChange = (g, t) => { const c = filters[t]; const n = c.includes(g)?c.filter(id=>id!==g):[...c, g]; const oT = t === 'includeGenres' ? 'excludeGenres' : 'includeGenres'; const oL = filters[oT].filter(id=>id!==g); onFilterChange({...filters, [t]:n, [oT]: oL});}; const handlePlatformChange = (p) => { onFilterChange({...filters, platforms:filters.platforms.includes(p)?filters.platforms.filter(id=>id!==p):[...filters.platforms,p]});}; const handleIndieChange = () => onFilterChange({...filters, indie: !filters.indie}); const filteredPlatforms = platforms.filter(p => p.provider_name.toLowerCase().includes(platformSearch.toLowerCase())); return ( <div className="advanced-filters-container max-w-2xl mx-auto"> <button onClick={() => setIsOpen(!isOpen)} className="w-full text-lg font-bold flex justify-between items-center text-[var(--color-accent-text)]"><span>Advanced Filters</span><span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180':''}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></span></button> <div ref={contentRef} style={{maxHeight: isOpen ? `${contentRef.current.scrollHeight}px` : '0px'}} className="filters-content"><div className="filter-grid pt-4 border-t border-[var(--color-card-border)] mt-4"> <div className="filter-section"><h4 className="font-semibold mb-2">Include Genres</h4><div className="filter-list">{genres.map(g=>(<label key={`inc-${g.id}`} className={`filter-label ${filters.excludeGenres.includes(g.id)?'disabled':''}`}><input type="checkbox" className="filter-custom-input" checked={filters.includeGenres.includes(g.id)} disabled={filters.excludeGenres.includes(g.id)} onChange={()=>handleGenreChange(g.id, 'includeGenres')} />{g.name}</label>))}</div></div> <div className="filter-section"><h4 className="font-semibold mb-2">Exclude Genres</h4><div className="filter-list">{genres.map(g=>(<label key={`exc-${g.id}`} className={`filter-label ${filters.includeGenres.includes(g.id)?'disabled':''}`}><input type="checkbox" className="filter-custom-input" checked={filters.excludeGenres.includes(g.id)} disabled={filters.includeGenres.includes(g.id)} onChange={()=>handleGenreChange(g.id, 'excludeGenres')} />{g.name}</label>))}</div></div> <div className="filter-section"><h4 className="font-semibold mb-2">Platforms</h4><input type="text" placeholder="Search platforms..." value={platformSearch} onChange={(e)=>setPlatformSearch(e.target.value)} className="platform-search-input" /><div className="filter-list">{filteredPlatforms.map(p=>(<label key={p.provider_id} className="filter-label"><input type="checkbox" className="filter-custom-input" checked={filters.platforms.includes(p.provider_id)} onChange={()=>handlePlatformChange(p.provider_id)} />{p.provider_name}</label>))}</div></div></div><div className="pt-4 mt-4 border-t border-[var(--color-card-border)]"><label className="filter-label"><input type="checkbox" className="filter-custom-input" checked={filters.indie} onChange={handleIndieChange} />Search for Indie Films (fewer votes)</label></div></div></div>);};

const GenreFilters = ({ mediaType, currentGenre, onGenreSelect }) => { const quickGenres = (mediaType === 'movie') ? [ { id: '28', name: 'Action' }, { id: '35', name: 'Comedy' }, { id: '878', name: 'Sci-Fi' }, { id: '27', name: 'Horror' }, { id: '10749', name: 'Romance' } ] : [ { id: '10759', name: 'Action' }, { id: '35', name: 'Comedy' }, { id: '99', name: 'Documentary' }, { id: '18', name: 'Drama' }, { id: '10765', 'name': 'Sci-Fi' } ]; return ( <div className="w-full max-w-2xl mx-auto mb-4"><h3 className="px-1 text-sm font-semibold text-gray-400 mb-2 text-left">Quick Genre Filters</h3><div className="horizontal-scroll-container"> {quickGenres.map(genre => ( <button key={genre.id} onClick={() => onGenreSelect(genre.id)} className={`quick-filter-btn px-4 py-1.5 text-sm ${currentGenre === genre.id ? 'quick-filter-btn-active' : ''}`}>{genre.name}</button>))}</div></div>);};

const CountrySelector = ({ countries, onSelect, t }) => { const [searchTerm, setSearchTerm] = React.useState(''); const filteredCountries = countries.filter(c => c.english_name.toLowerCase().includes(searchTerm.toLowerCase())); return ( <div className="modal-overlay"> <div className="country-selector-modal"> <div className="p-4 border-b border-[var(--color-card-border)]"><h2 className="text-xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">{t.selectCountry}</h2> <input type="text" placeholder={t.searchCountry} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-3 mt-4 rounded-lg bg-gray-700/50 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500" /></div><div className="country-list">{filteredCountries.map(c => ( <button key={c.iso_3166_1} onClick={() => onSelect(c.iso_3166_1)} className="country-list-item">{c.english_name}</button>))}</div></div></div>);};

const App = () => {
    const { useState, useEffect, useCallback } = React;
    const [userRegion, setUserRegion] = useLocalStorage('whattowatch_userRegion', null);
    const [mediaType, setMediaType] = useState('movie');
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [appStatus, setAppStatus] = useState('loading');
    const [isDiscovering, setIsDiscovering] = useState(false);
    const [error, setError] = useState(null);
    const [availableRegions, setAvailableRegions] = useState([]);
    const [displayMode, setDisplayMode] = useLocalStorage('whattowatch_displayMode', 'dark');
    const [accent, setAccent] = useLocalStorage('whattowatch_accent', ACCENT_COLORS[0]);
    const [filters, setFilters] = useLocalStorage('whattowatch_filters_v3', { quickGenre: '', includeGenres: [], excludeGenres: [], platforms: [], indie: false });
    const [allGenres, setAllGenres] = useState([]);
    const [allPlatforms, setAllPlatforms] = useState([]);
    const [quickPlatforms, setQuickPlatforms] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [modal, setModal] = useState({ type: null, data: null });
    const [watchedList, setWatchedList] = useLocalStorage('whattowatch_watched', {});
    const [watchList, setWatchList] = useLocalStorage('whattowatch_watchlist', {});

    const t = translations['en'];

    useEffect(() => { document.documentElement.className = displayMode === 'dark' ? 'dark-mode' : 'light-mode'; const r = document.documentElement; r.style.setProperty('--color-accent', accent.color); r.style.setProperty('--color-accent-text', accent.text); r.style.setProperty('--color-accent-gradient-from', accent.from); r.style.setProperty('--color-accent-gradient-to', accent.to); const h = (c) => { const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(c); return r ? {r:parseInt(r[1],16), g:parseInt(r[2],16), b:parseInt(r[3],16)}:null;}; const rgb = h(accent.color); if(rgb) r.style.setProperty('--color-accent-rgb', `${rgb.r},${rgb.g},${rgb.b}`);}, [displayMode, accent]);

    const fetchApi = useCallback(async (path, params = {}) => { if (!TMDB_API_KEY || TMDB_API_KEY === 'YOUR_API_KEY_HERE') throw new Error("API Key is missing!"); const q = new URLSearchParams({ api_key: TMDB_API_KEY, ...params }); const r = await fetch(`${TMDB_BASE_URL}/${path}?${q}`); if (!r.ok) { const d = await r.json(); throw new Error(d.status_message); } return r.json(); }, []);
    const processMediaDetails = useCallback((d, mt, rg) => { const tr = d.videos?.results?.find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')); const ri = d.release_dates?.results?.find(r => r.iso_3166_1 === rg); const ce = ri?.release_dates[0]?.certification || ''; const di = d.credits?.crew?.find(c => c.job === 'Director'); return { id:d.id, title:d.title||d.name, year:(d.release_date||d.first_air_date||'N/A').substring(0,4), poster:d.poster_path, rating:d.vote_average?.toFixed(1)||'N/A', overview:d.overview, providers:d['watch/providers']?.results?.[rg]?.flatrate||[], cast:d.credits?.cast?.slice(0,10)||[], similar:d.similar?.results?.filter(s=>s.poster_path).slice(0,10).map(s=>({...s,mediaType:mt}))||[], trailerKey:tr?tr.key:null, mediaType:mt, director:di?.name, duration:d.runtime, certification:ce }; }, []);
    
    useEffect(() => { setAppStatus('loading'); fetchApi('configuration/countries').then(data => { setAvailableRegions(data.filter(c => TOP_COUNTRIES.includes(c.iso_3166_1)).sort((a,b) => a.english_name.localeCompare(b.english_name))); setAppStatus('ready'); }).catch(err => { setError(err.message); setAppStatus('error'); }); }, [fetchApi]);
    useEffect(() => { if (!userRegion) { setAllGenres([]); setAllPlatforms([]); setQuickPlatforms([]); return; } const fetchData = async () => { try { const [g, p] = await Promise.all([fetchApi(`genre/${mediaType}/list`), fetchApi(`watch/providers/${mediaType}`, { watch_region: userRegion })]); setAllGenres(g.genres || []); const allP = p.results || []; setAllPlatforms(allP); setQuickPlatforms(allP.sort((a,b) => (a.display_priority ?? 99) - (b.display_priority ?? 99)).slice(0, 6)); } catch (err) { setError("Could not load data."); }}; fetchData(); }, [userRegion, mediaType, fetchApi]);
    
    const handleChangeCountry = () => setUserRegion(null);
    const handleToggleWatched = (media) => setWatchedList(prev => { const n = {...prev}; if(n[media.id]) delete n[media.id]; else n[media.id] = {id:media.id, title:media.title, year:media.year, poster:media.poster}; return n; });
    const handleToggleWatchlist = (media) => setWatchList(prev => { const n = {...prev}; if(n[media.id]) delete n[media.id]; else n[media.id] = {id:media.id, title:media.title, year:media.year, poster:media.poster}; return n; });

    const handleSurpriseMe = useCallback(async () => {
        setIsDiscovering(true); setError(null); setSelectedMedia(null);
        try {
            const genresToInclude = [filters.quickGenre, ...filters.includeGenres].filter(Boolean).join(',');
            const discoverParams = {'sort_by': 'popularity.desc', 'watch_region': userRegion, 'with_watch_monetization_types': 'flatrate', 'vote_count.gte': filters.indie ? 10 : 250 };
            if (genresToInclude) discoverParams['with_genres'] = genresToInclude; if (filters.excludeGenres.length) discoverParams['without_genres'] = filters.excludeGenres.join(','); if (filters.platforms.length) discoverParams['with_watch_providers'] = filters.platforms.join('|');
            const data = await fetchApi(`discover/${mediaType}`, discoverParams); const totalPages = Math.min(data.total_pages, 500); if (totalPages === 0) throw new Error(t.noResults);
            const pageData = await fetchApi(`discover/${mediaType}`, {...discoverParams, page: Math.floor(Math.random()*totalPages)+1}); const results = pageData.results.filter(r => r.poster_path && !watchedList[r.id]);
            if (results.length === 0) throw new Error("No new results found. Try changing filters or clearing your watched list.");
            const randomResult = results[Math.floor(Math.random() * results.length)];
            const details = await fetchApi(`${mediaType}/${randomResult.id}`, { append_to_response: 'videos,credits,similar,watch/providers,release_dates' });
            setSelectedMedia(processMediaDetails(details, mediaType, userRegion));
        } catch (err) { setError(err.message); } finally { setIsDiscovering(false); }
    }, [mediaType, userRegion, fetchApi, t, filters, processMediaDetails, watchedList]);

    const handleSearch = useCallback(async (q) => { if(q.trim()==='') { setSearchResults([]); return; } try { const d = await fetchApi('search/multi', {query:q}); const f = d.results.filter(r => (r.media_type==='movie'||r.media_type==='tv')&&r.poster_path).slice(0,5).map(r=>({id:r.id,title:r.title||r.name,year:(r.release_date||r.first_air_date||'').substring(0,4),poster:r.poster_path,mediaType:r.media_type})); setSearchResults(f); } catch (e) { console.error("Search failed:", e); }}, [fetchApi]);
    const handleResultClick = useCallback(async (res) => { setError(null); setSelectedMedia(null); setIsDiscovering(true); try { const det = await fetchApi(`${res.mediaType}/${res.id}`, {append_to_response:'videos,credits,similar,watch/providers,release_dates'}); setSelectedMedia(processMediaDetails(det, res.mediaType, userRegion)); } catch(e) { setError("Could not fetch details."); } finally { setIsDiscovering(false); }}, [fetchApi, userRegion, processMediaDetails]);
    const handleActorClick = useCallback(async (id) => { try { setModal({type:'actor', data:null}); const det = await fetchApi(`person/${id}`, {append_to_response:'movie_credits,tv_credits'}); setModal({type:'actor', data:det}); } catch (e) { setModal({type:null, data:null}); }}, [fetchApi]);

    if (appStatus === 'loading' || (appStatus === 'ready' && availableRegions.length === 0 && !userRegion)) { return <div className="min-h-screen flex items-center justify-center"><div className="loader"></div></div>; }
    if (appStatus === 'error') { return ( <div className="min-h-screen flex items-center justify-center p-4"> <div className="w-full max-w-md text-center bg-red-900/50 border border-red-700 p-6 rounded-lg"> <h1 className="text-2xl font-bold text-white mb-2">Application Error</h1> <p className="text-red-200">{error}</p></div> </div>); }
    if (appStatus === 'ready' && !userRegion) { return <CountrySelector countries={availableRegions} onSelect={setUserRegion} t={t} />; }
    
    return (
        <div className="container mx-auto max-w-4xl p-4 sm:p-6 text-center">
            <div className="absolute top-4 right-4"><SettingsMenu t={t} currentTheme={accent} onSelectTheme={setAccent} onCountryChange={handleChangeCountry} displayMode={displayMode} onDisplayModeChange={setDisplayMode} onOpenWatched={() => setModal({type:'watched'})} onOpenWatchlist={() => setModal({type:'watchlist'})}/></div>
            <header className="mb-4 pt-16"><h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)]">{t.title}</h1><p className="text-lg text-[var(--color-text-secondary)] mt-2">{t.subtitle}</p><div className="mt-6 inline-flex p-1 rounded-full media-type-switcher"><button onClick={() => setMediaType('movie')} className={`px-5 py-2 text-sm rounded-full media-type-btn ${mediaType === 'movie' ? 'media-type-btn-active' : ''}`}>{t.movies}</button><button onClick={() => setMediaType('tv')} className={`px-5 py-2 text-sm rounded-full media-type-btn ${mediaType === 'tv' ? 'media-type-btn-active' : ''}`}>{t.tvShows}</button></div></header>
            <SearchBar onSearch={handleSearch} searchResults={searchResults.map(r=>({...r, poster: `${TMDB_IMAGE_BASE_URL}${r.poster}`}))} onResultClick={handleResultClick} />
            <div className="text-center my-4 text-[var(--color-text-secondary)] font-semibold">— OR —</div>
            <GenreFilters mediaType={mediaType} currentGenre={filters.quickGenre} onGenreSelect={(genreId) => setFilters(f => ({...f, quickGenre:f.quickGenre===genreId?'':genreId}))} />
            {quickPlatforms.length > 0 && <div className="w-full max-w-2xl mx-auto mb-8"><h3 className="px-1 text-sm font-semibold text-gray-400 mb-2 text-left">Popular Platforms</h3><div className="horizontal-scroll-container">{quickPlatforms.map(p=>(<button key={p.provider_id} onClick={()=> setFilters(f=>({...f, platforms: f.platforms.includes(p.provider_id) ? [] : [p.provider_id]}))} className={`quick-filter-btn px-4 py-1.5 text-sm ${filters.platforms.includes(p.provider_id)?'quick-filter-btn-active':''}`}>{p.provider_name}</button>))}</div></div>}
            <AdvancedFilters genres={allGenres} platforms={allPlatforms} filters={filters} onFilterChange={setFilters} />
            <button onClick={handleSurpriseMe} disabled={isDiscovering} className="w-full max-w-xs px-8 py-4 text-lg font-bold text-white rounded-full surprise-me-btn disabled:opacity-50 disabled:cursor-not-allowed">{isDiscovering ? t.searching : t.surpriseMe}</button>
            {error && !selectedMedia && <p className="text-red-400 mt-4">{error}</p>}
            <main className="mt-8">
                {isDiscovering && <div className="loader mx-auto"></div>}
                {selectedMedia && !isDiscovering && ( <div className="w-full container-style p-6 text-left movie-card-enter"> <div className="sm:flex sm:space-x-8"> <div className="sm:w-1/3 flex-shrink-0"> <img src={selectedMedia.poster} alt={`Poster for ${selectedMedia.title}`} className="rounded-lg shadow-lg w-full" /> {selectedMedia.trailerKey && (<button onClick={()=>setModal({type:'trailer', data: selectedMedia.trailerKey})} className="card-action-btn trailer-btn mt-4"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>Watch Trailer</button>)}
                    <div className="card-user-actions">
                        <button onClick={() => handleToggleWatched(selectedMedia)} className={`user-action-btn watch-btn ${watchedList[selectedMedia.id] ? 'active':''}`}> <svg fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C3.732 4.943 9.522 3 10 3s6.268 1.943 9.542 7c-3.274 5.057-9.064 7-9.542 7S3.732 15.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg> {watchedList[selectedMedia.id] ? 'Watched' : 'Watched?'} </button>
                        <button onClick={() => handleToggleWatchlist(selectedMedia)} className={`user-action-btn watchlist-btn ${watchList[selectedMedia.id] ? 'active':''}`}> <svg fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-3.13L5 18V4z" /></svg> {watchList[selectedMedia.id] ? 'Saved' : 'Save'} </button>
                    </div>
                </div> <div className="mt-4 sm:mt-0 flex-grow"> <h2 className="text-3xl font-bold">{selectedMedia.title}</h2> <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-[var(--color-text-secondary)] mt-1"> <span>{selectedMedia.year}</span> {selectedMedia.certification && <span className="border border-[var(--color-card-border)] px-2 py-0.5 rounded text-xs">{selectedMedia.certification}</span>} {selectedMedia.duration > 0 && <span>{Math.floor(selectedMedia.duration / 60)}h {selectedMedia.duration % 60}m</span>} <span>⭐ {selectedMedia.rating}</span> </div> <p className="mt-4 text-base leading-relaxed">{selectedMedia.overview}</p> {selectedMedia.director && <p className="mt-4"><span className="font-semibold text-gray-400">Director:</span> {selectedMedia.director}</p>}
                <div className="mt-6"><h3 className="font-semibold">Available on</h3>{selectedMedia.providers.length > 0 ? ( <div className="flex flex-wrap gap-2 mt-2"> {selectedMedia.providers.map(p => <img key={p.provider_id} src={`${TMDB_IMAGE_BASE_URL}${p.logo_path}`} alt={p.provider_name} title={p.provider_name} className="platform-logo" />)} </div> ) : <p className="text-[var(--color-text-secondary)]">{t.notAvailable}</p>} </div> </div> </div>
                {selectedMedia.cast.length > 0 && (<div className="mt-8 pt-6 border-t border-[var(--color-card-border)]"><h3 className="text-xl font-semibold mb-4 text-[var(--color-accent-text)]">Main Cast</h3><div className="horizontal-scroll-container">{selectedMedia.cast.map(actor => (<button key={actor.id} className="flex-shrink-0 w-24 text-center actor-card" onClick={() => handleActorClick(actor.id)}><img src={actor.profile_path ? `${TMDB_IMAGE_BASE_URL}${actor.profile_path}` : 'https://via.placeholder.com/200x300.png?text=?'} alt={actor.name} className="actor-thumbnail" /><span className="actor-name">{actor.name}</span></button>))}</div></div>)}
                {selectedMedia.similar.length > 0 && (<div className="mt-8 pt-6 border-t border-[var(--color-card-border)]"><h3 className="text-xl font-semibold mb-4 text-[var(--color-accent-text)]">Similar Titles</h3><div className="horizontal-scroll-container">{selectedMedia.similar.map(item => (<button key={item.id} className="flex-shrink-0 w-32 text-center actor-card" onClick={() => handleResultClick(item)}><img src={`${TMDB_IMAGE_BASE_URL}${item.poster_path}`} alt={item.title || item.name} className="rounded-lg w-full" /><span className="block mt-2 text-xs text-gray-400">{item.title || item.name}</span></button>))}</div></div>)}
            </div>)}</main>
            {modal.type === 'trailer' && <TrailerModal trailerKey={modal.data} onClose={() => setModal({type:null})} />}
            {modal.type === 'actor' && <ActorDetailsModal actor={modal.data} onClose={() => setModal({type:null})} />}
            {modal.type === 'watched' && <UserListModal title="My Watched List" items={Object.values(watchedList)} onRemove={(id)=>handleToggleWatched({id})} onClose={()=>setModal({type:null})} />}
            {modal.type === 'watchlist' && <UserListModal title="My Watchlist" items={Object.values(watchList)} onRemove={(id)=>handleToggleWatchlist({id})} onClose={()=>setModal({type:null})} />}
        </div>
    );
};
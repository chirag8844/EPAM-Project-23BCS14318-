import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

function SearchBar({ products = [] }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [recent, setRecent] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Load recent searches
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("recentSearches")) || [];
      if (Array.isArray(saved)) {
        setRecent(saved);
      }
    } catch {
      setRecent([]);
    }
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
    setActiveIndex(-1);

    if (value.trim() === "") {
      setSuggestions([]);
      return;
    }

    const filtered = products.filter((p) => {
      const text = (p.name + " " + (p.description || "")).toLowerCase();
      return text.includes(value.toLowerCase());
    });

    setSuggestions(filtered.slice(0, 8)); // Limit displayed suggestions
  };

  const handleSearch = (value) => {
    if (!value || value.trim() === "") return;

    // Save to recent
    let updated = [value, ...recent.filter((r) => r !== value)];
    updated = updated.slice(0, 6); // Max 6 recent items
    localStorage.setItem("recentSearches", JSON.stringify(updated));
    setRecent(updated);

    setQuery("");
    setIsOpen(false);
    navigate(`/products?search=${encodeURIComponent(value)}`);
    if (inputRef.current) inputRef.current.blur();
  };

  const clearHistory = (e) => {
    e.stopPropagation();
    localStorage.removeItem("recentSearches");
    setRecent([]);
    if (inputRef.current) inputRef.current.focus();
  };

  const trending = ["Mobiles", "Shoes", "T-Shirts", "Laptops", "Watches", "Headphones"];

  const buildListItems = () => {
    let items = [];
    if (!query.trim()) {
      recent.forEach(r => items.push({ type: 'recent', label: r, value: r }));
      trending.forEach(t => items.push({ type: 'trending', label: t, value: t }));
    } else {
      suggestions.forEach(s => items.push({ type: 'suggestion', label: s.name, value: s.name, price: s.price }));
    }
    return items;
  };

  const listItems = buildListItems();

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < listItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : listItems.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < listItems.length) {
        handleSearch(listItems[activeIndex].value);
      } else if (query.trim()) {
        handleSearch(query);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleInputClick = () => {
    setIsOpen(true);
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative group" ref={wrapperRef}>
      {/* 🔍 INPUT */}
      <div className="relative z-50">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={handleInputClick}
          onClick={handleInputClick}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="search-dropdown"
          aria-autocomplete="list"
          placeholder="Search for products, brands and more..."
          className="w-full pl-12 pr-6 py-3.5 rounded-full border border-gray-300 shadow-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-gray-700 text-base transition-all duration-200"
        />
        {query && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setQuery("");
              setActiveIndex(-1);
              if (inputRef.current) inputRef.current.focus();
            }}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label="Clear search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        )}
      </div>

      {/* 🔽 DROPDOWN */}
      <AnimatePresence>
        {isOpen && (listItems.length > 0 || query.trim() !== "") && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            id="search-dropdown"
            role="listbox"
            className="absolute top-[85%] left-0 w-full bg-white rounded-2xl rounded-t-none shadow-2xl pt-6 pb-2 z-40 max-h-[26rem] overflow-y-auto border border-gray-100 divide-y divide-gray-100"
          >
            {/* 🕘 RECENT SEARCHES */}
            {!query.trim() && recent.length > 0 && (
              <div className="py-2">
                <div className="px-5 py-2 flex justify-between items-center bg-white sticky top-0 z-10">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Recent Searches</span>
                  <button
                    onClick={clearHistory}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold tracking-wide focus:outline-none hover:underline"
                  >
                    Clear All
                  </button>
                </div>
                {listItems.map((item, index) => {
                  if (item.type !== 'recent') return null;
                  return (
                    <div
                      key={`recent-${index}`}
                      role="option"
                      aria-selected={activeIndex === index}
                      onClick={() => handleSearch(item.value)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`px-5 py-2.5 cursor-pointer flex items-center gap-3 transition-colors ${activeIndex === index ? "bg-gray-100 text-blue-700" : "hover:bg-gray-50 text-gray-600"
                        }`}
                    >
                      <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 🔥 TRENDING */}
            {!query.trim() && trending.length > 0 && (
              <div className="py-2">
                <div className="px-5 py-2 bg-white sticky top-0 z-10">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Trending</span>
                </div>
                {listItems.map((item, index) => {
                  if (item.type !== 'trending') return null;
                  return (
                    <div
                      key={`trending-${index}`}
                      role="option"
                      aria-selected={activeIndex === index}
                      onClick={() => handleSearch(item.value)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`px-5 py-2.5 cursor-pointer flex items-center gap-3 transition-colors ${activeIndex === index ? "bg-gray-100 text-blue-700" : "hover:bg-gray-50 text-gray-600"
                        }`}
                    >
                      <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 🔍 SUGGESTIONS */}
            {query.trim() && suggestions.length > 0 && (
              <div className="py-2">
                {listItems.map((item, index) => {
                  if (item.type !== 'suggestion') return null;
                  return (
                    <div
                      key={`suggestion-${index}`}
                      role="option"
                      aria-selected={activeIndex === index}
                      onClick={() => handleSearch(item.value)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`px-5 py-3 cursor-pointer flex justify-between items-center transition-colors ${activeIndex === index ? "bg-gray-100" : "hover:bg-gray-50 bg-white"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <svg className={`w-4 h-4 ${activeIndex === index ? 'text-blue-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        <span className={`text-base font-medium ${activeIndex === index ? 'text-blue-700' : 'text-gray-800'}`}>{item.label}</span>
                      </div>
                      {item.price && (
                        <span className="text-green-700 font-semibold text-sm bg-green-50 px-2.5 py-1 rounded-md border border-green-100">
                          ₹{item.price}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* NO RESULTS */}
            {query.trim() && suggestions.length === 0 && (
              <div className="px-5 py-8 text-center text-gray-500">
                <p className="text-sm">No results found for "<span className="font-semibold text-gray-800">{query}</span>"</p>
                <p className="text-xs text-gray-400 mt-2">Try checking the spelling or use more general terms</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SearchBar;







// const handleChange = (e) => {
//   const value = e.target.value;
//   setQuery(value);
//   setIsOpen(true);
//   setActiveIndex(-1);

//   const search = value.toLowerCase().trim();

//   // ❗ Ignore small queries
//   if (search.length < 2) {
//     setSuggestions([]);
//     return;
//   }

//   const filtered = products.filter((p) => {
//     const name = p.name.toLowerCase();

//     // 🎯 STRICT MATCHING RULES
//     return (
//       name.startsWith(search) ||                     // "iph" → iPhone
//       name.split(" ").some(word => word.startsWith(search)) // "pro" → "Macbook Pro"
//     );
//   });

//   setSuggestions(filtered.slice(0, 8));
// };
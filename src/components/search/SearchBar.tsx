'use client';

import { useState, useEffect, useRef } from 'react';
import { useCollections } from '@/hooks/useSubgraph';
import { useRouter } from 'next/navigation';
import { isAddress } from 'viem';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  // Disable polling for search - use cached data
  const { data: collectionsData } = useCollections({ first: 50, skipPolling: true });

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const collections = collectionsData?.collections || [];
    const filtered = collections.filter((collection: any) =>
      collection.name.toLowerCase().includes(query.toLowerCase())
    );

    setSuggestions(filtered.slice(0, 5));
  }, [query, collectionsData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;

    // Check if it's an address
    if (isAddress(query)) {
      router.push(`/profile/${query}`);
    } else {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
    
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (collection: any) => {
    router.push(`/collection/${collection.address}`);
    setShowSuggestions(false);
    setQuery('');
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search collections, addresses..."
          className="w-full border rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((collection: any) => (
            <button
              key={collection.id}
              onClick={() => handleSuggestionClick(collection)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2"
            >
              <span className="font-semibold">{collection.name}</span>
              {collection.verified && (
                <span className="text-blue-500 text-xs">✓ Verified</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


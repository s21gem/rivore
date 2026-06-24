import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Loader from '../components/Loader';
import { Search, Filter, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { optimizeCloudinaryUrl } from '../utils/imageOptimizer';
import { useSettingsStore } from '../store/settingsStore';
import ProductCard from '../components/ProductCard';
import { io } from 'socket.io-client';

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const initialSearch = searchParams.get('search') || '';
  
  const [category, setCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [page, setPage] = useState(initialPage);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  
  const [products, setProducts] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  
  const [settings, setSettings] = useState<any>({ categories: ['All', 'Male', 'Female', 'Couple'], filters: [] });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Initialize active filters from URL params
    const filters: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (key !== 'category' && key !== 'page' && key !== 'search') {
        filters[key] = value;
      }
    });
    setActiveFilters(filters);
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setSettings({
            categories: ['All', ...(data.categories || ['Male', 'Female', 'Couple'])],
            filters: data.filters || []
          });
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Build query string
        const query = new URLSearchParams();
        if (category !== 'All') query.set('category', category);
        if (searchQuery) query.set('search', searchQuery);
        query.set('page', page.toString());
        query.set('limit', '18');
        
        Object.entries(activeFilters).forEach(([key, value]) => {
          if (value) query.set(key, value as string);
        });

        const res = await fetch(`/api/products?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
          setTotalPages(data.totalPages || 1);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 300);

    const socket = io();
    socket.on('products_updated', fetchProducts);

    return () => {
      clearTimeout(timeoutId);
      socket.disconnect();
    };
  }, [category, searchQuery, page, activeFilters]);

  const updateURL = (newCategory: string, newSearch: string, newPage: number, newFilters: Record<string, string>) => {
    const params = new URLSearchParams();
    if (newCategory !== 'All') params.set('category', newCategory);
    if (newSearch) params.set('search', newSearch);
    if (newPage > 1) params.set('page', newPage.toString());
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    
    setSearchParams(params);
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setPage(1);
    updateURL(newCategory, searchQuery, 1, activeFilters);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setPage(1);
    updateURL(category, value, 1, activeFilters);
  };

  const handleFilterChange = (filterName: string, value: string) => {
    const newFilters = { ...activeFilters };
    if (value) {
      newFilters[filterName] = value;
    } else {
      delete newFilters[filterName];
    }
    setActiveFilters(newFilters);
    setPage(1);
    updateURL(category, searchQuery, 1, newFilters);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      updateURL(category, searchQuery, newPage, activeFilters);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const clearFilters = () => {
    setCategory('All');
    setSearchQuery('');
    setActiveFilters({});
    setPage(1);
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="min-h-screen py-12 relative overflow-hidden luxury-bg">
      <div className="container mx-auto px-4 relative z-10">
        {/* Header & Search/Category */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <h1 className="text-4xl font-serif font-bold text-[#111111]">Our Collection</h1>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search perfumes..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-[#eeeeee] rounded-full focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/50 bg-white shadow-sm text-[#111111] placeholder:text-[#999999]"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#999999] w-4 h-4" />
            </div>

            {/* Category Filter - Scrollable on mobile */}
            <div className="w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
              <div className="flex items-center gap-2 bg-white p-1 rounded-full border border-[#eeeeee] shadow-sm min-w-max">
                {settings.categories.map((cat: string) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                      category === cat
                        ? 'bg-[#111111] text-white'
                        : 'text-[#555555] hover:text-[#111111] hover:bg-black/5'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Filter Toggle */}
            {settings.filters && settings.filters.length > 0 && (
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-[#eeeeee] shadow-sm rounded-full text-sm font-medium text-[#555555] w-full sm:w-auto justify-center"
              >
                <Filter className="w-4 h-4" />
                Filters {Object.keys(activeFilters).length > 0 && `(${Object.keys(activeFilters).length})`}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Dynamic Filters Sidebar */}
          {settings.filters && settings.filters.length > 0 && (
            <div className={`lg:w-64 shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-white p-6 rounded-2xl border border-[#eeeeee] shadow-sm sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-serif font-semibold text-[#111111] flex items-center gap-2">
                    <Filter className="w-5 h-5" /> Filters
                  </h2>
                  {Object.keys(activeFilters).length > 0 && (
                    <button onClick={clearFilters} className="text-sm text-[#C9A96E] hover:underline">
                      Clear All
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  {settings.filters.map((filter: any) => (
                    <div key={filter.name}>
                      <h3 className="font-medium text-[#111111] mb-3">{filter.name}</h3>
                      <div className="space-y-2">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className="relative flex items-center justify-center">
                            <input
                              type="radio"
                              name={filter.name}
                              checked={!activeFilters[filter.name]}
                              onChange={() => handleFilterChange(filter.name, '')}
                              className="peer sr-only"
                            />
                            <div className="w-5 h-5 rounded border border-[#cccccc] peer-checked:bg-[#111111] peer-checked:border-[#111111] transition-colors"></div>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100 text-white">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                          </div>
                          <span className="text-sm text-[#555555] group-hover:text-[#111111] transition-colors">All</span>
                        </label>
                        {filter.options.map((opt: string) => (
                          <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative flex items-center justify-center">
                              <input
                                type="radio"
                                name={filter.name}
                                checked={activeFilters[filter.name] === opt}
                                onChange={() => handleFilterChange(filter.name, opt)}
                                className="peer sr-only"
                              />
                              <div className="w-5 h-5 rounded border border-[#cccccc] peer-checked:bg-[#111111] peer-checked:border-[#111111] transition-colors"></div>
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100 text-white">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                              </div>
                            </div>
                            <span className="text-sm text-[#555555] group-hover:text-[#111111] transition-colors">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader size="md" />
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                  {products.map((product) => {
                      return (
                        <ProductCard 
                          key={product._id || product.id} 
                          product={product} 
                          className="w-[calc(50%-0.5rem)] md:w-[calc(33.333%-1rem)] lg:w-[calc(25%-1.125rem)] xl:w-[calc(20%-1.2rem)] 2xl:w-[calc(16.666%-1.25rem)]" 
                        />
                      );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="p-2 rounded-full border border-[#cccccc] hover:bg-[#111111] hover:border-[#111111] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-[#cccccc] disabled:hover:text-[#555555] transition-colors text-[#555555]"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          onClick={() => handlePageChange(p)}
                          className={`w-10 h-10 rounded-full text-sm font-medium transition-colors border ${
                            page === p
                              ? 'bg-[#111111] text-white border-[#111111]'
                              : 'hover:bg-[#f8f5ff] text-[#555555] border-transparent'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                      className="p-2 rounded-full border border-[#cccccc] hover:bg-[#111111] hover:border-[#111111] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-[#cccccc] disabled:hover:text-[#555555] transition-colors text-[#555555]"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-[#eeeeee] shadow-sm">
                <p className="text-xl text-[#555555]">No products found matching your criteria.</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-[#C9A96E] font-medium hover:underline inline-flex items-center gap-2"
                >
                  <X className="w-4 h-4" /> Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

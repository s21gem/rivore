import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Loader from '../components/Loader';
import { Search, Filter, ChevronLeft, ChevronRight, X } from 'lucide-react';

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
        query.set('limit', '8');
        
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

    return () => clearTimeout(timeoutId);
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                  {products.map((product) => {
                      const basePrice = product.sizes ? (product.sizes['50ml'] || Object.values(product.sizes)[0]) : product.price;
                      const discountPct = product.discountAmount || 0;
                      const displayPrice = discountPct > 0 ? Math.round(basePrice * (1 - discountPct / 100)) : basePrice;
                      const displayImage = product.image || product.images?.[0] || 'https://via.placeholder.com/400x500';
                      const hasSecondaryImage = product.images && product.images.length > 1;
                      const secondaryImage = hasSecondaryImage ? product.images[1] : null;
                      
                      return (
                      <Link to={`/product/${product.slug || product._id || product.id}`} key={product._id || product.id} className="group block">
                        {/* Luxury Glass Card Surface */}
                        <div className="glass-card relative rounded-[1.5rem] overflow-hidden">
                          
                          {/* Product Image Container with Spotlight */}
                          <div className="relative aspect-[3/4] overflow-hidden bg-[#faf8ff]">
                            
                            {/* Studio Spotlight Glow */}
                            <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                              <div className="w-44 h-44 bg-white blur-[40px] rounded-full transition-all duration-700"></div>
                            </div>
                            
                            {/* Secondary warm glow */}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1/3 bg-gradient-to-t from-[#C9A96E]/[0.08] to-transparent blur-[40px] pointer-events-none"></div>

                            {/* Product Image - Floating */}
                            <div className="absolute inset-0 flex items-center justify-center p-8">
                              <img
                                src={displayImage}
                                alt={product.name}
                                className={`w-full h-full object-contain absolute z-10 transform -translate-y-[6px] scale-[1.02] transition-all duration-500 ease-out ${hasSecondaryImage ? 'group-hover:opacity-0' : 'group-hover:-translate-y-3 group-hover:scale-[1.06] group-hover:rotate-[0.5deg]'}`}
                                style={{ padding: '2rem' }}
                                referrerPolicy="no-referrer"
                                loading="lazy"
                                onError={(e) => { (e.target as HTMLImageElement).src = '/apple-touch-icon.png' }}
                              />
                              {hasSecondaryImage && (
                                <img
                                  src={secondaryImage}
                                  alt={`${product.name} Hover`}
                                  className="w-full h-full object-contain absolute z-20 opacity-0 group-hover:opacity-100 transform -translate-y-[6px] scale-[1.02] group-hover:-translate-y-3 group-hover:scale-[1.06] transition-all duration-500 ease-out"
                                  style={{ padding: '2rem' }}
                                  referrerPolicy="no-referrer"
                                  loading="lazy"
                                />
                              )}
                            </div>

                          {/* Light sweep on hover */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.6] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                          {/* Stock + Discount Badges */}
                          <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5">
                            {product.stock <= 0 ? (
                              <span className="bg-red-500/10 backdrop-blur-md text-red-600 text-[9px] font-bold uppercase tracking-[0.15em] px-3 py-1.5 rounded-full border border-red-500/20 shadow-sm">
                                Out of Stock
                              </span>
                            ) : product.stock <= (product.lowStockThreshold || 5) ? (
                              <span className="bg-amber-500/10 backdrop-blur-md text-amber-600 text-[9px] font-bold uppercase tracking-[0.15em] px-3 py-1.5 rounded-full border border-amber-500/20 shadow-sm">
                                Low Stock
                              </span>
                            ) : (
                              <span className="bg-emerald-500/10 backdrop-blur-md text-emerald-600 text-[9px] font-bold uppercase tracking-[0.15em] px-3 py-1.5 rounded-full border border-emerald-500/20 shadow-sm">
                                In Stock
                              </span>
                            )}
                            {discountPct > 0 && (
                              <span className="bg-red-500 text-white text-[9px] font-bold uppercase tracking-[0.1em] px-3 py-1.5 rounded-full shadow-sm">
                                -{discountPct}% OFF
                              </span>
                            )}
                          </div>

                          {/* View Details overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-end justify-center pb-8 z-20">
                            <span className="bg-[#111111] text-white px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide transform translate-y-4 group-hover:translate-y-0 transition-all duration-400 shadow-md">
                              View Details
                            </span>
                          </div>
                        </div>

                        {/* Product Info - Glass Footer */}
                        <div className="p-5 text-center bg-white border-t border-[#eeeeee]">
                          <p className="text-[10px] text-[#777777] uppercase tracking-[0.2em] mb-1.5 font-medium">{product.category}</p>
                          <h3 className="text-lg font-serif font-bold text-[#111111] mb-1.5 tracking-wide">{product.name}</h3>
                          <div className="flex items-center justify-center gap-2">
                            {discountPct > 0 && <span className="text-xs text-muted-foreground line-through opacity-70">৳{basePrice}</span>}
                            <p className="font-bold text-sm tracking-wider gradient-text-luxury">৳{displayPrice}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )})}
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

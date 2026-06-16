import React, { useState, useEffect } from 'react';
import { Heart, Trash2, ShoppingCart, Loader2, Clock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useCartStore } from '../../store/cartStore';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState<{ products: any[], combos: any[] }>({ products: [], combos: [] });
  const [history, setHistory] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const addItem = useCartStore((state) => state.addItem);

  const fetchData = async () => {
    try {
      // Fetch Wishlist
      const wishlistRes = await fetch('/api/wishlist', {
        headers: { Authorization: `Bearer ${localStorage.getItem('customer_token')}` }
      });
      if (wishlistRes.ok) {
        const data = await wishlistRes.json();
        setWishlist({ products: data.products || [], combos: data.combos || [] });
      }

      // Fetch History & Recommendations
      const scentRes = await fetch('/api/customer/scent-collection', {
        headers: { Authorization: `Bearer ${localStorage.getItem('customer_token')}` }
      });
      if (scentRes.ok) {
        const scentData = await scentRes.json();
        setHistory(scentData.history || []);
        setRecommendations(scentData.recommendations || []);
      }

    } catch (error) {
      toast.error('Failed to load scent collection');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRemove = async (itemId: string, type: 'product' | 'combo') => {
    setRemoving(itemId);
    try {
      const res = await fetch('/api/wishlist/remove', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('customer_token')}` 
        },
        body: JSON.stringify({ itemId, type })
      });
      if (res.ok) {
        const data = await res.json();
        setWishlist({ products: data.products || [], combos: data.combos || [] });
        toast.success('Removed from wishlist');
      }
    } catch (error) {
      toast.error('Failed to remove item');
    } finally {
      setRemoving(null);
    }
  };

  const handleAddToCart = (item: any, type: 'product' | 'combo') => {
    if (type === 'combo') {
      addItem({
        id: `combo-${item._id}`,
        comboId: item._id,
        name: item.name,
        price: item.price,
        quantity: 1,
        image: item.image,
        type: 'combo'
      });
    } else {
      if (item.stock <= 0) {
        toast.error('This product is out of stock');
        return;
      }
      addItem({
        id: item._id,
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: 1,
        image: item.image || item.images?.[0],
        type: 'product',
        stock: item.stock
      });
    }
    toast.success('Added to cart');
  };

  const allWishlistItems = [
    ...wishlist.products.map(p => ({ ...p, _type: 'product' })),
    ...wishlist.combos.map(c => ({ ...c, _type: 'combo' }))
  ];

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-16 pb-12">
      
      {/* 1. WISHLIST SECTION */}
      <section>
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-light text-[#111111]">My Scent Collection</h1>
          <p className="text-[#777777] mt-2">Your curated collection of favorite fragrances.</p>
        </div>

        {allWishlistItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6 text-gray-300" />
            </div>
            <h3 className="text-xl font-serif text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">Explore our collection and save your favorite pieces for later.</p>
            <Link to="/shop" className="inline-block px-6 py-3 bg-[#111111] text-white rounded-xl text-sm font-semibold hover:bg-gray-900 transition-colors">
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {allWishlistItems.map((item) => (
              <div key={item._id} className="bg-white border border-gray-100 rounded-[1.5rem] overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col">
                <Link to={item._type === 'product' ? `/product/${item._id}` : `/combos`} className="block relative aspect-square bg-gray-50 overflow-hidden">
                  <img 
                    src={item.image || item.images?.[0]} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {item._type === 'product' && item.stock <= 0 && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded">
                      Sold Out
                    </div>
                  )}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.preventDefault(); handleRemove(item._id, item._type); }}
                      disabled={removing === item._id}
                      className="w-8 h-8 bg-white/90 backdrop-blur text-red-500 rounded-full flex items-center justify-center hover:bg-red-50 hover:scale-110 transition-all shadow-sm disabled:opacity-50"
                    >
                      {removing === item._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </Link>
                
                <div className="p-4 flex flex-col flex-1">
                  <div className="mb-4">
                    <Link to={item._type === 'product' ? `/product/${item._id}` : `/combos`} className="font-bold text-gray-900 hover:text-primary transition-colors line-clamp-1">
                      {item.name}
                    </Link>
                    <p className="text-sm font-serif text-gray-900 mt-1">৳{item.price}</p>
                  </div>
                  
                  <button 
                    onClick={() => handleAddToCart(item, item._type)}
                    disabled={item._type === 'product' && item.stock <= 0}
                    className="w-full py-2.5 bg-[#111111] text-white rounded-xl font-bold text-xs mt-auto hover:bg-primary transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-500"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {item._type === 'product' && item.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 2. FRAGRANCE HISTORY */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-serif text-gray-900">My Fragrance History</h2>
            <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Previously Purchased Scents</p>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="bg-gray-50 rounded-[2rem] p-8 text-center border border-gray-100">
            <p className="text-gray-500 text-sm">Your scent journey is just beginning. Make your first purchase to build your history.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {history.map((entry, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-3 border border-gray-100 hover:border-gray-200 transition-colors flex flex-col">
                <Link to={`/product/${entry.product._id}`} className="block aspect-square rounded-xl bg-gray-50 overflow-hidden mb-3">
                  <img src={entry.product.images?.[0]} alt={entry.product.name} className="w-full h-full object-cover" />
                </Link>
                <Link to={`/product/${entry.product._id}`} className="font-bold text-gray-900 text-sm line-clamp-1 mb-1 hover:text-primary">
                  {entry.product.name}
                </Link>
                <div className="mt-auto pt-2 border-t border-gray-50 flex justify-between items-center">
                   <span className="text-[10px] text-gray-500 font-medium">First bought: {new Date(entry.firstPurchaseDate).toLocaleDateString()}</span>
                   {entry.purchaseCount > 1 && (
                     <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded">x{entry.purchaseCount}</span>
                   )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. RECOMMENDATIONS */}
      {history.length > 0 && recommendations.length > 0 && (
        <section className="bg-[#111111] rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white/10 text-primary rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-serif text-white">You May Also Love</h2>
                <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Based on your collection</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recommendations.map((product) => (
                <div key={product._id} className="bg-white/5 border border-white/10 rounded-2xl p-3 hover:bg-white/10 transition-colors flex flex-col">
                  <Link to={`/product/${product._id}`} className="block aspect-square rounded-xl bg-black/50 overflow-hidden mb-3 relative">
                    <img src={product.images?.[0]} alt={product.name} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
                  </Link>
                  <Link to={`/product/${product._id}`} className="font-bold text-white text-sm line-clamp-1 mb-1 hover:text-primary">
                    {product.name}
                  </Link>
                  <div className="mt-auto pt-2 flex items-center justify-between">
                    <span className="text-gray-400 text-xs font-serif">৳{product.price}</span>
                    <button 
                      onClick={() => handleAddToCart(product, 'product')}
                      className="w-7 h-7 bg-white text-black rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCustomerAuthStore } from '../store/customerAuthStore';
import { Sparkles } from 'lucide-react';
import { CloudinaryImage } from './ui/CloudinaryImage';

interface Product {
  _id: string;
  name: string;
  slug: string;
  category: string;
  price?: number;
  sizes?: Record<string, number>;
  image?: string;
  images?: string[];
}

export default function Recommendations({ title = "Recommended For You", limit = 4 }: { title?: string, limit?: number }) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useCustomerAuthStore();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch('/api/products/recommendations', { headers });
        if (res.ok) {
          const data = await res.json();
          setRecommendations(data.slice(0, limit));
        }
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, [token, limit]);

  if (loading) {
    return (
      <div className="w-full flex justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#111111]"></div>
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <section className="py-12 bg-white relative">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8 px-2 md:px-0">
          <Sparkles className="w-6 h-6 text-[#C9A96E]" />
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#111111]">{title}</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {recommendations.map((product) => {
            const displayImage = product.image || product.images?.[0] || 'https://via.placeholder.com/400';
            const hoverImage = product.images?.[1] || displayImage;
            const price = product.sizes ? Object.values(product.sizes)[0] : product.price;

            return (
              <div key={product._id} className="group cursor-pointer">
                <Link to={`/product/${product.slug || product._id}`} className="block relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#faf8ff] border border-[#eeeeee] mb-4">
                  <CloudinaryImage 
                    src={displayImage} 
                    alt={product.name} 
                    className="w-full h-full object-contain p-4 transition-all duration-700 group-hover:opacity-0 group-hover:scale-105" 
                    loading="lazy"
                    width={400}
                  />
                  <div className="absolute inset-0 m-auto w-full h-full object-contain p-4 opacity-0 transition-all duration-700 group-hover:opacity-100 group-hover:scale-105">
                    <CloudinaryImage 
                      src={hoverImage} 
                      alt={`${product.name} alternate`} 
                      loading="lazy"
                      width={400}
                    />
                  </div>
                </Link>
                <div className="text-center px-2">
                  <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#C9A96E] mb-1">{product.category}</p>
                  <h3 className="font-serif font-bold text-[#111111] text-base md:text-lg mb-1 line-clamp-1">{product.name}</h3>
                  <p className="font-medium text-[#555555]">৳{price}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

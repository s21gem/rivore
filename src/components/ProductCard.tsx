import React from 'react';
import { Link } from 'react-router-dom';
import { optimizeCloudinaryUrl } from '../utils/imageOptimizer';
import { CloudinaryImage } from './ui/CloudinaryImage';

interface ProductCardProps {
  product: any;
  className?: string; // Additional classes for the wrapper
  style?: React.CSSProperties; // Optional inline styles for custom dimensions
}

export default function ProductCard({ product, className = '', style = {} }: ProductCardProps) {
  const basePrice = product.sizes ? (product.sizes['50ml'] || Object.values(product.sizes)[0]) : product.price;
  const discountPct = product.discountAmount || 0;
  const displayPrice = discountPct > 0 ? Math.round(basePrice * (1 - discountPct / 100)) : basePrice;
  const hasSecondaryImage = product.images && product.images.length > 1;
  
  return (
    <div className={`shrink-0 ${className}`} style={style}>
      <Link to={`/product/${product.slug || product._id || product.id}`} className="group block h-full">
        {/* Luxury Glass Card Surface */}
        <div className="glass-card relative rounded-2xl overflow-hidden h-full flex flex-col">
          
          {/* Product Image Container with Spotlight */}
          <div className="relative aspect-[3/4] overflow-hidden bg-[#faf8ff]">
            
            {/* Studio Spotlight Glow */}
            <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
              <div className="w-44 h-44 bg-white blur-[40px] rounded-full transition-all duration-700"></div>
            </div>
            
            {/* Secondary warm glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1/3 bg-gradient-to-t from-[#C9A96E]/[0.08] to-transparent blur-[40px] pointer-events-none"></div>

            {/* Product Image - Full Cover */}
            <div className="absolute inset-0">
              <div className={`absolute inset-0 z-10 transform transition-all duration-700 ease-out ${hasSecondaryImage ? 'group-hover:opacity-0' : 'group-hover:scale-[1.05]'}`}>
                <CloudinaryImage
                  src={product.image || product.images?.[0] || 'https://via.placeholder.com/400x500'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  width={600}
                  loading="lazy"
                />
              </div>
              {hasSecondaryImage && (
                <div className="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transform transition-all duration-700 ease-out group-hover:scale-[1.05]">
                  <CloudinaryImage
                    src={product.images[1]}
                    alt={`${product.name} Hover`}
                    className="w-full h-full object-cover"
                    width={600}
                    loading="lazy"
                  />
                </div>
              )}
            </div>

            {/* Light sweep on hover */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.6] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

            {/* Stock + Discount Badges */}
            <div className="absolute top-3 left-3 z-20 flex flex-col gap-1">
              {product.stock <= 0 ? (
                <span className="bg-red-500/10 backdrop-blur-md text-red-600 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-1 rounded-full border border-red-500/20 shadow-sm">
                  Out of Stock
                </span>
              ) : product.stock <= (product.lowStockThreshold || 5) ? (
                <span className="bg-amber-500/10 backdrop-blur-md text-amber-600 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-1 rounded-full border border-amber-500/20 shadow-sm">
                  Low Stock
                </span>
              ) : (
                <span className="bg-emerald-500/10 backdrop-blur-md text-emerald-600 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-1 rounded-full border border-emerald-500/20 shadow-sm">
                  In Stock
                </span>
              )}
              {discountPct > 0 && (
                <span className="bg-red-500 text-white text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded-full shadow-sm">
                  -{discountPct}% OFF
                </span>
              )}
            </div>

            {/* View Details overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-end justify-center pb-6 sm:pb-8 z-20">
              <span className="bg-[#111111] text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide transform translate-y-4 group-hover:translate-y-0 transition-all duration-400 shadow-md">
                View Details
              </span>
            </div>
          </div>

          {/* Product Info - Glass Footer */}
          <div className="p-4 text-center bg-white border-t border-[#eeeeee] flex-grow flex flex-col justify-end">
            <p className="text-[9px] sm:text-[10px] text-[#777777] uppercase tracking-[0.2em] mb-1 font-medium">{product.category}</p>
            <h3 className="text-sm sm:text-base font-serif font-bold text-[#111111] mb-1 tracking-wide line-clamp-1">{product.name}</h3>
            <div className="flex items-center justify-center gap-1.5 mt-auto">
              {discountPct > 0 && <span className="text-[10px] sm:text-xs text-muted-foreground line-through opacity-70">৳{basePrice}</span>}
              <p className="font-bold text-xs sm:text-sm tracking-wider gradient-text-luxury">৳{displayPrice}</p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

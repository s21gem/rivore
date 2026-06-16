import React, { useState, useEffect, useRef } from 'react';

interface CloudinaryImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  quality?: 'auto' | 'best' | 'good' | 'eco' | 'low';
  format?: 'auto' | 'webp' | 'avif' | 'png' | 'jpg';
  crop?: 'scale' | 'fill' | 'fit' | 'limit' | 'pad' | 'crop';
  loading?: 'lazy' | 'eager';
}

export function CloudinaryImage({
  src,
  alt,
  width,
  height,
  className = '',
  quality = 'auto',
  format = 'auto',
  crop = 'fill',
  loading = 'lazy',
  ...props
}: CloudinaryImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (loading === 'eager') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Load slightly before it comes into view
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [loading]);

  // Function to build Cloudinary optimized URL
  const getOptimizedUrl = (originalUrl: string, targetWidth?: number) => {
    // Check if it's actually a Cloudinary URL
    if (!originalUrl.includes('cloudinary.com')) {
      return originalUrl;
    }

    // Parse the Cloudinary URL
    // Format: https://res.cloudinary.com/<cloud_name>/image/upload/<transformations>/v<version>/<public_id>
    const urlParts = originalUrl.split('/upload/');
    
    if (urlParts.length !== 2) return originalUrl;

    const base = urlParts[0] + '/upload/';
    const pathAndVersion = urlParts[1];
    
    // Remove existing transformations if they exist (usually looks like q_auto,f_auto,etc.)
    let cleanPath = pathAndVersion;
    if (cleanPath.match(/^[a-z]_[^/]+\//)) {
      // Has transformations at the start, remove them
      cleanPath = cleanPath.substring(cleanPath.indexOf('/') + 1);
    }

    // Build new transformations
    const transforms = [];
    transforms.push(`f_${format}`);
    transforms.push(`q_${quality}`);
    
    if (targetWidth) {
      transforms.push(`w_${targetWidth}`);
      transforms.push(`c_${crop}`);
    }

    return `${base}${transforms.join(',')}/${cleanPath}`;
  };

  const optimizedSrc = isInView ? getOptimizedUrl(src, width) : '';
  const srcSet = isInView && width ? `
    ${getOptimizedUrl(src, Math.round(width * 0.5))} 500w,
    ${getOptimizedUrl(src, width)} 800w,
    ${getOptimizedUrl(src, Math.round(width * 1.5))} 1200w,
    ${getOptimizedUrl(src, Math.round(width * 2))} 1600w
  ` : undefined;

  return (
    <div 
      className={`relative overflow-hidden ${!isLoaded ? 'bg-muted/30 animate-pulse' : ''} ${className}`}
      style={{ width: width || 'auto', height: height || 'auto' }}
    >
      <img
        ref={imgRef}
        src={optimizedSrc || 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='} // Transparent placeholder
        srcSet={srcSet}
        sizes={width ? `(max-width: 768px) 100vw, ${width}px` : undefined}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${props.style?.objectFit === 'contain' ? 'object-contain' : ''}`}
        {...props}
      />
    </div>
  );
}

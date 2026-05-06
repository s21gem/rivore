import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export default function Loader({ size = 'md', fullScreen = false }: LoaderProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  const ringClasses = {
    sm: 'border-[2px]',
    md: 'border-[3px]',
    lg: 'border-[4px]'
  };

  const loader = (
    <div className={`relative flex items-center justify-center ${sizeClasses[size]}`}>
      {/* Spinning Ring */}
      <div 
        className={`absolute inset-0 rounded-full border-t-[#6d28d9] border-r-transparent border-b-transparent border-l-transparent animate-spin ${ringClasses[size]}`}
        style={{ animationDuration: '1s' }}
      ></div>
      {/* Background track */}
      <div className={`absolute inset-0 rounded-full border-[#eeeeee] opacity-30 ${ringClasses[size]}`}></div>
      {/* Logo Image */}
      <img 
        src="/apple-touch-icon.png" 
        alt="Loading..." 
        className="w-[60%] h-[60%] object-contain opacity-80 animate-pulse" 
      />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[50vh]">
        {loader}
      </div>
    );
  }

  return loader;
}

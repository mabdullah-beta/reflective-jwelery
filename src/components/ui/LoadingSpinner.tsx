import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
        <div className="mt-4 text-center text-sm text-gray-600">Loading...</div>
      </div>
    </div>
  );
};

export default LoadingSpinner; 
import React from 'react';

interface ImageDisplayProps {
  title: string;
  imageUrl: string | null;
  isActionable?: boolean;
  isBusy?: boolean;
  onDownload?: () => void;
  onRegenerate?: () => void;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ title, imageUrl, isActionable = false, isBusy = false, onDownload, onRegenerate }) => {
  return (
    <div className="w-full flex flex-col items-center space-y-4">
      <h2 className="text-xl font-semibold text-slate-300">{title}</h2>
      <div className="w-full aspect-square bg-slate-800 rounded-lg shadow-lg overflow-hidden flex items-center justify-center relative group">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="text-slate-500">No image</div>
        )}
        
        {isActionable && imageUrl && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center space-x-4 opacity-0 group-hover:opacity-100">
            <button
              onClick={onDownload}
              disabled={isBusy}
              className="p-3 bg-slate-900/80 rounded-full text-white hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Download Image"
              aria-label="Download Image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            <button
              onClick={onRegenerate}
              disabled={isBusy}
              className="p-3 bg-slate-900/80 rounded-full text-white hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Regenerate Image"
              aria-label="Regenerate Image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 9.5M20 20l-1.5-1.5A9 9 0 003.5 14.5" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageDisplay;
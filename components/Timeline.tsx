import React from 'react';

interface TimelineProps {
  originalImage: { previewUrl: string } | null;
  generatedImages: string[];
  currentIndex: number;
  onImageSelect: (index: number) => void;
}

const Timeline: React.FC<TimelineProps> = ({ originalImage, generatedImages, currentIndex, onImageSelect }) => {
  const allImages = [originalImage?.previewUrl, ...generatedImages].filter(Boolean) as string[];

  return (
    <div className="w-full max-w-3xl flex flex-col items-center space-y-4">
        <h2 className="text-xl font-semibold text-slate-300">Timeline</h2>
        <div className="w-full bg-slate-800/50 p-3 rounded-lg shadow-inner">
            <div className="flex space-x-3 overflow-x-auto pb-2">
                {allImages.map((imageUrl, index) => {
                    const timelineIndex = index - 1; // -1 for original, 0+ for generated
                    const isSelected = timelineIndex === currentIndex;
                    return (
                        <button
                            key={index}
                            onClick={() => onImageSelect(timelineIndex)}
                            className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden focus:outline-none transition-all duration-200 ring-offset-2 ring-offset-slate-900 ${isSelected ? 'ring-4 ring-indigo-500' : 'ring-2 ring-transparent hover:ring-indigo-400'}`}
                            aria-label={`Select ${timelineIndex === -1 ? 'Original Image' : `Glimpse #${timelineIndex + 1}`}`}
                        >
                            <img
                                src={imageUrl}
                                alt={timelineIndex === -1 ? 'Original Image' : `Glimpse #${timelineIndex + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    );
                })}
            </div>
        </div>
    </div>
  );
};

export default Timeline;

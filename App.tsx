import React, { useState, useCallback, useEffect } from 'react';
import { AppState } from './types';
import { generateFutureImage } from './services/geminiService';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import ImageDisplay from './components/ImageDisplay';
import ActionButton from './components/ActionButton';
import Loader from './components/Loader';
import Timeline from './components/Timeline';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // remove the `data:mime/type;base64,` prefix
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [originalImage, setOriginalImage] = useState<{ data: string; mimeType: string; previewUrl: string } | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1); // -1 for original, 0+ for generated
  const [error, setError] = useState<string | null>(null);
  const [timeInterval, setTimeInterval] = useState<string>('one second');

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (originalImage) {
        URL.revokeObjectURL(originalImage.previewUrl);
      }
    };
  }, [originalImage]);

  const handleImageUpload = (file: File) => {
    if (originalImage) {
      URL.revokeObjectURL(originalImage.previewUrl);
    }
    
    const newPreviewUrl = URL.createObjectURL(file);
    setGeneratedImages([]);
    setError(null);
    setSelectedImageIndex(-1);
    
    fileToBase64(file)
      .then(base64Image => {
        setOriginalImage({ data: base64Image, mimeType: file.type, previewUrl: newPreviewUrl });
        setAppState(AppState.IMAGE_UPLOADED);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to read the uploaded image file.');
        setAppState(AppState.IDLE);
        setOriginalImage(null);
        URL.revokeObjectURL(newPreviewUrl);
      });
  };
  
  const handleGenerate = useCallback(async () => {
    if (!originalImage) return;

    const lastImageBase64 = generatedImages.length > 0 ? generatedImages[generatedImages.length - 1].split(',')[1] : originalImage.data;

    setAppState(AppState.GENERATING);
    setError(null);

    try {
      const generatedBase64 = await generateFutureImage(lastImageBase64, originalImage.mimeType, timeInterval);
      const newImageUrl = `data:${originalImage.mimeType};base64,${generatedBase64}`;
      
      setGeneratedImages(prev => {
        const newImages = [...prev, newImageUrl];
        setSelectedImageIndex(newImages.length - 1); // Select the newly generated image
        return newImages;
      });
      setAppState(AppState.IMAGE_GENERATED);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate image. ${errorMessage}`);
      setAppState(generatedImages.length > 0 ? AppState.IMAGE_GENERATED : AppState.IMAGE_UPLOADED);
    }
  }, [originalImage, generatedImages, timeInterval]);

  const handleRegenerate = useCallback(async () => {
    if (!originalImage || selectedImageIndex < 0) return; // Can't regenerate the original image

    const indexToRegenerate = selectedImageIndex;
    const sourceBase64 = indexToRegenerate > 0 ? generatedImages[indexToRegenerate - 1].split(',')[1] : originalImage.data;

    setAppState(AppState.GENERATING);
    setError(null);

    try {
      const generatedBase64 = await generateFutureImage(sourceBase64, originalImage.mimeType, timeInterval);
      const newImageUrl = `data:${originalImage.mimeType};base64,${generatedBase64}`;
      
      setGeneratedImages(prev => {
        const newImages = [...prev.slice(0, indexToRegenerate)];
        newImages.push(newImageUrl);
        return newImages;
      });
      setSelectedImageIndex(indexToRegenerate); // Keep the selection on the regenerated image
      setAppState(AppState.IMAGE_GENERATED);

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to regenerate image. ${errorMessage}`);
      setAppState(AppState.IMAGE_GENERATED);
    }
  }, [originalImage, generatedImages, timeInterval, selectedImageIndex]);

  const handleDownload = () => {
    if (selectedImageIndex === -1 && originalImage) {
      const link = document.createElement('a');
      link.href = originalImage.previewUrl;
      link.download = `original-image.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (selectedImageIndex >= 0) {
      const imageUrl = generatedImages[selectedImageIndex];
      const link = document.createElement('a');
      link.href = imageUrl;
      const extension = originalImage?.mimeType.split('/')[1] || 'png';
      link.download = `future-glimpse-${selectedImageIndex + 1}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setOriginalImage(null);
    setGeneratedImages([]);
    setError(null);
    setSelectedImageIndex(-1);
  };

  const isGenerating = appState === AppState.GENERATING;

  const getSelectedImageData = () => {
    if (selectedImageIndex === -1) {
      return {
        title: 'Original Image',
        imageUrl: originalImage?.previewUrl ?? null,
        isActionable: generatedImages.length > 0, // Only show actions if there's something to regenerate from
      };
    }
    return {
      title: `Glimpse #${selectedImageIndex + 1}`,
      imageUrl: generatedImages[selectedImageIndex] ?? null,
      isActionable: true,
    };
  };
  
  const selectedImageData = getSelectedImageData();

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 md:p-8 bg-slate-900 font-sans">
      <Header />
      <main className="flex-grow w-full max-w-5xl flex flex-col items-center justify-center space-y-8">
        {appState === AppState.IDLE && <ImageUploader onImageUpload={handleImageUpload} />}

        {(appState !== AppState.IDLE) && (
          <div className="w-full flex flex-col items-center space-y-8">
            <div className="w-full max-w-2xl">
              <ImageDisplay
                title={selectedImageData.title}
                imageUrl={selectedImageData.imageUrl}
                onDownload={handleDownload}
                onRegenerate={selectedImageIndex >= 0 ? handleRegenerate : undefined} // Can't regenerate original
                isActionable={selectedImageData.isActionable}
                isBusy={isGenerating}
              />
            </div>

            {isGenerating && (
                <div className="mt-8">
                  <Loader />
                </div>
              )}
            
            {(originalImage || generatedImages.length > 0) && (
              <Timeline 
                originalImage={originalImage}
                generatedImages={generatedImages}
                currentIndex={selectedImageIndex}
                onImageSelect={setSelectedImageIndex}
              />
            )}
          </div>
        )}

        {error && <div className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-md animate-pulse">{error}</div>}

        <div className="mt-8 flex flex-col items-center gap-6">
          {(appState === AppState.IMAGE_UPLOADED || appState === AppState.IMAGE_GENERATED) && (
            <>
              <div>
                <label htmlFor="time-interval-select" className="block text-sm font-medium text-slate-300 mb-2 text-center">
                  Time Jump
                </label>
                <select
                  id="time-interval-select"
                  value={timeInterval}
                  onChange={(e) => setTimeInterval(e.target.value)}
                  disabled={isGenerating}
                  className="bg-slate-700 border border-slate-600 text-white rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  aria-label="Select time jump interval"
                >
                  <option value="one second">One Second</option>
                  <option value="one hour">One Hour</option>
                  <option value="one day">One Day</option>
                  <option value="one year">One Year</option>
                </select>
              </div>
              <div className="flex space-x-4">
                <ActionButton onClick={handleGenerate} disabled={isGenerating}>
                  Next
                </ActionButton>
                <ActionButton onClick={handleReset} disabled={isGenerating}>
                  Start Over
                </ActionButton>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
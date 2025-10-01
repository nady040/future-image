
import React, { useCallback, useRef } from 'react';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleDragOver = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    }
  }, [onImageUpload]);

  return (
    <div className="w-full max-w-lg">
      <label
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="flex justify-center w-full h-64 px-4 transition bg-slate-800 border-2 border-slate-600 border-dashed rounded-md appearance-none cursor-pointer hover:border-indigo-400 focus:outline-none"
      >
        <span className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span className="font-medium text-slate-400">
            Drop files to attach, or <span className="text-indigo-400 underline">browse</span>
          </span>
        </span>
        <input
          type="file"
          name="file_upload"
          className="hidden"
          accept="image/*"
          ref={inputRef}
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
};

export default ImageUploader;

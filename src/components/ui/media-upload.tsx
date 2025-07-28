import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from './button';
import { mediaService } from '@/services/media';

interface MediaUploadProps {
  value?: string; // Current media URL
  onChange: (url: string) => void; // Callback when media changes
  componentId: string; // Component ID for storage organization
  fieldName: string; // Field name (e.g., "template1Image", "videoUrl")
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  acceptedTypes?: string[];
  aspectRatio?: number; // Optional aspect ratio (width/height)
}

export const MediaUpload: React.FC<MediaUploadProps> = ({
  value,
  onChange,
  componentId,
  fieldName,
  placeholder = "Upload media",
  className = "",
  disabled = false,
  acceptedTypes = ['image/*'],
  aspectRatio
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file || disabled) return;

    setIsUploading(true);
    try {
      const url = await mediaService.uploadAndSetComponentMedia(
        file,
        componentId,
        fieldName
      );

      if (url) {
        onChange(url);
      } else {
        alert('Upload failed. Please try again.');
      }
    } catch (error) {
  
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && acceptedTypes.some(type => file.type.match(type.replace('*', '.*')))) {
      handleFileUpload(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleRemove = async () => {
    try {
      const success = await mediaService.removeComponentMediaUrl(componentId, fieldName);
      if (success) {
        onChange('');
      }
    } catch (error) {
    }
  };

  const containerStyle = aspectRatio 
    ? { aspectRatio: `${aspectRatio}` }
    : { minHeight: '200px' };

  const isVideo = value && (value.includes('youtube.com') || value.includes('youtu.be') || value.includes('vimeo.com') || value.endsWith('.mp4') || value.endsWith('.webm') || value.endsWith('.ogg'));

  return (
    <div className={`relative ${className}`} style={containerStyle}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
      
      {value ? (
        // Media Preview
        <div className="relative group w-full h-full">
          {isVideo ? (
            <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Video: {value}</p>
              </div>
            </div>
          ) : (
            <img 
              src={value} 
              alt="Uploaded content" 
              className="w-full h-full object-cover rounded-lg"
            />
          )}
          {!disabled && (
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white text-black hover:bg-gray-200"
                disabled={isUploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                Change
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                disabled={isUploading}
              >
                <X className="w-4 h-4 mr-2" />
                Remove
              </Button>
            </div>
          )}
        </div>
      ) : (
        // Upload Area
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors w-full h-full flex flex-col items-center justify-center
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'border-gray-300 hover:border-gray-400'}
            ${dragActive ? 'border-blue-500 bg-blue-50' : ''}
          `}
          onClick={() => !disabled && fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <ImageIcon className="w-12 h-12 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">{placeholder}</p>
                <p className="text-xs text-gray-500">
                  Click to upload or drag and drop
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaUpload;

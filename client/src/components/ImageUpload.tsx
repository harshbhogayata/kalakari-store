import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorUtils';

interface ImageUploadProps {
  onImageUploaded?: (url: string) => void;
  onImagesUploaded?: (urls: string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in MB
  accept?: string;
  className?: string;
  uploadType?: 'single' | 'multiple' | 'product' | 'artisan' | 'review';
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUploaded,
  onImagesUploaded,
  multiple = false,
  maxFiles = 5,
  maxSize = 5,
  accept = 'image/*',
  className = '',
  uploadType = 'single'
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const getUploadEndpoint = () => {
    switch (uploadType) {
      case 'product':
        return '/upload/product';
      case 'artisan':
        return '/upload/artisan';
      case 'review':
        return '/upload/review';
      case 'multiple':
        return '/upload/multiple';
      default:
        return '/upload/single';
    }
  };

  const getFieldName = () => {
    switch (uploadType) {
      case 'product':
        return 'productImage';
      case 'artisan':
        return 'profileImage';
      case 'review':
        return 'reviewImages';
      case 'multiple':
        return 'images';
      default:
        return 'image';
    }
  };

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return false;
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File size must be less than ${maxSize}MB`);
      return false;
    }

    return true;
  };

  const uploadFile = async (files: FileList) => {
    if (files.length === 0) return;

    // Validate files
    for (let i = 0; i < files.length; i++) {
      if (!validateFile(files[i])) {
        return;
      }
    }

    setUploading(true);

    try {
      const formData = new FormData();
      const fieldName = getFieldName();

      if (multiple || uploadType === 'multiple' || uploadType === 'review') {
        for (let i = 0; i < files.length; i++) {
          formData.append(fieldName, files[i]);
        }
      } else {
        formData.append(fieldName, files[0]);
      }

      const response = await api.post(getUploadEndpoint(), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        if (multiple || uploadType === 'multiple' || uploadType === 'review') {
          const urls = response.data.data.files 
            ? response.data.data.files.map((file: any) => file.url)
            : response.data.data.imageUrls;
          
          setUploadedImages(prev => [...prev, ...urls]);
          onImagesUploaded?.(urls);
          toast.success(`${files.length} images uploaded successfully`);
        } else {
          const url = response.data.data.url || response.data.data.imageUrl;
          setUploadedImages(prev => [...prev, url]);
          onImageUploaded?.(url);
          toast.success('Image uploaded successfully');
        }
      }
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Upload failed');
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      uploadFile(files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files) {
      uploadFile(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${uploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          multiple={multiple || uploadType === 'multiple' || uploadType === 'review'}
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />
        
        <div className="space-y-2">
          {uploading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
              <span className="text-gray-600">Uploading...</span>
            </div>
          ) : (
            <>
              <Upload className="mx-auto h-8 w-8 text-gray-400" />
              <div className="text-sm text-gray-600">
                <span className="font-medium text-primary-600">Click to upload</span> or drag and drop
              </div>
              <div className="text-xs text-gray-500">
                {multiple || uploadType === 'multiple' || uploadType === 'review' 
                  ? `Up to ${maxFiles} images, max ${maxSize}MB each`
                  : `Single image, max ${maxSize}MB`
                }
              </div>
            </>
          )}
        </div>
      </div>

      {/* Uploaded Images Preview */}
      {uploadedImages.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Uploaded Images:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {uploadedImages.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Uploaded ${index + 1}`}
                  className="w-full h-20 object-cover rounded-lg border"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image URLs (for copying) */}
      {uploadedImages.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Image URLs:</h4>
          <div className="space-y-1">
            {uploadedImages.map((url, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded text-xs">
                <ImageIcon className="h-3 w-3 text-gray-400" />
                <span className="flex-1 truncate">{url}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(url)}
                  className="text-primary-600 hover:text-primary-700"
                >
                  Copy
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;


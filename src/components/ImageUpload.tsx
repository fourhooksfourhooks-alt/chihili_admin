'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Upload, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface ImageUploadProps {
  label?: string;
  existingImages?: string[];
  onImageAdd?: (files: File[]) => void;
  onImageRemove?: (index: number) => void;
  onExistingImageRemove?: (imageUrl: string) => void;
  previewImages?: string[];
  multiple?: boolean;
  maxImages?: number;
  disabled?: boolean;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  label = "Images",
  existingImages = [],
  onImageAdd,
  onImageRemove,
  onExistingImageRemove,
  previewImages = [],
  multiple = true,
  maxImages = 10,
  disabled = false,
  className = ""
}) => {
  const [dragOver, setDragOver] = useState(false);

  const totalImages = existingImages.length + previewImages.length;
  const canAddMore = totalImages < maxImages;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const remainingSlots = maxImages - totalImages;
      const filesToAdd = files.slice(0, remainingSlots);
      
      if (onImageAdd) {
        onImageAdd(filesToAdd);
      }
      
      // Reset input
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (disabled || !canAddMore) return;
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      const remainingSlots = maxImages - totalImages;
      const filesToAdd = files.slice(0, remainingSlots);
      
      if (onImageAdd) {
        onImageAdd(filesToAdd);
      }
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Label */}
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">{label}</Label>
        <Badge variant="outline">
          {totalImages}/{maxImages}
        </Badge>
      </div>

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div>
          <p className="text-sm text-muted-foreground mb-3">Current Images:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {existingImages.map((imageUrl, index) => (
              <div key={`existing-${index}`} className="relative group">
                <div className="aspect-square relative overflow-hidden rounded-lg border bg-muted">
                  <Image
                    src={imageUrl}
                    alt={`Existing image ${index + 1}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                {onExistingImageRemove && !disabled && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                    onClick={() => onExistingImageRemove(imageUrl)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview New Images */}
      {previewImages.length > 0 && (
        <div>
          <p className="text-sm text-muted-foreground mb-3">New Images (to be uploaded):</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {previewImages.map((url, index) => (
              <div key={`preview-${index}`} className="relative group">
                <div className="aspect-square relative overflow-hidden rounded-lg border bg-muted">
                  <Image
                    src={url}
                    alt={`Preview image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                {onImageRemove && !disabled && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                    onClick={() => onImageRemove(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Area */}
      {canAddMore && !disabled && (
        <div>
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-6 transition-colors
              ${dragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              
              <div className="text-center">
                <p className="text-sm font-medium">
                  Drop images here or click to upload
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {multiple ? 
                    `Upload up to ${maxImages - totalImages} more images` : 
                    'Upload 1 image'
                  }
                </p>
              </div>

              <Input
                type="file"
                accept="image/*"
                multiple={multiple}
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              <Button type="button" variant="outline" size="sm" className="pointer-events-none">
                <Upload className="h-4 w-4 mr-2" />
                Choose Files
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Limit Reached Message */}
      {!canAddMore && (
        <div className="text-center p-4 border rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground">
            Maximum number of images ({maxImages}) reached
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;

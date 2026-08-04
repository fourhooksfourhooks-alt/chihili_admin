/**
 * Utility functions for bulk image operations
 */

export interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

export interface BulkImageOperation {
  type: 'upload' | 'delete';
  images: string[] | File[];
  targetId?: string; // product ID or variant SKU
}

/**
 * Generate unique ID for image files
 */
export const generateImageId = (): string => {
  return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create preview URLs for files
 */
export const createImagePreviews = (files: File[]): ImageFile[] => {
  return files.map(file => ({
    file,
    preview: URL.createObjectURL(file),
    id: generateImageId()
  }));
};

/**
 * Cleanup preview URLs to prevent memory leaks
 */
export const cleanupImagePreviews = (imageFiles: ImageFile[]): void => {
  imageFiles.forEach(({ preview }) => {
    URL.revokeObjectURL(preview);
  });
};

/**
 * Validate image files
 */
export const validateImageFiles = (
  files: File[], 
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
    maxCount?: number;
  } = {}
): { valid: File[]; invalid: { file: File; reason: string }[] } => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxCount = 10
  } = options;

  const valid: File[] = [];
  const invalid: { file: File; reason: string }[] = [];

  files.slice(0, maxCount).forEach(file => {
    if (!allowedTypes.includes(file.type)) {
      invalid.push({ file, reason: 'Invalid file type' });
    } else if (file.size > maxSize) {
      invalid.push({ file, reason: `File too large (max ${formatBytes(maxSize)})` });
    } else {
      valid.push(file);
    }
  });

  if (files.length > maxCount) {
    const extraFiles = files.slice(maxCount);
    extraFiles.forEach(file => {
      invalid.push({ file, reason: `Exceeds maximum count (${maxCount})` });
    });
  }

  return { valid, invalid };
};

/**
 * Format bytes to human readable string
 */
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Compress image file (basic implementation)
 */
export const compressImage = (
  file: File, 
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  } = {}
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8
    } = options;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Batch process images with compression
 */
export const batchProcessImages = async (
  files: File[],
  options: {
    compress?: boolean;
    compressionOptions?: Parameters<typeof compressImage>[1];
    validationOptions?: Parameters<typeof validateImageFiles>[1];
    onProgress?: (processed: number, total: number) => void;
  } = {}
): Promise<{ processed: File[]; errors: { file: File; error: string }[] }> => {
  const {
    compress = true,
    compressionOptions = {},
    validationOptions = {},
    onProgress
  } = options;

  // Validate files first
  const { valid, invalid } = validateImageFiles(files, validationOptions);
  
  const processed: File[] = [];
  const errors: { file: File; error: string }[] = invalid.map(({ file, reason }) => ({
    file,
    error: reason
  }));

  // Process valid files
  for (let i = 0; i < valid.length; i++) {
    const file = valid[i];
    
    try {
      if (compress) {
        const compressedFile = await compressImage(file, compressionOptions);
        processed.push(compressedFile);
      } else {
        processed.push(file);
      }
    } catch (error) {
      errors.push({
        file,
        error: error instanceof Error ? error.message : 'Processing failed'
      });
    }

    // Report progress
    onProgress?.(i + 1, valid.length);
  }

  return { processed, errors };
};

/**
 * Create optimized image upload batches
 */
export const createUploadBatches = (
  files: File[],
  batchSize: number = 3
): File[][] => {
  const batches: File[][] = [];
  
  for (let i = 0; i < files.length; i += batchSize) {
    batches.push(files.slice(i, i + batchSize));
  }
  
  return batches;
};

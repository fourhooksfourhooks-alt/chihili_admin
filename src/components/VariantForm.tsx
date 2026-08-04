'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ImageUpload from './ImageUpload';

interface VariantFormProps {
  variant: {
    sku?: string;
    title?: string;
    attributes?: {
      size?: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
      color?: string;
    };
    price: number;
    mrp?: number;
    stock: number;
    tempImages?: File[];
    imagePreviewUrls?: string[];
    existingImages?: string[];
  };
  index: number;
  onVariantChange: (index: number, field: string, value: string | number) => void;
  onVariantRemove: (index: number) => void;
  onVariantImageAdd: (variantIndex: number, files: File[]) => void;
  onVariantImageRemove: (variantIndex: number, imageIndex: number) => void;
  onVariantExistingImageRemove?: (variantIndex: number, imageUrl: string) => void;
  canRemove: boolean;
  isSkuDisabled?: boolean;
}

const VariantForm: React.FC<VariantFormProps> = ({
  variant,
  index,
  onVariantChange,
  onVariantRemove,
  onVariantImageAdd,
  onVariantImageRemove,
  onVariantExistingImageRemove,
  canRemove,
  isSkuDisabled = false
}) => {
  const handleImageAdd = (files: File[]) => {
    onVariantImageAdd(index, files);
  };

  const handleImageRemove = (imageIndex: number) => {
    onVariantImageRemove(index, imageIndex);
  };

  const handleExistingImageRemove = (imageUrl: string) => {
    if (onVariantExistingImageRemove) {
      onVariantExistingImageRemove(index, imageUrl);
    }
  };

  return (
    <div className="border rounded-lg p-6 space-y-6 bg-card">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold">Variant {index + 1}</h4>
        {canRemove ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onVariantRemove(index)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remove
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled
            title="Cannot remove the last variant. At least one variant is required."
            className="text-muted-foreground"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remove
          </Button>
        )}
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`sku-${index}`}>SKU</Label>
          <Input
            id={`sku-${index}`}
            type="text"
            placeholder="Product SKU"
            value={variant.sku || ''}
            onChange={(e) => onVariantChange(index, 'sku', e.target.value)}
            disabled={isSkuDisabled}
          />
          {isSkuDisabled && (
            <p className="text-xs text-muted-foreground">
              SKU cannot be changed for existing variants
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`title-${index}`}>Title</Label>
          <Input
            id={`title-${index}`}
            type="text"
            placeholder="Variant title"
            value={variant.title || ''}
            onChange={(e) => onVariantChange(index, 'title', e.target.value)}
          />
        </div>
      </div>

      {/* Attributes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`size-${index}`}>Size</Label>
          <Select
            value={variant.attributes?.size ?? '__none'}
            onValueChange={(value) => onVariantChange(index, 'attributes.size', value)}
          >
            <SelectTrigger id={`size-${index}`}>
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none">No Size</SelectItem>
              <SelectItem value="XS">XS</SelectItem>
              <SelectItem value="S">S</SelectItem>
              <SelectItem value="M">M</SelectItem>
              <SelectItem value="L">L</SelectItem>
              <SelectItem value="XL">XL</SelectItem>
              <SelectItem value="XXL">XXL</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`color-${index}`}>Color</Label>
          <Input
            id={`color-${index}`}
            type="text"
            placeholder="Color name"
            value={variant.attributes?.color || ''}
            onChange={(e) => onVariantChange(index, 'attributes.color', e.target.value)}
          />
        </div>
      </div>

      {/* Pricing & Stock */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`price-${index}`}>
            Price (₹) <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`price-${index}`}
            type="number"
            placeholder="0.00"
            value={variant.price || ''}
            onChange={(e) => onVariantChange(index, 'price', Number(e.target.value))}
            min="0"
            step="0.01"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`mrp-${index}`}>MRP (₹)</Label>
          <Input
            id={`mrp-${index}`}
            type="number"
            placeholder="0.00"
            value={variant.mrp || ''}
            onChange={(e) => onVariantChange(index, 'mrp', Number(e.target.value))}
            min="0"
            step="0.01"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`stock-${index}`}>
            Stock <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`stock-${index}`}
            type="number"
            placeholder="0"
            value={variant.stock || ''}
            onChange={(e) => onVariantChange(index, 'stock', Number(e.target.value))}
            min="0"
            required
          />
        </div>
      </div>

      {/* Images */}
      <div>
        <ImageUpload
          label="Variant Images"
          existingImages={variant.existingImages}
          previewImages={variant.imagePreviewUrls}
          onImageAdd={handleImageAdd}
          onImageRemove={handleImageRemove}
          onExistingImageRemove={onVariantExistingImageRemove ? handleExistingImageRemove : undefined}
          maxImages={5}
        />
      </div>
    </div>
  );
};

export default VariantForm;

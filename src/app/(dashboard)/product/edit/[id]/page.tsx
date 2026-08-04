'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Tag, Package, DollarSign, ImageIcon, Plus, AlertCircle, Clock } from 'lucide-react';
import { useCategoryStore } from '@/store/categoryStore';
import { useAuthStore } from '@/store/authStore';
import { useProductStore } from '@/store/productStore';
import type { UpdateProductData, ProductVariant } from '@/api/product.api';
import ImageUpload from '@/components/ImageUpload';
import VariantForm from '@/components/VariantForm';
import { toast } from 'sonner';

// Interface for form variant data (includes UI-only fields)
interface FormVariant {
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
}

// shadcn/ui components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const EditProductPage = () => {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  // Store hooks
  const { categories: categoryOptions, fetchCategories } = useCategoryStore();
  const { vendor, fetchVendor } = useAuthStore();
  const { 
    currentProduct,
    fetchProductById,
    editProduct, 
    uploadProductImages, 
    uploadVariantImages,
    deleteProductImage,
    deleteVariantImage,
    removeProductVariant,
    updateProductVariant,
    addProductVariants,
    error: storeError,
    isLoading,
    setError
  } = useProductStore();

  // Form state
  const [name, setName] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string>('');
  const [status, setStatus] = useState<'draft' | 'active' | 'inactive' | 'archived'>('draft');
  const [isFeatured, setIsFeatured] = useState(false);
  const [returnPolicy, setReturnPolicy] = useState('7-day return/exchange available');
  
  // Discount information
  const [discountType, setDiscountType] = useState<'percentage' | 'flat' | ''>('');
  const [discountValue, setDiscountValue] = useState<number>(0);
  
  // Buy X Get Y
  const [enableBuyXGetY, setEnableBuyXGetY] = useState(false);
  const [buyX, setBuyX] = useState<number>(2);
  const [getY, setGetY] = useState<number>(1);
  
  // Variant related states
  const [variants, setVariants] = useState<FormVariant[]>([{ 
    sku: '',
    title: '',
    attributes: { size: undefined, color: '' },
    price: 0, 
    mrp: 0,
    stock: 0,
    tempImages: [],
    imagePreviewUrls: [],
    existingImages: []
  }]);
  
  // Images
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  
  // Form state - separate loading states for each tab
  const [isSubmittingBasic, setIsSubmittingBasic] = useState(false);
  const [isSubmittingPricing, setIsSubmittingPricing] = useState(false);
  const [isSubmittingVariants, setIsSubmittingVariants] = useState(false);
  const [isSubmittingImages, setIsSubmittingImages] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');
  
  // Load product data on mount
  useEffect(() => {
    const loadProductData = async () => {
      if (!productId) return;
      
      setIsLoadingProduct(true);
      try {
        await fetchProductById(productId);
      } catch (error) {
        console.error('Error loading product:', error);
        setError('Failed to load product data');
      } finally {
        setIsLoadingProduct(false);
      }
    };

    loadProductData();
    fetchCategories();
    if (!vendor) {
      fetchVendor();
    }
  }, [productId, fetchProductById, fetchCategories, fetchVendor, vendor, setError]);

  // Populate form when product data is loaded
  useEffect(() => {
    if (currentProduct && currentProduct._id === productId) {
      setName(currentProduct.name || '');
      setShortDescription(currentProduct.shortDescription || '');
      setDescription(currentProduct.description || '');
      setCategories(currentProduct.categories || []);
      setTags(currentProduct.tags?.join(', ') || '');
      setStatus(currentProduct.status || 'draft');
      setIsFeatured(currentProduct.isFeatured || false);
      setReturnPolicy(currentProduct.returnPolicy || '7-day return/exchange available');
      setDiscountType(currentProduct.discountType || '');
      setDiscountValue(currentProduct.discountValue || 0);
      
      if (currentProduct.buyXGetY) {
        setEnableBuyXGetY(true);
        setBuyX(currentProduct.buyXGetY.x || 2);
        setGetY(currentProduct.buyXGetY.y || 1);
      }
      
      // Set existing product images
      setExistingImages(currentProduct.images || []);
      
      // Set variants - ensure at least one variant always exists
      if (currentProduct.variants && currentProduct.variants.length > 0) {
        const formVariants: FormVariant[] = currentProduct.variants.map(variant => ({
          sku: variant.sku || '',
          title: variant.title || '',
          attributes: {
            size: variant.attributes?.size,
            color: variant.attributes?.color || ''
          },
          price: variant.price || 0,
          mrp: variant.mrp || 0,
          stock: variant.stock || 0,
          tempImages: [],
          imagePreviewUrls: [],
          existingImages: variant.images || []
        }));
        setVariants(formVariants);
      } else {
        // If no variants exist, ensure at least one default variant
        setVariants([{ 
          sku: '',
          title: '',
          attributes: { size: undefined, color: '' },
          price: 0, 
          mrp: 0,
          stock: 0,
          tempImages: [],
          imagePreviewUrls: [],
          existingImages: []
        }]);
      }
    }
  }, [currentProduct, productId]);

  // Individual tab submission handlers
  const handleBasicInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingBasic(true);
    setError(null);
    
    if (!name || name.length < 2 || name.length > 200) {
      setError("Product name is required and must be between 2 and 200 characters");
      setIsSubmittingBasic(false);
      return;
    }
    
    if (!vendor || !vendor._id) {
      setError("Vendor information is required. Please try again or contact support.");
      setIsSubmittingBasic(false);
      return;
    }
    
    try {
      const productData: UpdateProductData = {
        name,
        shortDescription,
        description,
        categories,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        status,
        isFeatured,
        returnPolicy,
      };

      await editProduct(productId, productData);
      toast.success("Basic information updated successfully!");
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setIsSubmittingBasic(false);
    }
  };

  const handlePricingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingPricing(true);
    setError(null);
    
    try {
      const productData: UpdateProductData = {
        discountType: discountType || undefined,
        discountValue,
        buyXGetY: enableBuyXGetY ? { x: buyX, y: getY } : undefined,
      };

      await editProduct(productId, productData);
      toast.success("Pricing information updated successfully!");
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setIsSubmittingPricing(false);
    }
  };

  const handleVariantsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingVariants(true);
    setError(null);
    
    // Ensure at least one variant exists
    if (!variants.length || variants.length === 0) {
      setError("At least one product variant is required");
      setIsSubmittingVariants(false);
      return;
    }

    // Validate each variant has required fields
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      if (!variant.price || variant.price <= 0) {
        setError(`Variant ${i + 1} must have a valid price greater than 0`);
        setIsSubmittingVariants(false);
        return;
      }
    }
    
    try {
      if (currentProduct?.variants) {
        // Handle variant updates for existing variants
        const existingVariantPromises = variants
          .filter(variant => variant.sku && currentProduct.variants?.some(v => v.sku === variant.sku))
          .map(async (variant) => {
            if (!variant.sku) return;
            
            // Update variant data (excluding images)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { tempImages, imagePreviewUrls, existingImages, ...variantData } = variant;
            
            try {
              await updateProductVariant(productId, variant.sku, variantData);
              
              // Upload variant images if any
              if (variant.tempImages && variant.tempImages.length > 0) {
                await uploadVariantImages(productId, variant.sku, variant.tempImages);
              }
            } catch (error) {
              console.error(`Error updating variant ${variant.sku}:`, error);
            }
          });
        
        await Promise.all(existingVariantPromises);
        
        // Handle new variants (those without SKU or not found in current product)
        const newVariants = variants.filter(variant => 
          !variant.sku || !currentProduct.variants?.some(v => v.sku === variant.sku)
        );
        
        if (newVariants.length > 0) {
          const preparedNewVariants = newVariants.map(variant => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { tempImages, imagePreviewUrls, existingImages, ...variantData } = variant;
            return variantData;
          });
          
          try {
            // Add new variants first
            await addProductVariants(productId, preparedNewVariants);
            
            // Refetch the product to get the new variant SKUs
            const updatedProduct = await fetchProductById(productId);
            
            // Upload images for new variants
            if (updatedProduct && updatedProduct.variants) {
              const newVariantUploadPromises = newVariants.map(async (originalVariant) => {
                if (originalVariant.tempImages && originalVariant.tempImages.length > 0) {
                  // Find the corresponding new variant by matching attributes
                  const newVariant = updatedProduct.variants?.find((v: ProductVariant) => 
                    v.attributes?.size === originalVariant.attributes?.size &&
                    v.attributes?.color === originalVariant.attributes?.color &&
                    v.price === originalVariant.price
                  );
                  
                  if (newVariant && newVariant.sku) {
                    console.log(`Uploading ${originalVariant.tempImages.length} images for variant ${newVariant.sku}`);
                    await uploadVariantImages(productId, newVariant.sku, originalVariant.tempImages);
                  } else {
                    console.warn('Could not find matching variant for image upload:', originalVariant);
                  }
                }
              });
              
              await Promise.all(newVariantUploadPromises);
            }
          } catch (error) {
            console.error('Error adding new variants:', error);
            throw error;
          }
        }
      }
      
      // Clear temporary images and refresh product data after successful upload
      const clearedVariants = variants.map(variant => ({
        ...variant,
        tempImages: [],
        imagePreviewUrls: []
      }));
      setVariants(clearedVariants);
      
      // Refresh the product data to get updated variant images
      await fetchProductById(productId);
      
      toast.success("Variants and images updated successfully!");
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setIsSubmittingVariants(false);
    }
  };

  const handleImagesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingImages(true);
    setError(null);
    
    try {
      // Upload new product images if any
      if (imageFiles.length > 0) {
        await uploadProductImages(productId, imageFiles);
        // Clear uploaded files
        setImageFiles([]);
        setPreviewImages([]);
      }
      
      toast.success("Product images uploaded successfully!");
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setIsSubmittingImages(false);
    }
  };
  
  const removeImage = (index: number) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imageUrl: string) => {
    try {
      await deleteProductImage(productId, imageUrl);
      setExistingImages(prev => prev.filter(img => img !== imageUrl));
      toast.success("Image deleted successfully");
    } catch (error) {
      console.error('Error deleting image:', error);
      setError("Failed to delete image");
    }
  };
  
  const handleVariantChange = (index: number, field: string, value: string | number) => {
    const updatedVariants = [...variants];
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (parent === 'attributes' && updatedVariants[index].attributes) {
        if (child === 'size') {
          updatedVariants[index].attributes!.size = value as 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | undefined;
        } else if (child === 'color') {
          updatedVariants[index].attributes!.color = value as string;
        }
      }
    } else {
      switch (field) {
        case 'sku':
          updatedVariants[index].sku = value as string;
          break;
        case 'title':
          updatedVariants[index].title = value as string;
          break;
        case 'price':
          updatedVariants[index].price = value as number;
          break;
        case 'mrp':
          updatedVariants[index].mrp = value as number;
          break;
        case 'stock':
          updatedVariants[index].stock = value as number;
          break;
      }
    }
    
    setVariants(updatedVariants);
  };
  
  const addVariant = () => {
    setVariants(prev => [...prev, { 
      sku: '',
      title: '',
      attributes: { size: undefined, color: '' },
      price: 0, 
      mrp: 0,
      stock: 0,
      tempImages: [],
      imagePreviewUrls: [],
      existingImages: []
    }]);
  };
  
  // Helper function to check if a variant is valid (has required fields filled)
  const isVariantValid = (variant: FormVariant) => {
    return variant.price > 0 && variant.stock >= 0;
  };

  // Helper function to count valid variants
  const getValidVariantsCount = () => {
    return variants.filter(isVariantValid).length;
  };

  // Helper function to check if a specific variant can be removed
  const canRemoveVariant = (index: number) => {
    const currentVariant = variants[index];
    const isCurrentValid = isVariantValid(currentVariant);
    const validCount = getValidVariantsCount();
    
    // If current variant is valid, we need at least 2 valid variants to allow removal
    // If current variant is invalid, we can remove it as long as there's at least 1 valid variant
    return isCurrentValid ? validCount > 1 : validCount >= 1;
  };

  const removeVariant = async (index: number) => {
    // Check if this specific variant can be removed
    if (!canRemoveVariant(index)) {
      const currentVariant = variants[index];
      const isCurrentValid = isVariantValid(currentVariant);
      
      if (isCurrentValid) {
        toast.error("Cannot remove this variant. You must have at least one valid variant with price > 0.");
      } else {
        toast.error("Cannot remove this variant. You must have at least one valid variant remaining.");
      }
      return;
    }

    const variantToRemove = variants[index];
    
    // If variant has SKU and exists on server, remove it
    if (variantToRemove.sku && currentProduct?.variants?.some(v => v.sku === variantToRemove.sku)) {
      try {
        await removeProductVariant(productId, variantToRemove.sku);
      } catch (error) {
        console.error('Error removing variant from server:', error);
        setError("Failed to remove variant from server");
        return;
      }
    }
    
    setVariants(variants.filter((_, i) => i !== index));
  };
  
  const removeVariantImage = (variantIndex: number, imageIndex: number) => {
    const updatedVariants = [...variants];
    const variant = updatedVariants[variantIndex];
    
    // Remove from preview URLs
    if (variant.imagePreviewUrls) {
      variant.imagePreviewUrls = variant.imagePreviewUrls.filter((_: string, i: number) => i !== imageIndex);
    }
    
    // Remove from temp images
    if (variant.tempImages) {
      variant.tempImages = variant.tempImages.filter((_: File, i: number) => i !== imageIndex);
    }
    
    setVariants(updatedVariants);
  };

  const removeVariantExistingImage = async (variantIndex: number, imageUrl: string) => {
    const variant = variants[variantIndex];
    if (!variant.sku) {
      setError("Cannot delete image: variant SKU not found");
      return;
    }

    try {
      await deleteVariantImage(productId, variant.sku, imageUrl);
      
      const updatedVariants = [...variants];
      updatedVariants[variantIndex] = {
        ...updatedVariants[variantIndex],
        existingImages: updatedVariants[variantIndex].existingImages?.filter(img => img !== imageUrl) || []
      };
      setVariants(updatedVariants);
      toast.success("Variant image deleted successfully");
    } catch (error) {
      console.error('Error deleting variant image:', error);
      setError("Failed to delete variant image");
    }
  };

  if (isLoadingProduct || isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 animate-spin" />
            <span>Loading product data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Product not found or failed to load.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/product')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
            <p className="text-muted-foreground">Update product information and details</p>
          </div>
        </div>
        <Badge variant={status === 'active' ? 'default' : 'secondary'}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </div>

      {/* Alerts */}
      {vendor && (
        <Alert className="mb-6">
          <Package className="h-4 w-4" />
          <AlertDescription>
            Editing product for: <strong>{vendor.shopName}</strong>
          </AlertDescription>
        </Alert>
      )}
      
      {storeError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{storeError}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="variants">Variants</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
          </TabsList>
          
          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
            <form onSubmit={handleBasicInfoSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>Essential product details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter product name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={(value: 'draft' | 'active' | 'inactive' | 'archived') => setStatus(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Input
                    id="shortDescription"
                    type="text"
                    placeholder="Brief product description"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Full Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed product description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="categories">Categories</Label>
                    <Select
                      value={categories[0] || ''}
                      onValueChange={(value) => setCategories([value])}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((category) => (
                          <SelectItem key={category._id} value={category._id!}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      type="text"
                      placeholder="Comma-separated tags"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={isFeatured}
                      onCheckedChange={setIsFeatured}
                    />
                    <Label htmlFor="featured">Featured Product</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="returnPolicy">Return Policy</Label>
                    <Input
                      id="returnPolicy"
                      type="text"
                      placeholder="Return policy description"
                      value={returnPolicy}
                      onChange={(e) => setReturnPolicy(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button for Basic Info */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmittingBasic || !vendor}>
                {isSubmittingBasic ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Updating Basic Info...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Basic Info
                  </>
                )}
              </Button>
            </div>
            </form>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-6">
            <form onSubmit={handlePricingSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Pricing & Discounts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="discountType">Discount Type</Label>
                    <Select
                      value={discountType || '__none'}
                      onValueChange={(value: 'percentage' | 'flat' | '__none') => setDiscountType(value === '__none' ? '' : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select discount type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">No Discount</SelectItem>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="flat">Flat Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {discountType && (
                    <div className="space-y-2">
                      <Label htmlFor="discountValue">
                        Discount Value {discountType === 'percentage' ? '(%)' : '(₹)'}
                      </Label>
                      <Input
                        id="discountValue"
                        type="number"
                        placeholder="Enter discount value"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(Number(e.target.value))}
                        min="0"
                        step={discountType === 'percentage' ? '0.01' : '1'}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="buyXGetY"
                      checked={enableBuyXGetY}
                      onCheckedChange={setEnableBuyXGetY}
                    />
                    <Label htmlFor="buyXGetY">Enable Buy X Get Y Offer</Label>
                  </div>

                  {enableBuyXGetY && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="buyX">Buy (X)</Label>
                        <Input
                          id="buyX"
                          type="number"
                          placeholder="2"
                          value={buyX}
                          onChange={(e) => setBuyX(Number(e.target.value))}
                          min="1"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="getY">Get (Y)</Label>
                        <Input
                          id="getY"
                          type="number"
                          placeholder="1"
                          value={getY}
                          onChange={(e) => setGetY(Number(e.target.value))}
                          min="1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Submit Button for Pricing */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmittingPricing || !vendor}>
                {isSubmittingPricing ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Updating Pricing...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Pricing
                  </>
                )}
              </Button>
            </div>
            </form>
          </TabsContent>

          {/* Variants Tab */}
          <TabsContent value="variants" className="space-y-6">
            <form onSubmit={handleVariantsSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Product Variants
                </CardTitle>
                <CardDescription>
                  Manage different variations of your product (size, color, etc.). Variant images will be uploaded when you save the variants.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {variants.length === 1 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      At least one variant is required. You can add more variants for different sizes, colors, or specifications.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Validation Summary for invalid variants */}
                {variants.some(v => !isVariantValid(v)) && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Some variants need attention:
                      <ul className="list-disc list-inside mt-1 text-sm">
                        {variants.map((variant, idx) => (
                          <div key={idx}>
                            {variant.price <= 0 && <li>Variant {idx + 1}: Price must be greater than 0</li>}
                            {variant.stock < 0 && <li>Variant {idx + 1}: Stock cannot be negative</li>}
                          </div>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
                
                {variants.map((variant, index) => (
                  <VariantForm
                    key={index}
                    variant={variant}
                    index={index}
                    onVariantChange={handleVariantChange}
                    onVariantRemove={removeVariant}
                    onVariantImageAdd={(variantIndex, files) => {
                      const newPreviewUrls = files.map(file => URL.createObjectURL(file));
                      const updatedVariants = [...variants];
                      updatedVariants[variantIndex] = {
                        ...updatedVariants[variantIndex],
                        tempImages: [...(updatedVariants[variantIndex].tempImages || []), ...files],
                        imagePreviewUrls: [...(updatedVariants[variantIndex].imagePreviewUrls || []), ...newPreviewUrls]
                      };
                      setVariants(updatedVariants);
                    }}
                    onVariantImageRemove={removeVariantImage}
                    onVariantExistingImageRemove={removeVariantExistingImage}
                    canRemove={canRemoveVariant(index)}
                    isSkuDisabled={!!variant.sku && currentProduct?.variants?.some(v => v.sku === variant.sku)}
                  />
                ))}

                <Button type="button" variant="outline" onClick={addVariant} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variant
                </Button>
              </CardContent>
            </Card>

            {/* Submit Button for Variants */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmittingVariants || !vendor}>
                {isSubmittingVariants ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Updating Variants & Images...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Variants & Images
                  </>
                )}
              </Button>
            </div>
            </form>
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images" className="space-y-6">
            <form onSubmit={handleImagesSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Product Images
                </CardTitle>
                <CardDescription>
                  Upload high-quality images for your product
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  label="Product Images"
                  existingImages={existingImages}
                  previewImages={previewImages}
                  onImageAdd={(files) => {
                    setImageFiles(prev => [...prev, ...files]);
                    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
                    setPreviewImages(prev => [...prev, ...newPreviewUrls]);
                  }}
                  onImageRemove={removeImage}
                  onExistingImageRemove={removeExistingImage}
                  maxImages={8}
                />
              </CardContent>
            </Card>

            {/* Submit Button for Images */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmittingImages || !vendor}>
                {isSubmittingImages ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Uploading Images...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Upload Images
                  </>
                )}
              </Button>
            </div>
            </form>
          </TabsContent>
        </Tabs>

        {/* Global Actions */}
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.push('/product')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <div className="text-sm text-muted-foreground">
            Use the tabs above to update different sections of your product
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProductPage;

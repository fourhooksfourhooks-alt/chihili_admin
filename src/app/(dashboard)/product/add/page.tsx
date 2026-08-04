'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Tag, Package, DollarSign, ImageIcon, Plus, Trash2, X, Upload, AlertCircle, Clock } from 'lucide-react';
import { useCategoryStore } from '@/store/categoryStore';
import { useAuthStore } from '@/store/authStore';
import { useProductStore } from '@/store/productStore';
import type { CreateProductData } from '@/api/product.api';
import Image from 'next/image';
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
}

// shadcn/ui components (will be available once installed)
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AddProductPage = () => {
  const router = useRouter();
  
  // Store hooks
  const { categories: categoryOptions, fetchCategories } = useCategoryStore();
  const { vendor, fetchVendor } = useAuthStore();
  const { 
    addProduct, 
    uploadProductImages, 
    uploadVariantImages,
    error: storeError,
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
    imagePreviewUrls: []
  }]);
  
  // Images
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  
  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    fetchCategories();
    if (!vendor) {
      fetchVendor();
    }
  }, [fetchCategories, fetchVendor, vendor]);
  
  // Function to handle form reset
  const resetForm = () => {
    setName('');
    setShortDescription('');
    setDescription('');
    setCategories([]);
    setTags('');
    setStatus('draft');
    setIsFeatured(false);
    setReturnPolicy('7-day return/exchange available');
    setDiscountType('');
    setDiscountValue(0);
    setEnableBuyXGetY(false);
    setBuyX(2);
    setGetY(1);
    setVariants([{ 
      sku: '', 
      title: '', 
      attributes: { size: undefined, color: '' }, 
      price: 0, 
      mrp: 0, 
      stock: 0,
      tempImages: [],
      imagePreviewUrls: []
    }]);
    setImageFiles([]);
    setPreviewImages([]);
    setError(null);
  };
  
  // Helper functions for variant validation
  const isVariantValid = (variant: typeof variants[0]) => {
    return variant.price > 0 && variant.stock >= 0 && (!variant.mrp || variant.mrp >= variant.price);
  };

  const getValidVariantsCount = () => {
    return variants.filter(isVariantValid).length;
  };

  const canRemoveVariant = (variantIndex: number) => {
    const variant = variants[variantIndex];
    const isCurrentVariantValid = isVariantValid(variant);
    const validCount = getValidVariantsCount();
    
    // If this is a valid variant and it's the only valid one, don't allow removal
    if (isCurrentVariantValid && validCount <= 1) {
      return false;
    }
    
    // If this is an invalid variant, allow removal as long as there's at least one valid variant
    if (!isCurrentVariantValid && validCount >= 1) {
      return true;
    }
    
    // If this is a valid variant and there are other valid variants, allow removal
    if (isCurrentVariantValid && validCount > 1) {
      return true;
    }
    
    // Default: don't allow removal if there's only one variant
    return variants.length > 1;
  };
  
  // Helper function to check if form has validation errors
  const hasValidationErrors = () => {
    // Check basic fields
    if (!name || name.length < 2 || name.length > 200) return true;
    
    // Check variants
    if (!variants.length) return true;
    
    // Check each variant
    for (const variant of variants) {
      if (variant.price <= 0) return true;
      if (variant.stock < 0) return true;
      if (variant.mrp && variant.mrp < variant.price) return true;
    }
    
    // Check discount
    if (discountType === 'percentage' && discountValue > 100) return true;
    if (discountValue < 0) return true;
    
    // Check Buy X Get Y
    if (enableBuyXGetY && (buyX < 1 || getY < 1)) return true;
    
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    if (!name || name.length < 2 || name.length > 200) {
      toast.error("Product name is required and must be between 2 and 200 characters");
      setIsSubmitting(false);
      return;
    }
    
    if (!vendor || !vendor._id) {
      toast.error("Vendor information is required. Please try again or contact support.");
      setIsSubmitting(false);
      return;
    }

    // Validate discount settings
    if (discountType === 'percentage' && discountValue > 100) {
      toast.error("Percentage discount cannot exceed 100%");
      setIsSubmitting(false);
      return;
    }

    if (discountValue < 0) {
      toast.error("Discount value cannot be negative");
      setIsSubmitting(false);
      return;
    }

    // Validate Buy X Get Y settings
    if (enableBuyXGetY) {
      if (buyX < 1) {
        toast.error("Buy X value must be at least 1");
        setIsSubmitting(false);
        return;
      }
      if (getY < 1) {
        toast.error("Get Y value must be at least 1");
        setIsSubmitting(false);
        return;
      }
    }
    
    try {
      // Ensure at least one variant exists
      if (!variants.length || variants.length === 0) {
        toast.error("At least one product variant is required");
        setIsSubmitting(false);
        return;
      }

      // Validate each variant has required fields
      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i];
        if (!variant.price || variant.price <= 0) {
          toast.error(`Variant ${i + 1} must have a valid price greater than 0`);
          setIsSubmitting(false);
          return;
        }
        // Ensure stock is not negative
        if (variant.stock < 0) {
          toast.error(`Variant ${i + 1} stock cannot be negative`);
          setIsSubmitting(false);
          return;
        }
        // Validate MRP if provided
        if (variant.mrp && variant.mrp < variant.price) {
          toast.error(`Variant ${i + 1} MRP cannot be less than the selling price`);
          setIsSubmitting(false);
          return;
        }
      }
      
      const preparedVariants = variants.map(variant => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { tempImages, imagePreviewUrls, ...variantData } = variant;
        return variantData;
      });
      
      const productData: CreateProductData = {
        name,
        shortDescription,
        description,
        categories,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        status,
        isFeatured,
        returnPolicy,
        discountType: discountType || undefined,
        discountValue,
        variants: preparedVariants,
        buyXGetY: enableBuyXGetY ? { x: buyX, y: getY } : undefined,
        vendorId: vendor._id
      };

      const createdProduct = await addProduct(productData);
      console.log('Created Product:', createdProduct);
      
      if (!createdProduct || !createdProduct._id) {
        throw new Error('Failed to create product');
      }
      
      // Show initial success for product creation
      toast.success("Product created successfully! Uploading images...");
      
      try {
        if (imageFiles.length > 0) {
          await uploadProductImages(createdProduct._id, imageFiles);
        }
        
        const variantImageUploadPromises = variants.map(async (variant, index) => {
          if (variant.tempImages && variant.tempImages.length > 0) {
            // Use the SKU returned by the server for the created product's variants
            const sku = createdProduct.variants?.[index]?.sku;
            if (!sku) {
              // If SKU is not available, skip variant image upload for this index
              console.warn(`Skipping variant image upload: no SKU for variant index ${index}`);
              return Promise.resolve();
            }

            return uploadVariantImages(
              createdProduct._id!,
              sku,
              variant.tempImages
            );
          }
          return Promise.resolve();
        });
        
        await Promise.all(variantImageUploadPromises);
      } catch (imageError: unknown) {
        const errorMessage = imageError instanceof Error ? imageError.message : 'Unknown error occurred';
        toast.error(`Product created but there was an issue uploading images: ${errorMessage}`);
        setTimeout(() => {
          resetForm();
          router.push('/product');
        }, 3000);
        setIsSubmitting(false);
        return;
      }
      
      toast.success("Product created successfully with all images!");
      setTimeout(() => {
        resetForm();
        router.push('/product');
      }, 1500);
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...newFiles]);
      
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      setPreviewImages(prev => [...prev, ...newPreviewUrls]);
    }
  };
  
  const removeImage = (index: number) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
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
      imagePreviewUrls: []
    }]);
  };
  
  const removeVariant = (index: number) => {
    if (!canRemoveVariant(index)) {
      const variant = variants[index];
      const isCurrentVariantValid = isVariantValid(variant);
      const validCount = getValidVariantsCount();
      
      if (isCurrentVariantValid && validCount <= 1) {
        toast.error("Cannot remove the last valid variant. Please ensure at least one variant has valid price and stock information.");
      } else {
        toast.error("Cannot remove this variant. A product must have at least one variant.");
      }
      return;
    }
    setVariants(variants.filter((_, i) => i !== index));
  };
  
  const handleVariantImageChange = (variantIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      
      const updatedVariants = [...variants];
      updatedVariants[variantIndex] = {
        ...updatedVariants[variantIndex],
        tempImages: [...(updatedVariants[variantIndex].tempImages || []), ...newFiles],
        imagePreviewUrls: [...(updatedVariants[variantIndex].imagePreviewUrls || []), ...newPreviewUrls]
      };
      
      setVariants(updatedVariants);
    }
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
  
  const handleNameChange = (value: string) => {
    setName(value);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/product')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
            <p className="text-muted-foreground">Create a well-crafted product listing to attract customers</p>
          </div>
        </div>
        <Badge variant="secondary">Draft</Badge>
      </div>

      {/* Alerts */}
      {vendor && (
        <Alert className="mb-6">
          <Package className="h-4 w-4" />
          <AlertDescription>
            Adding product for: <strong>{vendor.shopName}</strong>
          </AlertDescription>
        </Alert>
      )}
      
      {storeError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{storeError}</AlertDescription>
        </Alert>
      )}

      {!vendor && (
        <Alert className="mb-6">
          <Clock className="h-4 w-4" />
          <AlertDescription>Loading vendor information...</AlertDescription>
        </Alert>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="variants">Variants</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
          </TabsList>
          
          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
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
                    <Label htmlFor="name">Product Name * <span className="text-xs text-muted-foreground">(2-200 characters)</span></Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Enter product name"
                      required
                      minLength={2}
                      maxLength={200}
                      className={name.length > 0 && (name.length < 2 || name.length > 200) ? "border-red-300 focus:border-red-500" : ""}
                    />
                    {name.length > 0 && name.length < 2 && (
                      <p className="text-xs text-red-500">Product name must be at least 2 characters</p>
                    )}
                    {name.length > 200 && (
                      <p className="text-xs text-red-500">Product name cannot exceed 200 characters</p>
                    )}
                  </div>
                  
                  {/* slug is auto-generated on the backend; input removed */}
                  
                  <div className="space-y-2">
                    <Label htmlFor="shortDescription">Short Description</Label>
                    <Input
                      id="shortDescription"
                      value={shortDescription}
                      onChange={(e) => setShortDescription(e.target.value)}
                      placeholder="Brief description"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="categories">Categories</Label>
                    <Select value={categories[0] || ""} onValueChange={(value) => setCategories(value ? [value] : [])}>
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
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Product description"
                      rows={4}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="tag1, tag2, tag3"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={(value: string) => setStatus(value as 'draft' | 'active' | 'inactive' | 'archived')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="returnPolicy">Return Policy</Label>
                    <Input
                      id="returnPolicy"
                      value={returnPolicy}
                      onChange={(e) => setReturnPolicy(e.target.value)}
                      placeholder="Return policy"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="featured"
                      checked={isFeatured}
                      onCheckedChange={(checked) => setIsFeatured(checked as boolean)}
                    />
                    <Label htmlFor="featured">Featured Product</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-6">
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
                    <Label>Discount Type</Label>
                    {/* Select primitives require non-empty values for items. Use 'none' as a sentinel and map it to empty string in state */}
                    <Select
                      value={discountType || 'none'}
                      onValueChange={(value: string) => setDiscountType(value === 'none' ? '' : (value as 'percentage' | 'flat' | ''))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="No discount" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Discount</SelectItem>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="flat">Flat Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {discountType && (
                    <div className="space-y-2">
                      <Label>Discount Value {discountType === 'percentage' ? '(%)' : '(₹)'}</Label>
                      <Input
                        type="number"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                        min="0"
                        max={discountType === 'percentage' ? "100" : undefined}
                        step={discountType === 'percentage' ? '0.01' : '1'}
                        className={
                          discountType === 'percentage' && discountValue > 100 
                            ? "border-red-300 focus:border-red-500" 
                            : ""
                        }
                      />
                      {discountType === 'percentage' && discountValue > 100 && (
                        <p className="text-xs text-red-500">Percentage discount cannot exceed 100%</p>
                      )}
                      {discountValue < 0 && (
                        <p className="text-xs text-red-500">Discount value cannot be negative</p>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Buy X Get Y Promotion</Label>
                    <p className="text-sm text-muted-foreground">Enable bulk purchase promotions</p>
                  </div>
                  <Switch checked={enableBuyXGetY} onCheckedChange={setEnableBuyXGetY} />
                </div>
                
                {enableBuyXGetY && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Buy X <span className="text-xs text-muted-foreground">(Min: 1)</span></Label>
                      <Input
                        type="number"
                        value={buyX}
                        onChange={(e) => setBuyX(parseInt(e.target.value) || 2)}
                        min="1"
                        className={buyX < 1 ? "border-red-300 focus:border-red-500" : ""}
                      />
                      {buyX < 1 && (
                        <p className="text-xs text-red-500">Must buy at least 1 item</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Get Y Free <span className="text-xs text-muted-foreground">(Min: 1)</span></Label>
                      <Input
                        type="number"
                        value={getY}
                        onChange={(e) => setGetY(parseInt(e.target.value) || 1)}
                        min="1"
                        className={getY < 1 ? "border-red-300 focus:border-red-500" : ""}
                      />
                      {getY < 1 && (
                        <p className="text-xs text-red-500">Must get at least 1 free item</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Variants Tab */}
          <TabsContent value="variants" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Product Variants
                    </CardTitle>
                    <CardDescription>Define different versions of your product</CardDescription>
                  </div>
                  <Button type="button" onClick={addVariant} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Variant
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
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
                            {variant.mrp && variant.mrp < variant.price && <li>Variant {idx + 1}: MRP should be higher than or equal to selling price</li>}
                          </div>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
                
                {variants.map((variant, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Variant {index + 1}</CardTitle>
                        {canRemoveVariant(index) ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVariant(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled
                            title="Cannot remove - at least one valid variant required"
                            className="text-muted-foreground"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Title and Basic Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Variant Title</Label>
                          <Input
                            value={variant.title}
                            onChange={(e) => handleVariantChange(index, 'title', e.target.value)}
                            placeholder="e.g., Red / Large"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>SKU</Label>
                          <Input
                            value={variant.sku}
                            onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                            placeholder="Auto-generated if empty"
                            disabled
                          />
                          <p className="text-xs text-muted-foreground">SKU will be auto-generated by the system</p>
                        </div>
                      </div>

                      {/* Attributes */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Size</Label>
                          <Select 
                            value={variant.attributes?.size || ""} 
                            onValueChange={(value) => handleVariantChange(index, 'attributes.size', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent>
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
                          <Label>Color</Label>
                          <Input
                            value={variant.attributes?.color || ''}
                            onChange={(e) => handleVariantChange(index, 'attributes.color', e.target.value)}
                            placeholder="e.g., Red, Blue, Black"
                          />
                        </div>
                      </div>

                      {/* Pricing and Stock */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Price * <span className="text-xs text-muted-foreground">(Required)</span></Label>
                          <Input
                            type="number"
                            value={variant.price}
                            onChange={(e) => handleVariantChange(index, 'price', parseFloat(e.target.value) || 0)}
                            min="0.01"
                            step="0.01"
                            required
                            className={variant.price <= 0 ? "border-red-300 focus:border-red-500" : ""}
                          />
                          {variant.price <= 0 && (
                            <p className="text-xs text-red-500">Price must be greater than 0</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label>MRP <span className="text-xs text-muted-foreground">(Optional)</span></Label>
                          <Input
                            type="number"
                            value={variant.mrp || ''}
                            onChange={(e) => handleVariantChange(index, 'mrp', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                            placeholder="Maximum Retail Price"
                            className={variant.mrp && variant.mrp < variant.price ? "border-yellow-300 focus:border-yellow-500" : ""}
                          />
                          {variant.mrp && variant.mrp < variant.price && (
                            <p className="text-xs text-yellow-600">MRP should typically be higher than or equal to the selling price</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label>Stock * <span className="text-xs text-muted-foreground">(Required)</span></Label>
                          <Input
                            type="number"
                            value={variant.stock}
                            onChange={(e) => handleVariantChange(index, 'stock', parseInt(e.target.value) || 0)}
                            min="0"
                            required
                            className={variant.stock < 0 ? "border-red-300 focus:border-red-500" : ""}
                          />
                          {variant.stock < 0 && (
                            <p className="text-xs text-red-500">Stock cannot be negative</p>
                          )}
                        </div>
                      </div>

                      {/* Variant Images */}
                      <div className="space-y-2">
                        <Label>Variant Images</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                          {variant.imagePreviewUrls?.map((img: string, imgIndex: number) => (
                            <div key={imgIndex} className="relative group">
                              <div className="aspect-square overflow-hidden rounded-lg border">
                                <Image
                                  src={img}
                                  alt={`Variant ${index} Image ${imgIndex}`}
                                  width={100}
                                  height={100}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                                onClick={() => removeVariantImage(index, imgIndex)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          
                          <div className="aspect-square border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                            <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                              <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                              <span className="text-xs text-muted-foreground text-center">Add Images</span>
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleVariantImageChange(index, e)}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Product Images
                </CardTitle>
                <CardDescription>Upload images to showcase your product</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {previewImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square overflow-hidden rounded-lg border">
                        <Image
                          src={img}
                          alt={`Product ${index}`}
                          width={200}
                          height={200}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 h-8 w-8 p-0"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <div className="aspect-square border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                    <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground mt-2">Upload Image</span>
                      <input
                        type="file"
                        onChange={handleImageChange}
                        accept="image/*"
                        multiple
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Form Actions */}
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.push('/product')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <div className="space-x-2">
            <Button type="button" variant="outline">Save Draft</Button>
            <Button type="submit" disabled={isSubmitting || !vendor || hasValidationErrors()}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Product
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddProductPage;

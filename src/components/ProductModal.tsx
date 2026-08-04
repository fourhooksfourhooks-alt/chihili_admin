import { useState, useEffect } from 'react';
import { X, Upload, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import { useCategoryStore } from '@/store/categoryStore';
import { useAuthStore } from '@/store/authStore';

interface Product {
  _id?: string;
  name: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  categories?: string[];
  tags?: string[];
  status?: 'draft' | 'active' | 'inactive' | 'archived';
  isFeatured?: boolean;
  returnPolicy?: string;
  discountType?: 'percentage' | 'flat' | '';
  discountValue?: number;
  buyXGetY?: { x: number; y: number };
  variants?: any[];
  images?: string[];
}

interface ProductVariant {
  _id?: string;
  sku: string;
  title: string;
  attributes?: { size: string; color: string };
  price: number;
  mrp?: number;
  stock: number;
  images?: string[];
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData: Product | null;
  mode: 'create' | 'edit';
}

const ProductModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}: ProductModalProps) => {
  // State variables for form fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
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
  const [variants, setVariants] = useState<any[]>([{ 
    sku: '',
    title: '',
    attributes: { size: '', color: '' },
    price: 0, 
    mrp: 0,
    stock: 0,
    tempImages: [], // Files to be uploaded
    imagePreviewUrls: [] // URLs for preview
  }]);
  
  // Images
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  
  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Category store
  const { categories: categoryOptions, fetchCategories } = useCategoryStore();
  
  // Auth store to get vendor information
  const { vendor, fetchVendor } = useAuthStore();
  
  useEffect(() => {
    fetchCategories();
    
    // Fetch vendor if not already loaded
    if (!vendor) {
      fetchVendor();
    }
  }, [fetchCategories, fetchVendor, vendor]);
  
  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setSlug(initialData.slug || '');
      setShortDescription(initialData.shortDescription || '');
      setDescription(initialData.description || '');
      setCategories(initialData.categories || []);
      setTags(initialData.tags?.join(', ') || '');
      setStatus(initialData.status || 'draft');
      setIsFeatured(initialData.isFeatured || false);
      setReturnPolicy(initialData.returnPolicy || '7-day return/exchange available');
      
      // Set discount information
      setDiscountType(initialData.discountType || '');
      setDiscountValue(initialData.discountValue || 0);
      
      // Set Buy X Get Y
      if (initialData.buyXGetY && initialData.buyXGetY.x && initialData.buyXGetY.y) {
        setEnableBuyXGetY(true);
        setBuyX(initialData.buyXGetY.x);
        setGetY(initialData.buyXGetY.y);
      } else {
        setEnableBuyXGetY(false);
        setBuyX(2);
        setGetY(1);
      }
      
      // Set variants
      setVariants(initialData.variants && initialData.variants.length > 0 ? 
        initialData.variants.map(variant => ({
          ...variant,
          attributes: variant.attributes || { size: '', color: '' },
          tempImages: [],
          imagePreviewUrls: variant.images || []
        })) : 
        [{ 
          sku: '', 
          title: '', 
          attributes: { size: '', color: '' }, 
          price: 0, 
          mrp: 0, 
          stock: 0,
          tempImages: [],
          imagePreviewUrls: []
        }]);
      
      // Set images
      setImages(initialData.images || []);
      setPreviewImages(initialData.images || []);
    } else {
      resetForm();
    }
  }, [initialData]);
  
  // Function to handle form reset
  const resetForm = () => {
    setName('');
    setSlug('');
    setShortDescription('');
    setDescription('');
    setCategories([]);
    setTags('');
    setStatus('draft');
    setIsFeatured(false);
    setReturnPolicy('7-day return/exchange available');
    
    // Reset discount fields
    setDiscountType('');
    setDiscountValue(0);
    
    // Reset Buy X Get Y
    setEnableBuyXGetY(false);
    setBuyX(2);
    setGetY(1);
    
    // Reset variants
    setVariants([{ 
      sku: '', 
      title: '', 
      attributes: { size: '', color: '' }, 
      price: 0, 
      mrp: 0, 
      stock: 0,
      tempImages: [],
      imagePreviewUrls: []
    }]);
    
    // Reset images
    setImages([]);
    setImageFiles([]);
    setPreviewImages([]);
    setError(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    // Validate required fields based on backend validation rules
    if (!name || name.length < 2 || name.length > 200) {
      setError("Product name is required and must be between 2 and 200 characters");
      setIsSubmitting(false);
      return;
    }
    
    // Check if variants have valid price and stock
    const hasInvalidVariants = variants.some(variant => 
      variant.price < 0 || variant.stock < 0 || 
      (variant.mrp && variant.mrp < 0)
    );
    
    if (hasInvalidVariants) {
      setError("All variants must have valid price and stock values (0 or greater)");
      setIsSubmitting(false);
      return;
    }
    
    // Check if vendor is available
    if (!vendor || !vendor._id) {
      setError("Vendor information is required. Please try again or contact support.");
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Handle variants - backend expects at least one variant with valid data
      if (!variants.length) {
        setError("At least one product variant is required");
        setIsSubmitting(false);
        return;
      }
      
      // Prepare the product data to pass to parent component
      const productData = {
        _id: initialData?._id || 'temp-id-' + Date.now(),
        name,
        slug,
        shortDescription,
        description,
        categories,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        status,
        isFeatured,
        returnPolicy,
        discountType,
        discountValue,
        variants,
        imageFiles,
        buyXGetY: enableBuyXGetY ? { x: buyX, y: getY } : undefined
      };
      
      // Pass the data to parent component
      await onSubmit(productData);
      
      console.log('Product successfully saved');
      resetForm();
      onClose(); // Close the modal after successful submission
    } catch (err: any) {
      console.error('Error in handleSubmit:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...newFiles]);
      
      // Create preview URLs
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      setPreviewImages(prev => [...prev, ...newPreviewUrls]);
    }
  };
  
  const removeImage = (index: number) => {
    // Remove from preview
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    
    // If it's an existing image
    if (index < images.length) {
      setImages(prev => prev.filter((_, i) => i !== index));
    } 
    // If it's a new file
    else {
      const newFileIndex = index - images.length;
      setImageFiles(prev => prev.filter((_, i) => i !== newFileIndex));
    }
  };
  
  const handleVariantChange = (index: number, field: string, value: any) => {
    const updatedVariants = [...variants];
    
    if (field.includes('.')) {
      // Handle nested fields like 'attributes.size'
      const [parent, child] = field.split('.');
      updatedVariants[index][parent][child] = value;
    } else {
      updatedVariants[index][field] = value;
    }
    
    setVariants(updatedVariants);
  };
  
  const addVariant = () => {
    setVariants(prev => [...prev, { 
      sku: '',
      title: '',
      attributes: { size: '', color: '' },
      price: 0, 
      mrp: 0,
      stock: 0,
      tempImages: [],
      imagePreviewUrls: []
    }]);
  };
  
  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };
  
  // Handle variant image upload
  const handleVariantImageUpload = (variantIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const newFiles = Array.from(e.target.files);
    
    // Create preview URLs for immediate display
    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
    
    // We'll need to store these files to upload when the form is submitted
    const updatedVariants = [...variants];
    
    // Add new files to be uploaded later
    updatedVariants[variantIndex].tempImages = [
      ...(updatedVariants[variantIndex].tempImages || []),
      ...newFiles
    ];
    
    // Add preview URLs for display
    updatedVariants[variantIndex].imagePreviewUrls = [
      ...(updatedVariants[variantIndex].imagePreviewUrls || []),
      ...newPreviewUrls
    ];
    
    setVariants(updatedVariants);
  };
  
  // Remove variant image
  const removeVariantImage = (variantIndex: number, imageIndex: number) => {
    const updatedVariants = [...variants];
    const variant = updatedVariants[variantIndex];
    
    // If it's an existing image
    if (variant.images && imageIndex < variant.images.length) {
      const existingImages = [...variant.images];
      existingImages.splice(imageIndex, 1);
      variant.images = existingImages;
    }
    
    // Remove from preview
    if (variant.imagePreviewUrls) {
      const previewUrls = [...variant.imagePreviewUrls];
      previewUrls.splice(imageIndex, 1);
      variant.imagePreviewUrls = previewUrls;
    }
    
    // If it's a new file
    if (variant.tempImages && imageIndex >= (variant.images?.length || 0)) {
      const tempImageIndex = imageIndex - (variant.images?.length || 0);
      const tempImages = [...variant.tempImages];
      tempImages.splice(tempImageIndex, 1);
      variant.tempImages = tempImages;
    }
    
    setVariants(updatedVariants);
  };
  
  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setName(value);
    // Only auto-generate slug if user hasn't manually entered one or in create mode
    if (mode === 'create' || slug === '') {
      setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'create' ? 'Add New Product (Basic Info Only)' : 'Edit Product'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Vendor information */}
          {vendor && (
            <div className="mb-4 p-2 bg-gray-50 rounded-md text-sm text-gray-700">
              Adding product for: <span className="font-semibold">{vendor.shopName}</span>
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          {!vendor && (
            <div className="mb-4 p-4 bg-yellow-50 text-yellow-700 rounded-md">
              Loading vendor information... If this persists, please refresh the page.
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name*
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  minLength={2}
                  maxLength={200}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary1 focus:ring-primary1 sm:text-sm"
                  placeholder="Enter product name"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Must be between 2 and 200 characters
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug*
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary1 focus:ring-primary1 sm:text-sm"
                  placeholder="product-url-slug"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary1 focus:ring-primary1 sm:text-sm"
                  placeholder="Brief description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categories
                </label>
                <select
                  multiple
                  value={categories}
                  onChange={(e) => {
                    const selectedOptions = Array.from(
                      e.target.selectedOptions,
                      (option) => option.value
                    );
                    setCategories(selectedOptions);
                  }}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary1 focus:ring-primary1 sm:text-sm"
                >
                  {categoryOptions.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Hold Ctrl/Cmd to select multiple categories
                </p>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary1 focus:ring-primary1 sm:text-sm"
                  placeholder="Detailed product description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary1 focus:ring-primary1 sm:text-sm"
                  placeholder="Tag1, Tag2, Tag3"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Comma separated list of tags
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary1 focus:ring-primary1 sm:text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Return Policy
                </label>
                <input
                  type="text"
                  value={returnPolicy}
                  onChange={(e) => setReturnPolicy(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary1 focus:ring-primary1 sm:text-sm"
                  placeholder="Return policy"
                />
              </div>
              
              {/* Discount Section */}
              <div className="md:col-span-2 border-t pt-4 mt-2">
                <h3 className="text-md font-medium text-gray-900 mb-3">Discount Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Type
                    </label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'flat' | '')}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary1 focus:ring-primary1 sm:text-sm"
                    >
                      <option value="">No Discount</option>
                      <option value="percentage">Percentage</option>
                      <option value="flat">Flat Amount</option>
                    </select>
                  </div>
                  
                  {discountType && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discount Value {discountType === 'percentage' ? '(%)' : '(₹)'}
                      </label>
                      <input
                        type="number"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                        min="0"
                        max={discountType === 'percentage' ? "100" : undefined}
                        step="0.01"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary1 focus:ring-primary1 sm:text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Buy X Get Y Promotion */}
              <div className="md:col-span-2 border-t pt-4 mt-2">
                <div className="flex items-center mb-3">
                  <input
                    id="enableBuyXGetY"
                    type="checkbox"
                    checked={enableBuyXGetY}
                    onChange={(e) => setEnableBuyXGetY(e.target.checked)}
                    className="h-4 w-4 text-primary1 focus:ring-primary1 border-gray-300 rounded"
                  />
                  <label htmlFor="enableBuyXGetY" className="ml-2 block text-md font-medium text-gray-900">
                    Enable "Buy X Get Y" Promotion
                  </label>
                </div>
                
                {enableBuyXGetY && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 mt-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Buy X Items
                      </label>
                      <input
                        type="number"
                        value={buyX}
                        onChange={(e) => setBuyX(parseInt(e.target.value, 10) || 0)}
                        min="1"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary1 focus:ring-primary1 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Get Y Free
                      </label>
                      <input
                        type="number"
                        value={getY}
                        onChange={(e) => setGetY(parseInt(e.target.value, 10) || 0)}
                        min="1"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary1 focus:ring-primary1 sm:text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center">
                <input
                  id="featured"
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="h-4 w-4 text-primary1 focus:ring-primary1 border-gray-300 rounded"
                />
                <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                  Featured Product
                </label>
              </div>
            </div>
            
            {/* Variants Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium text-gray-900">Product Variants</h3>
                <button
                  type="button"
                  onClick={addVariant}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary1 hover:bg-primary1/90 focus:outline-none"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Variant
                </button>
              </div>
              
              {variants.map((variant, index) => (
                <div key={index} className="border rounded-md p-4 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-medium">Variant {index + 1}</h4>
                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SKU
                      </label>
                      <input
                        type="text"
                        value={variant.sku}
                        onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary1 focus:ring-primary1 sm:text-sm"
                        placeholder="SKU-001"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={variant.title}
                        onChange={(e) => handleVariantChange(index, 'title', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary1 focus:ring-primary1 sm:text-sm"
                        placeholder="Red / L"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Color
                      </label>
                      <input
                        type="text"
                        value={variant.attributes.color}
                        onChange={(e) => handleVariantChange(index, 'attributes.color', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary1 focus:ring-primary1 sm:text-sm"
                        placeholder="Red"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Size
                      </label>
                      <select
                        value={variant.attributes.size}
                        onChange={(e) => handleVariantChange(index, 'attributes.size', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary1 focus:ring-primary1 sm:text-sm"
                      >
                        <option value="">No Size</option>
                        <option value="XS">XS</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Selling Price*
                      </label>
                      <input
                        type="number"
                        value={variant.price}
                        onChange={(e) => handleVariantChange(index, 'price', parseFloat(e.target.value) || 0)}
                        required
                        min="0"
                        step="0.01"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary1 focus:ring-primary1 sm:text-sm"
                        placeholder="0.00"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Must be 0 or greater
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        MRP (Original Price)
                      </label>
                      <input
                        type="number"
                        value={variant.mrp || ''}
                        onChange={(e) => handleVariantChange(index, 'mrp', e.target.value ? parseFloat(e.target.value) : '')}
                        min="0"
                        step="0.01"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary1 focus:ring-primary1 sm:text-sm"
                        placeholder="0.00"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Leave empty if no MRP
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock*
                      </label>
                      <input
                        type="number"
                        value={variant.stock}
                        onChange={(e) => handleVariantChange(index, 'stock', parseInt(e.target.value, 10) || 0)}
                        required
                        min="0"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary1 focus:ring-primary1 sm:text-sm"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  
                  {/* Variant Images Section */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Variant Images
                    </label>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-2">
                      {variant.imagePreviewUrls && variant.imagePreviewUrls.map((img: string, imgIndex: number) => (
                        <div key={imgIndex} className="relative group">
                          <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200">
                            <img
                              src={img}
                              alt={`Variant ${index} image ${imgIndex}`}
                              className="h-full w-full object-cover object-center"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeVariantImage(index, imgIndex)}
                            className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm opacity-80 hover:opacity-100"
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      ))}
                      
                      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md border-2 border-dashed border-gray-300 p-2 flex flex-col items-center justify-center">
                        <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                          <Upload className="h-6 w-6 text-gray-400 mb-1" />
                          <span className="text-xs text-gray-500">Variant Image</span>
                          <input
                            type="file"
                            onChange={(e) => handleVariantImageUpload(index, e)}
                            className="sr-only"
                            accept="image/*"
                            multiple
                          />
                        </label>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500">
                      Upload specific images for this variant (optional)
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Product Images */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                {previewImages.map((img, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200">
                      <img
                        src={img}
                        alt={`Product ${index}`}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm opacity-80 hover:opacity-100"
                    >
                      <X className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                ))}
                
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md border-2 border-dashed border-gray-300 p-2 flex flex-col items-center justify-center">
                  <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-xs text-gray-500">Upload Image</span>
                    <input
                      type="file"
                      onChange={handleImageChange}
                      className="sr-only"
                      accept="image/*"
                      multiple
                    />
                  </label>
                </div>
              </div>
              
              <p className="text-xs text-gray-500">
                Upload product images. First image will be used as the main product image.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !vendor}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary1 hover:bg-primary1/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary1 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Product Only' : 'Update Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;

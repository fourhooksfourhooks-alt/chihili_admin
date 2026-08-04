import axiosInstance from './axiosInstance';

export interface Product {
  _id?: string;
  vendorId: string;
  name: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  categories?: string[];
  tags?: string[];
  images?: string[];
  variants: ProductVariant[]; // Made required - at least one variant is mandatory
  status: 'draft' | 'active' | 'inactive' | 'archived';
  isFeatured: boolean;
  returnPolicy?: string;
  discountType?: 'percentage' | 'flat';
  discountValue?: number;
  buyXGetY?: {
    x: number;
    y: number;
  };
  avgRating?: number;
  ratingsCount?: number;
  totalReviews?: number;
  ratingDistribution?: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  salesCount?: number;
  wishlistCount?: number;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductVariant {
  sku?: string;
  title?: string;
  attributes?: {
    size?: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
    color?: string;
  };
  price: number; // Made required
  mrp?: number;
  stock?: number;
  images?: string[];
}

export interface ProductFilters {
  search?: string;
  categories?: string[];
  category?: string;
  status?: 'draft' | 'active' | 'inactive' | 'archived' | 'all';
  isFeatured?: boolean;
  sort?: string;
  vendorId?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
  color?: string;
  tag?: string;
  createdAt?: string;
  page?: number;
  limit?: number;
  fields?: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface ProductResponse {
  product: Product;
}

export interface CreateProductData {
  vendorId: string;
  name: string;
  shortDescription?: string;
  description?: string;
  categories?: string[];
  tags?: string[];
  variants: Omit<ProductVariant, 'sku'>[]; // Made required - at least one variant is mandatory
  status?: 'draft' | 'active' | 'inactive' | 'archived';
  isFeatured?: boolean;
  discountType?: 'percentage' | 'flat';
  discountValue?: number;
  buyXGetY?: {
    x: number;
    y: number;
  };
  returnPolicy?: string;
}

export interface UpdateProductData {
  name?: string;
  shortDescription?: string;
  description?: string;
  categories?: string[];
  tags?: string[];
  status?: 'draft' | 'active' | 'inactive' | 'archived';
  isFeatured?: boolean;
  discountType?: 'percentage' | 'flat';
  discountValue?: number;
  buyXGetY?: {
    x: number;
    y: number;
  };
  returnPolicy?: string;
  slug?: string;
  // Note: variants and images are explicitly excluded
  // They should be managed through dedicated endpoints
}

export interface StockUpdate {
  sku: string;
  stock: number;
}

export interface ImageUploadResponse {
  product: Product;
  uploadedImages: string[];
  failedCount?: number;
  totalAttempted?: number;
}

// ===========================
// CORE PRODUCT CRUD OPERATIONS (No Images)
// ===========================

/**
 * Get all products with filtering options
 */
export const getProducts = async (filters: ProductFilters = {}): Promise<ProductsResponse> => {
  const { data } = await axiosInstance.get('/products', {
    params: filters,
  });
  return data.data;
};

/**
 * Get a single product by ID
 */
export const getProductById = async (id: string): Promise<ProductResponse> => {
  const { data } = await axiosInstance.get(`/products/${id}`);
  return data.data;
};

/**
 * Get a single product by slug
 */
export const getProductBySlug = async (slug: string): Promise<ProductResponse> => {
  const { data } = await axiosInstance.get(`/products/slug/${slug}`);
  return data.data;
};

/**
 * Get vendor products
 */
export const getVendorProducts = async (
  vendorId: string, 
  filters: ProductFilters = {}
): Promise<ProductsResponse> => {
  const { data } = await axiosInstance.get(`/products/vendor/${vendorId}`, {
    params: filters,
  });
  return data.data;
};

/**
 * Create a new product (variants can be included during creation but without images)
 * Note: At least one variant is required. Variant images should be uploaded separately after product creation.
 * @param productData - Product data including required variants array
 */
export const createProduct = async (productData: CreateProductData): Promise<ProductResponse> => {
  const { data } = await axiosInstance.post('/products', productData);
  return data.data;
};

/**
 * Update an existing product (no images or variants - use separate upload/management endpoints)
 * Note: This endpoint now excludes variants and images to prevent accidental overwrites.
 * Use dedicated endpoints for:
 * - Product images: uploadProductImages(), deleteProductImage()
 * - Variant images: uploadVariantImages(), deleteVariantImage()
 * - Variant management: addVariants(), updateVariant(), removeVariant()
 */
export const updateProduct = async (id: string, productData: UpdateProductData): Promise<ProductResponse> => {
  const { data } = await axiosInstance.put(`/products/${id}`, productData);
  return data.data;
};

/**
 * Delete a product (soft delete)
 */
export const deleteProduct = async (id: string): Promise<{ message: string }> => {
  const { data } = await axiosInstance.delete(`/products/${id}`);
  return data.data;
};

// ===========================
// PRODUCT STATUS MANAGEMENT
// ===========================

/**
 * Update product status
 */
export const updateProductStatus = async (
  id: string, 
  status: 'draft' | 'active' | 'inactive' | 'archived'
): Promise<ProductResponse> => {
  const { data } = await axiosInstance.patch(`/products/${id}/status`, { status });
  return data.data;
};

/**
 * Toggle featured status
 */
export const toggleFeatured = async (id: string, isFeatured: boolean): Promise<ProductResponse> => {
  const { data } = await axiosInstance.patch(`/products/${id}/feature`, { isFeatured });
  return data.data;
};

// ===========================
// VARIANT MANAGEMENT
// ===========================

/**
 * Add variants to a product (no images - use separate upload endpoints for variant images)
 */
export const addVariants = async (
  productId: string, 
  variants: Omit<ProductVariant, 'sku'>[]
): Promise<ProductResponse> => {
  const { data } = await axiosInstance.post(`/products/${productId}/variants`, { variants });
  return data.data;
};

/**
 * Update a specific variant (no images)
 */
export const updateVariant = async (
  productId: string, 
  sku: string, 
  variantData: Partial<Omit<ProductVariant, 'sku'>>
): Promise<ProductResponse> => {
  const { data } = await axiosInstance.put(`/products/${productId}/variants/${sku}`, variantData);
  return data.data;
};

/**
 * Remove a variant from a product
 */
export const removeVariant = async (productId: string, sku: string): Promise<ProductResponse> => {
  const { data } = await axiosInstance.delete(`/products/${productId}/variants/${sku}`);
  return data.data;
};

// ===========================
// STOCK MANAGEMENT
// ===========================

/**
 * Update stock for multiple variants
 */
export const updateStock = async (
  productId: string, 
  updates: StockUpdate[]
): Promise<ProductResponse> => {
  const { data } = await axiosInstance.patch(`/products/${productId}/stock`, { updates });
  return data.data;
};

// ===========================
// IMAGE MANAGEMENT
// ===========================

/**
 * Upload images to a product
 */
export const uploadProductImages = async (
  productId: string,
  files: File[]
): Promise<ImageUploadResponse> => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('images', file);
  });

  const { data } = await axiosInstance.post(
    `/products/${productId}/images`, 
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return data.data;
};

/**
 * Upload images to a specific variant
 */
export const uploadVariantImages = async (
  productId: string, 
  sku: string, 
  files: File[]
): Promise<ImageUploadResponse> => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('images', file);
  });

  const { data } = await axiosInstance.post(
    `/products/${productId}/variants/${sku}/images`, 
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return data.data;
};

/**
 * Delete a product image
 */
export const deleteProductImage = async (
  productId: string, 
  imageUrl: string
): Promise<ProductResponse> => {
  const encodedImageUrl = encodeURIComponent(imageUrl);
  const { data } = await axiosInstance.delete(`/products/${productId}/images/${encodedImageUrl}`);
  return data.data;
};

/**
 * Delete a variant image
 */
export const deleteVariantImage = async (
  productId: string, 
  sku: string, 
  imageUrl: string
): Promise<ProductResponse> => {
  const encodedImageUrl = encodeURIComponent(imageUrl);
  const { data } = await axiosInstance.delete(`/products/${productId}/variants/${sku}/images/${encodedImageUrl}`);
  return data.data;
};

// ===========================
// SPECIAL ENDPOINTS (HOME PAGE)
// ===========================

/**
 * Get best selling products
 */
export const getBestSellingProducts = async (filters: {
  page?: number;
  limit?: number;
  category?: string;
  minRating?: number;
} = {}): Promise<ProductsResponse> => {
  const { data } = await axiosInstance.get('/products/best-selling', {
    params: filters,
  });
  return data.data;
};

/**
 * Get festival favorites
 */
export const getFestivalFavorites = async (filters: {
  page?: number;
  limit?: number;
  category?: string;
  festivalTag?: string;
  minRating?: number;
} = {}): Promise<ProductsResponse> => {
  const { data } = await axiosInstance.get('/products/festival-favorites', {
    params: filters,
  });
  return data.data;
};

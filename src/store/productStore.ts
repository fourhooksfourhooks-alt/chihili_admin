import { create } from 'zustand';
import { 
  Product, 
  ProductVariant,
  ProductFilters,
  CreateProductData,
  UpdateProductData,
  StockUpdate,
  // ImageUploadResponse,
  getProducts, 
  getProductById, 
  getProductBySlug,
  getVendorProducts,
  createProduct, 
  updateProduct, 
  deleteProduct, 
  updateProductStatus, 
  toggleFeatured,
  addVariants,
  updateVariant,
  removeVariant,
  updateStock,
  uploadProductImages,
  uploadVariantImages,
  deleteProductImage,
  deleteVariantImage,
  getBestSellingProducts,
  getFestivalFavorites
} from '@/api/product.api';

interface ProductStore {
  products: Product[];
  totalCount: number;
  currentPage: number;
  pageLimit: number;
  isLoading: boolean;
  error: string | null;
  currentProduct: Product | null;
  filters: ProductFilters;
  
  // Core CRUD Actions
  fetchProducts: (filters?: ProductFilters) => Promise<void>;
  fetchProductById: (id: string) => Promise<Product | null>;
  fetchProductBySlug: (slug: string) => Promise<Product | null>;
  fetchVendorProducts: (vendorId: string, filters?: ProductFilters) => Promise<void>;
  addProduct: (productData: CreateProductData) => Promise<Product | null>;
  editProduct: (id: string, productData: UpdateProductData) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  
  // Status Management
  changeProductStatus: (id: string, status: 'draft' | 'active' | 'inactive' | 'archived') => Promise<void>;
  toggleProductFeatured: (id: string, isFeatured: boolean) => Promise<void>;
  
  // Variant Management
  addProductVariants: (productId: string, variants: Omit<ProductVariant, 'sku'>[]) => Promise<void>;
  updateProductVariant: (productId: string, sku: string, variantData: Partial<Omit<ProductVariant, 'sku'>>) => Promise<void>;
  removeProductVariant: (productId: string, sku: string) => Promise<void>;
  updateProductStock: (productId: string, updates: StockUpdate[]) => Promise<void>;
  
  // Image Management
  uploadProductImages: (productId: string, files: File[]) => Promise<string[]>;
  uploadVariantImages: (productId: string, sku: string, files: File[]) => Promise<string[]>;
  deleteProductImage: (productId: string, imageUrl: string) => Promise<void>;
  deleteVariantImage: (productId: string, sku: string, imageUrl: string) => Promise<void>;
  
  // Special Endpoints
  fetchBestSellingProducts: (filters?: { page?: number; limit?: number; category?: string; minRating?: number }) => Promise<void>;
  fetchFestivalFavorites: (filters?: { page?: number; limit?: number; category?: string; festivalTag?: string; minRating?: number }) => Promise<void>;
  
  // Utility Actions
  clearCurrentProduct: () => void;
  setError: (error: string | null) => void;
  setFilters: (newFilters: Partial<ProductFilters>) => void;
  
  // Aliases for compatibility with existing code
  get loading(): boolean;
  get total(): number;
  toggleStatus: (id: string, status: string) => Promise<void>;
  toggleFeatured: (id: string, isFeatured?: boolean) => Promise<void>;
  uploadImages: (productId: string, files: File[]) => Promise<string[]>;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  totalCount: 0,
  currentPage: 1,
  pageLimit: 10,
  isLoading: false,
  error: null,
  currentProduct: null,
  filters: {},
  
  // ===========================
  // CORE CRUD OPERATIONS
  // ===========================
  
  fetchProducts: async (filters: ProductFilters = {}) => {
    try {
      set({ isLoading: true, error: null });
      
      // Merge filters with pagination
      const mergedFilters = {
        ...get().filters,
        ...filters,
        page: filters.page || get().currentPage,
        limit: filters.limit || get().pageLimit,
      };
      
      const response = await getProducts(mergedFilters);
      
      set({ 
        products: response.products, 
        totalCount: response.total,
        currentPage: mergedFilters.page || 1,
        pageLimit: mergedFilters.limit || 10,
        filters: mergedFilters,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch products', 
        isLoading: false 
      });
    }
  },
  
  fetchProductById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await getProductById(id);
      set({ currentProduct: response.product, isLoading: false });
      return response.product;
    } catch (error) {
      console.error('Error fetching product:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch product', 
        isLoading: false 
      });
      return null;
    }
  },

  fetchProductBySlug: async (slug: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await getProductBySlug(slug);
      set({ currentProduct: response.product, isLoading: false });
      return response.product;
    } catch (error) {
      console.error('Error fetching product by slug:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch product', 
        isLoading: false 
      });
      return null;
    }
  },

  fetchVendorProducts: async (vendorId: string, filters: ProductFilters = {}) => {
    try {
      set({ isLoading: true, error: null });
      
      const mergedFilters = {
        ...filters,
        page: filters.page || get().currentPage,
        limit: filters.limit || get().pageLimit,
      };
      
      const response = await getVendorProducts(vendorId, mergedFilters);
      
      set({ 
        products: response.products, 
        totalCount: response.total,
        currentPage: mergedFilters.page || 1,
        pageLimit: mergedFilters.limit || 10,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching vendor products:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch vendor products', 
        isLoading: false 
      });
    }
  },
  
  addProduct: async (productData: CreateProductData) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await createProduct(productData);
      console.log('get type:', typeof get, 'products:', get().products);
      
      // Update the products list with the new product
      // const updatedProducts = [...get().products];
      // if (updatedProducts.length < get().pageLimit) {
      //   updatedProducts.push(response.product);
      // }
      
      set({ 
        // products: updatedProducts, 
        totalCount: get().totalCount + 1,
        isLoading: false,
        currentProduct: response.product 
      });
      
      return response.product;
    } catch (error) {
      console.error('Error adding product:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add product', 
        isLoading: false 
      });
      return null;
    }
  },
  
  editProduct: async (id: string, productData: UpdateProductData) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await updateProduct(id, productData);
      
      // Update the product in the list
      const updatedProducts = get().products.map(product => 
        product._id === id ? response.product : product
      );
      
      set({ 
        products: updatedProducts, 
        isLoading: false,
        currentProduct: response.product 
      });
    } catch (error) {
      console.error('Error updating product:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update product', 
        isLoading: false 
      });
    }
  },
  
  removeProduct: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      
      await deleteProduct(id);
      
      // Remove the product from the list
      const updatedProducts = get().products.filter(product => product._id !== id);
      
      set({ 
        products: updatedProducts, 
        totalCount: get().totalCount - 1,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete product', 
        isLoading: false 
      });
    }
  },

  // ===========================
  // STATUS MANAGEMENT
  // ===========================
  
  changeProductStatus: async (id: string, status: 'draft' | 'active' | 'inactive' | 'archived') => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await updateProductStatus(id, status);
      
      // Update the product in the list
      const updatedProducts = get().products.map(product => 
        product._id === id ? response.product : product
      );
      
      set({ 
        products: updatedProducts, 
        isLoading: false,
        currentProduct: response.product 
      });
    } catch (error) {
      console.error('Error changing product status:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to change product status', 
        isLoading: false 
      });
    }
  },
  
  toggleProductFeatured: async (id: string, isFeatured: boolean) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await toggleFeatured(id, isFeatured);
      
      // Update the product in the list
      const updatedProducts = get().products.map(product => 
        product._id === id ? response.product : product
      );
      
      set({ 
        products: updatedProducts, 
        isLoading: false,
        currentProduct: response.product 
      });
    } catch (error) {
      console.error('Error toggling product featured status:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to toggle featured status', 
        isLoading: false 
      });
    }
  },

  // ===========================
  // VARIANT MANAGEMENT
  // ===========================

  addProductVariants: async (productId: string, variants: Omit<ProductVariant, 'sku'>[]) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await addVariants(productId, variants);
      
      // Update the product in the list
      const updatedProducts = get().products.map(product => 
        product._id === productId ? response.product : product
      );
      
      set({ 
        products: updatedProducts, 
        isLoading: false,
        currentProduct: response.product 
      });
    } catch (error) {
      console.error('Error adding variants:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add variants', 
        isLoading: false 
      });
    }
  },

  updateProductVariant: async (productId: string, sku: string, variantData: Partial<Omit<ProductVariant, 'sku'>>) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await updateVariant(productId, sku, variantData);
      
      // Update the product in the list
      const updatedProducts = get().products.map(product => 
        product._id === productId ? response.product : product
      );
      
      set({ 
        products: updatedProducts, 
        isLoading: false,
        currentProduct: response.product 
      });
    } catch (error) {
      console.error('Error updating variant:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update variant', 
        isLoading: false 
      });
    }
  },

  removeProductVariant: async (productId: string, sku: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await removeVariant(productId, sku);
      
      // Update the product in the list
      const updatedProducts = get().products.map(product => 
        product._id === productId ? response.product : product
      );
      
      set({ 
        products: updatedProducts, 
        isLoading: false,
        currentProduct: response.product 
      });
    } catch (error) {
      console.error('Error removing variant:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to remove variant', 
        isLoading: false 
      });
    }
  },

  updateProductStock: async (productId: string, updates: StockUpdate[]) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await updateStock(productId, updates);
      
      // Update the product in the list
      const updatedProducts = get().products.map(product => 
        product._id === productId ? response.product : product
      );
      
      set({ 
        products: updatedProducts, 
        isLoading: false,
        currentProduct: response.product 
      });
    } catch (error) {
      console.error('Error updating stock:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update stock', 
        isLoading: false 
      });
    }
  },

  // ===========================
  // IMAGE MANAGEMENT
  // ===========================

  uploadProductImages: async (productId: string, files: File[]) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await uploadProductImages(productId, files);
      
      // // Update the product in the list
      // const updatedProducts = get().products.map(product => 
      //   product._id === productId ? response.product : product
      // );
      
      set({ 
        // products: updatedProducts, 
        isLoading: false,
        currentProduct: response.product 
      });
      
      return response.uploadedImages;
    } catch (error) {
      console.error('Error uploading product images:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to upload images', 
        isLoading: false 
      });
      return [];
    }
  },

  uploadVariantImages: async (productId: string, sku: string, files: File[]) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await uploadVariantImages(productId, sku, files);
      
      // Update the product in the list
      // const updatedProducts = get().products.map(product => 
      //   product._id === productId ? response.product : product
      // );
      
      set({ 
        // products: updatedProducts, 
        isLoading: false,
        currentProduct: response.product 
      });
      
      return response.uploadedImages;
    } catch (error) {
      console.error('Error uploading variant images:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to upload variant images', 
        isLoading: false 
      });
      return [];
    }
  },

  deleteProductImage: async (productId: string, imageUrl: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await deleteProductImage(productId, imageUrl);
      
      // Update the product in the list
      const updatedProducts = get().products.map(product => 
        product._id === productId ? response.product : product
      );
      
      set({ 
        products: updatedProducts, 
        isLoading: false,
        currentProduct: response.product 
      });
    } catch (error) {
      console.error('Error deleting product image:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete image', 
        isLoading: false 
      });
    }
  },

  deleteVariantImage: async (productId: string, sku: string, imageUrl: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await deleteVariantImage(productId, sku, imageUrl);
      
      // Update the product in the list
      const updatedProducts = get().products.map(product => 
        product._id === productId ? response.product : product
      );
      
      set({ 
        products: updatedProducts, 
        isLoading: false,
        currentProduct: response.product 
      });
    } catch (error) {
      console.error('Error deleting variant image:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete variant image', 
        isLoading: false 
      });
    }
  },

  // ===========================
  // SPECIAL ENDPOINTS
  // ===========================

  fetchBestSellingProducts: async (filters = {}) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await getBestSellingProducts(filters);
      
      set({ 
        products: response.products, 
        totalCount: response.total,
        currentPage: response.page || 1,
        pageLimit: response.limit || 10,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching best selling products:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch best selling products', 
        isLoading: false 
      });
    }
  },

  fetchFestivalFavorites: async (filters = {}) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await getFestivalFavorites(filters);
      
      set({ 
        products: response.products, 
        totalCount: response.total,
        currentPage: response.page || 1,
        pageLimit: response.limit || 10,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching festival favorites:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch festival favorites', 
        isLoading: false 
      });
    }
  },

  // ===========================
  // UTILITY ACTIONS
  // ===========================
  
  clearCurrentProduct: () => {
    set({ currentProduct: null });
  },
  
  setError: (error: string | null) => {
    set({ error });
  },
  
  setFilters: (newFilters: Partial<ProductFilters>) => {
    set(state => ({ 
      filters: { ...state.filters, ...newFilters } 
    }));
  },
  
  // ===========================
  // COMPATIBILITY ALIASES
  // ===========================
  
  // Getter for loading property (alias for isLoading)
  get loading() {
    return get().isLoading;
  },
  
  // Getter for total property (alias for totalCount)
  get total() {
    return get().totalCount;
  },
  
  // Alias for changeProductStatus with string status
  toggleStatus: async (id: string, status: string) => {
    if (!['draft', 'active', 'inactive', 'archived'].includes(status)) {
      console.error('Invalid status:', status);
      return;
    }
    return get().changeProductStatus(id, status as 'draft' | 'active' | 'inactive' | 'archived');
  },
  
  // Toggle product featured status with optional parameter
  toggleFeatured: async (id: string, isFeatured?: boolean) => {
    try {
      // If isFeatured is not provided, get current product and toggle its status
      let shouldBeFeatured = isFeatured;
      if (shouldBeFeatured === undefined) {
        const product = get().products.find(p => p._id === id) || get().currentProduct;
        shouldBeFeatured = product ? !product.isFeatured : true;
      }
      
      return get().toggleProductFeatured(id, shouldBeFeatured);
    } catch (error) {
      console.error('Error in toggleFeatured alias:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to toggle featured status',
        isLoading: false
      });
    }
  },

  // Legacy upload images function for backward compatibility
  uploadImages: async (productId: string, files: File[]) => {
    return get().uploadProductImages(productId, files);
  }
}));

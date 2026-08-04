"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Edit3,
  Trash2,
  Plus,
  AlertTriangle,
  Search,
  Filter,
  Star,
  Image as ImageIcon,
} from "lucide-react";
import ProductModal from "@/components/ProductModal";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useProductStore } from "@/store/productStore";
import { useCategoryStore } from "@/store/categoryStore";
import { useAuthStore } from "@/store/authStore";
import type { Product, ProductFilters, UpdateProductData } from "@/api/product.api";

// Helper interface for populated vendor data
interface PopulatedVendor {
  _id: string;
  businessName: string;
}

// Extended product type that may have populated vendor
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ProductPage = () => {
  const router = useRouter();
  
  const {
    products,
    loading,
    error,
    total,
    currentPage,
    pageLimit,
    filters,
  fetchProducts,
  fetchVendorProducts,
    editProduct,
    removeProduct,
    toggleStatus,
    toggleFeatured,
    setFilters,
    setError,
  } = useProductStore();

  const { categories, fetchCategories } = useCategoryStore();
  const { vendor, user, fetchVendor } = useAuthStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Initialize products on component mount
  useEffect(() => {
    const initializeData = async () => {
      // Fetch categories first
      await fetchCategories();
      
      // Fetch vendor information if not available
      if (!vendor) {
        await fetchVendor();
      }
      
      // For vendors, use the dedicated vendor products endpoint
      // For admins, use the general products endpoint to see all products
      const initialFilters: ProductFilters = {};
      
      if (user && user.role === 'vendor' && vendor?._id) {
        // Use dedicated vendor endpoint for vendors

        await fetchVendorProducts(vendor._id, initialFilters);
      } 
      // else {
      //   // Use general endpoint for admins (can see all products)
      //   await fetchProducts(initialFilters);
      // }
    };
    
    initializeData();
  }, [fetchProducts, fetchVendorProducts, fetchCategories, fetchVendor, vendor, user]);

  // Handle search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== (filters?.search || '')) {
        const searchFilters: Partial<ProductFilters> = { search: searchTerm };
        
        setFilters(searchFilters);
        
        // Use appropriate fetch method based on user role
        if (user && user.role === 'vendor' && vendor?._id) {
          fetchVendorProducts(vendor._id, searchFilters);
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, filters?.search, setFilters, fetchProducts, fetchVendorProducts, user, vendor]);

  // Handle product update
  const handleUpdateProduct = async (productData: UpdateProductData) => {
    if (!editingProduct || !editingProduct._id) return;

    try {
      await editProduct(editingProduct._id, productData);
      setEditingProduct(null);
      setModalOpen(false);
    } catch (error) {
      throw error;
    }
  };

  // Handle product deletion
  const handleDeleteProduct = async () => {
    if (!productToDelete || !productToDelete._id) return;

    try {
      setIsDeleting(true);
      setError(null);

      await removeProduct(productToDelete._id);

      setDeleteModal(false);
      setProductToDelete(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      setDeleteModal(false);
      setProductToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (product: Product, newStatus: string) => {
    if (!product._id) return;
    
    try {
      await toggleStatus(product._id, newStatus);
    } catch (error) {
      console.error("Error toggling product status:", error);
    }
  };

  // Handle toggle featured
  const handleToggleFeatured = async (product: Product) => {
    if (!product._id) return;
    
    try {
      await toggleFeatured(product._id, !product.isFeatured);
    } catch (error) {
      console.error("Error toggling product featured status:", error);
    }
  };

  // NOTE: edit action now redirects to a dedicated edit page: /product/edit/[id]

  const onDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteModal(true);
  };

  const handleFilterChange = (newFilters: Partial<ProductFilters>) => {
    setFilters(newFilters);
    
    // Use appropriate fetch method based on user role
    if (user && user.role === 'vendor' && vendor?._id) {
      fetchVendorProducts(vendor._id, newFilters);
    } else {
      fetchProducts(newFilters);
    }
  };

  const clearFilters = () => {
    const reset = {
      search: "",
      status: undefined,
      categories: undefined,
      isFeatured: undefined,
      sort: "-createdAt",
    } as Partial<ProductFilters>;
    
    setFilters(reset);
    setSearchTerm("");
    
    // Use appropriate fetch method based on user role
    if (user && user.role === 'vendor' && vendor?._id) {
      fetchVendorProducts(vendor._id, reset);
    } else {
      fetchProducts(reset);
    }
  };

  const getCategoryNames = (categoryIds?: string[]) => {
    if (!categoryIds || categoryIds.length === 0) return "None";
    
    return categoryIds
      .map(id => {
        const category = categories.find(cat => cat._id === id);
        return category ? category.name : "";
      })
      .filter(Boolean)
      .join(", ");
  };

  // Get the primary variant for display
  const getPrimaryVariant = (product: Product) => {
    if (!product.variants || product.variants.length === 0) {
      return { price: 0, stock: 0 };
    }
    return product.variants[0];
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your products here. You can add, edit, or remove products.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Button
            onClick={() => router.push('/product/add')}
            disabled={!vendor}
            className="flex items-center justify-center bg-primary1 hover:bg-primary2 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mt-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Select
                  value={filters.status || "__all"}
                  onValueChange={(value) => handleFilterChange({ 
                    status: value === "__all" ? undefined : (value as 'draft' | 'active' | 'inactive' | 'archived')
                  })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <Select
                  value={filters.categories && filters.categories[0] || "__all"}
                  onValueChange={(value) => handleFilterChange({ 
                    categories: value === "__all" ? undefined : [value]
                  })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <Select
                  value={filters.sort || "-createdAt"}
                  onValueChange={(value) => handleFilterChange({ sort: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-createdAt">Newest First</SelectItem>
                    <SelectItem value="createdAt">Oldest First</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="-name">Name Z-A</SelectItem>
                    <SelectItem value="-salesCount">Best Selling</SelectItem>
                    <SelectItem value="-avgRating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Featured Filter */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Featured
                </label>
                <Select
                  value={filters.isFeatured === undefined ? "__all" : String(filters.isFeatured)}
                  onValueChange={(value) => handleFilterChange({ 
                    isFeatured: value === "__all" ? undefined : value === "true"
                  })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Products" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all">All Products</SelectItem>
                    <SelectItem value="true">Featured Only</SelectItem>
                    <SelectItem value="false">Not Featured</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Price
                </label>
                <Input
                  type="number"
                  placeholder="Min price"
                  value={filters.minPrice || ""}
                  onChange={(e) => handleFilterChange({ 
                    minPrice: e.target.value ? Number(e.target.value) : undefined
                  })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Price
                </label>
                <Input
                  type="number"
                  placeholder="Max price"
                  value={filters.maxPrice || ""}
                  onChange={(e) => handleFilterChange({ 
                    maxPrice: e.target.value ? Number(e.target.value) : undefined
                  })}
                  className="w-full"
                />
              </div>

              {/* Size Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size
                </label>
                <Select
                  value={filters.size || "__all"}
                  onValueChange={(value) => handleFilterChange({ 
                    size: value === "__all" ? undefined : (value as 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL')
                  })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Sizes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all">All Sizes</SelectItem>
                    <SelectItem value="XS">XS</SelectItem>
                    <SelectItem value="S">S</SelectItem>
                    <SelectItem value="M">M</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                    <SelectItem value="XL">XL</SelectItem>
                    <SelectItem value="XXL">XXL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Color Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <Input
                  type="text"
                  placeholder="Enter color"
                  value={filters.color || ""}
                  onChange={(e) => handleFilterChange({ 
                    color: e.target.value || undefined
                  })}
                  className="w-full"
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="text-sm"
              >
                Clear All Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-6 rounded-md bg-red-50 p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <p className="ml-3 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {!vendor && (
        <div className="mt-6 rounded-md bg-yellow-50 p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <p className="ml-3 text-sm text-yellow-700">
              Vendor information is required to manage products. Please ensure you are logged in with a vendor account.
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden border-zinc-200 border-2 rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Image
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Product
                    </th>
                    {user?.role === 'admin' && (
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Vendor
                      </th>
                    )}
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Categories
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Price
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Stock
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Status
                    </th>
                    {/* <th
                      scope="col"
                      className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900"
                    >
                      Featured
                    </th> */}
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                    >
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={user?.role === 'admin' ? 9 : 8} className="text-center py-4">
                        <div className="flex justify-center">
                          <div className="animate-spin h-5 w-5 border-2 border-primary1 border-t-transparent rounded-full"></div>
                        </div>
                      </td>
                    </tr>
                  ) : !Array.isArray(products) || products.length === 0 ? (
                    <tr>
                      <td
                        colSpan={user?.role === 'admin' ? 9 : 8}
                        className="text-center py-4 text-gray-500"
                      >
                        No products found
                      </td>
                    </tr>
                  ) : (
                    (Array.isArray(products) ? products : []).map(
                      (product) => {
                        const primaryVariant = getPrimaryVariant(product);
                        return (
                          <tr key={product._id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              {product.images && product.images.length > 0 ? (
                                <Image
                                  src={product.images[0]}
                                  alt={product.name}
                                  width={64}
                                  height={64}
                                  className="h-16 w-16 object-cover rounded-lg border border-gray-300"
                                />
                              ) : (
                                <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <ImageIcon className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              <div className="font-medium text-gray-900">{product.name}</div>
                              <div className="text-gray-500 text-xs mt-1">
                                {product.variants?.length || 0} variant(s)
                              </div>
                              {product.tags && product.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {product.tags.slice(0, 2).map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {product.tags.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{product.tags.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </td>
                            {user?.role === 'admin' && (
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                <div className="font-medium text-gray-900">
                                  {typeof product.vendorId === 'object' && product.vendorId && 'businessName' in product.vendorId
                                    ? (product.vendorId as PopulatedVendor).businessName || 'Unknown Vendor'
                                    : 'Vendor ID: ' + product.vendorId
                                  }
                                </div>
                                <div className="text-xs text-gray-500">
                                  ID: {typeof product.vendorId === 'object' && product.vendorId && '_id' in product.vendorId
                                    ? String((product.vendorId as PopulatedVendor)._id).slice(-8) 
                                    : String(product.vendorId).slice(-8)
                                  }
                                </div>
                              </td>
                            )}
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {getCategoryNames(product.categories)}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              <div className="font-medium text-gray-900">
                                ₹{primaryVariant.price.toFixed(2)}
                              </div>
                              {'mrp' in primaryVariant && primaryVariant.mrp && primaryVariant.mrp > primaryVariant.price && (
                                <div className="line-through text-gray-500 text-xs">
                                  ₹{primaryVariant.mrp.toFixed(2)}
                                </div>
                              )}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {primaryVariant.stock}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Select
                                  value={product.status}
                                  onValueChange={(value) => handleToggleStatus(product, value)}
                                >
                                  <SelectTrigger className="w-auto min-w-[100px] h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Badge 
                                  variant={
                                    product.status === "active" ? "default" :
                                    product.status === "draft" ? "secondary" :
                                    product.status === "inactive" ? "destructive" : "outline"
                                  }
                                  className="text-xs"
                                >
                                  {product.status}
                                </Badge>
                              </div>
                            </td>
                            {/* <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                              <button
                                onClick={() => handleToggleFeatured(product)}
                                className={`inline-flex items-center justify-center p-1 rounded-full ${
                                  product.isFeatured
                                    ? "text-yellow-400 hover:text-yellow-500"
                                    : "text-gray-400 hover:text-gray-500"
                                }`}
                              >
                                <Star
                                  className={`h-5 w-5 ${
                                    product.isFeatured ? "fill-yellow-400" : ""
                                  }`}
                                />
                              </button>
                            </td> */}
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => router.push(`/product/view/${product._id}`)}
                                  className="h-8 w-8 p-0"
                                  aria-label="View product"
                                >
                                  <ImageIcon className="h-4 w-4" />
                                </Button>

                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => router.push(`/product/edit/${product._id}`)}
                                  className="h-8 w-8 p-0"
                                  aria-label={`Edit ${product.name}`}
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => onDeleteClick(product)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination and Product Count */}
      {!loading && Array.isArray(products) && products.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-white rounded-lg shadow mt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {((currentPage - 1) * pageLimit) + 1} to {Math.min(currentPage * pageLimit, total)} of{" "}
              <span className="font-medium">{total}</span> products
            </div>
            
            {/* Pagination Controls */}
            {Math.ceil(total / pageLimit) > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newFilters = { ...filters, page: currentPage - 1 };
                    if (user && user.role === 'vendor' && vendor?._id) {
                      fetchVendorProducts(vendor._id, newFilters);
                    } else {
                      fetchProducts(newFilters);
                    }
                  }}
                  disabled={currentPage <= 1}
                >
                  Previous
                </Button>
                
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {Math.ceil(total / pageLimit)}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newFilters = { ...filters, page: currentPage + 1 };
                    if (user && user.role === 'vendor' && vendor?._id) {
                      fetchVendorProducts(vendor._id, newFilters);
                    } else {
                      fetchProducts(newFilters);
                    }
                  }}
                  disabled={currentPage >= Math.ceil(total / pageLimit)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product Modal - Only for editing */}
      {editingProduct && (
        <ProductModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingProduct(null);
          }}
          onSubmit={handleUpdateProduct}
          initialData={editingProduct}
          mode="edit"
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal}
        onClose={() => {
          setDeleteModal(false);
          setProductToDelete(null);
        }}
        onConfirm={handleDeleteProduct}
        title="Delete Product"
        message={`Are you sure you want to delete the product "${
          productToDelete?.name || ""
        }"? This action cannot be undone.`}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        type="danger"
      />
    </div>
  );
};

export default ProductPage;
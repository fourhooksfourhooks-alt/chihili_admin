"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Edit3,
  Star,
  Package,
  Tag,
  Calendar,
  TrendingUp,
  Heart,
  Palette,
  DollarSign,
  Package2,
  Eye,
  BarChart3,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Clock,
  Archive,
  FileText,
  Copy,
  Check,
} from "lucide-react";
import { useProductStore } from "@/store/productStore";
import { useCategoryStore } from "@/store/categoryStore";
import { useAuthStore } from "@/store/authStore";
import type { ProductVariant } from "@/api/product.api";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Helper interface for populated vendor data
interface PopulatedVendor {
  _id: string;
  businessName: string;
  email?: string;
  phone?: string;
}

const ProductViewPage = () => {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const {
    currentProduct,
    loading,
    error,
    fetchProductById,
    clearCurrentProduct,
  } = useProductStore();

  const { categories, fetchCategories } = useCategoryStore();
  const { user } = useAuthStore();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Fetch product data on component mount
  useEffect(() => {
    const loadData = async () => {
      if (productId) {
        try {
          await fetchProductById(productId);
          await fetchCategories();
        } catch (error) {
          console.error("Error loading product:", error);
        }
      }
    };

    loadData();

    // Cleanup on unmount
    return () => {
      clearCurrentProduct();
    };
  }, [productId, fetchProductById, fetchCategories, clearCurrentProduct]);

  // Set default selected variant when product loads
  useEffect(() => {
    if (currentProduct && currentProduct.variants && currentProduct.variants.length > 0 && !selectedVariant) {
      setSelectedVariant(currentProduct.variants[0]);
    }
  }, [currentProduct, selectedVariant]);

  // Helper functions
  const getCategoryNames = (categoryIds?: string[]) => {
    if (!categoryIds || categoryIds.length === 0) return [];
    
    return categoryIds
      .map(id => {
        const category = categories.find(cat => cat._id === id);
        return category ? category.name : null;
      })
      .filter(Boolean);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'draft':
        return <FileText className="h-4 w-4" />;
      case 'inactive':
        return <XCircle className="h-4 w-4" />;
      case 'archived':
        return <Archive className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateDiscount = (mrp: number, price: number) => {
    if (!mrp || mrp <= price) return 0;
    return Math.round(((mrp - price) / mrp) * 100);
  };

  const getTotalStock = (variants?: ProductVariant[]) => {
    if (!variants || variants.length === 0) return 0;
    return variants.reduce((total, variant) => total + (variant.stock || 0), 0);
  };

  const copyProductUrl = async () => {
    const url = `${window.location.origin}/product/${currentProduct?.slug || currentProduct?._id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-2 border-gray-300 border-t-blue-600 rounded-full mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Loading Product Details</h3>
          <p className="text-gray-500">Please wait while we fetch the information...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-2xl mx-auto">
            <Alert className="border-red-200 bg-red-50 shadow-sm">
              <XCircle className="h-5 w-5 text-red-600" />
              <AlertDescription className="text-red-800 font-medium">{error}</AlertDescription>
            </Alert>
            <div className="flex justify-center mt-8">
              <Button 
                onClick={() => router.push('/product')} 
                variant="outline"
                className="bg-white hover:bg-gray-50 border-gray-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No product found
  if (!currentProduct) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-12 w-12 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Product not found</h3>
            <p className="text-gray-600 mb-8 leading-relaxed">The product you&apos;re looking for doesn&apos;t exist or has been removed from our system.</p>
            <Button 
              onClick={() => router.push('/product')} 
              variant="outline"
              className="bg-white hover:bg-gray-50 border-gray-300 px-6 py-3"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const product = currentProduct;
  const displayImages = product.images && product.images.length > 0 ? product.images : 
                      (selectedVariant?.images && selectedVariant.images.length > 0 ? selectedVariant.images : []);
  const categoryNames = getCategoryNames(product.categories);

  return (
    <div className=" bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-4">
          <Button
            onClick={() => router.push('/product')}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 truncate">{product.name}</h1>
              <p className="text-gray-500 mt-1">Product Details & Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={copyProductUrl}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {copiedUrl ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiedUrl ? 'Copied!' : 'Copy URL'}
            </Button>
            <Button
              onClick={() => router.push(`/product/edit/${product._id}`)}
              className="flex items-center gap-2"
            >
              <Edit3 className="h-4 w-4" />
              Edit Product
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column - Images */}
        <div className="xl:col-span-1">
          <Card className="shadow-sm border">
            <CardContent className="p-6">
              {/* Main Image */}
              <div className="aspect-square mb-4 rounded-lg overflow-hidden bg-gray-100 border">
                {displayImages.length > 0 ? (
                  <Image
                    src={displayImages[selectedImageIndex]}
                    alt={product.name}
                    width={500}
                    height={500}
                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-20 w-20 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Image Thumbnails */}
              {displayImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {displayImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square rounded-md overflow-hidden border-2 transition-all duration-200 ${
                        selectedImageIndex === index
                          ? 'border-blue-500 ring-1 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Image Info */}
              <div className="mt-4 text-sm text-gray-500 text-center bg-gray-50 rounded-md py-2">
                {displayImages.length > 0 
                  ? `${selectedImageIndex + 1} of ${displayImages.length} images`
                  : 'No images available'
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Product Details */}
        <div className="xl:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="variants">Variants</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Basic Info */}
              <Card className="shadow-sm border">
                <CardHeader className="bg-gray-50 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <Package className="h-5 w-5 text-gray-600" />
                      Basic Information
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(product.status)}>
                        {getStatusIcon(product.status)}
                        {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                      </Badge>
                      {product.isFeatured && (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600 bg-yellow-50">
                          <Star className="h-3 w-3 mr-1 fill-yellow-600" />
                          Featured
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Product Name</h3>
                      <p className="text-gray-700 text-lg">{product.name}</p>
                    </div>
                    
                    {product.slug && (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Slug</h3>
                        <code className="text-sm bg-gray-100 px-3 py-2 rounded-md border">{product.slug}</code>
                      </div>
                    )}

                    {product.shortDescription && (
                      <div className="md:col-span-2">
                        <h3 className="font-medium text-gray-900 mb-2">Short Description</h3>
                        <div className="bg-gray-50 p-4 rounded-md border">
                          <p className="text-gray-700">{product.shortDescription}</p>
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Categories</h3>
                      {categoryNames.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {categoryNames.map((category, index) => (
                            <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 border border-blue-200">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">No categories assigned</p>
                      )}
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Tags</h3>
                      {product.tags && product.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {product.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="bg-gray-50 border-gray-300">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">No tags</p>
                      )}
                    </div>
                  </div>

                  {product.description && (
                    <div className="mt-6">
                      <h3 className="font-medium text-gray-900 mb-3">Description</h3>
                      <div className="bg-gray-50 p-6 rounded-md border">
                        <div className="prose prose-sm max-w-none text-gray-700">
                          {product.description.split('\n').map((paragraph, index) => (
                            <p key={index} className="mb-3 leading-relaxed">{paragraph}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pricing & Discounts */}
              <Card className="shadow-sm border">
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <DollarSign className="h-5 w-5 text-gray-600" />
                    Pricing & Discounts
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedVariant && (
                      <>
                        <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                          <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-3" />
                          <p className="text-sm text-green-600 mb-1 font-medium">Current Price</p>
                          <p className="text-2xl font-bold text-green-700">
                            {formatPrice(selectedVariant.price)}
                          </p>
                        </div>

                        {selectedVariant.mrp && selectedVariant.mrp > selectedVariant.price && (
                          <>
                            <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                              <Tag className="h-8 w-8 text-gray-600 mx-auto mb-3" />
                              <p className="text-sm text-gray-600 mb-1 font-medium">MRP</p>
                              <p className="text-xl font-semibold text-gray-700 line-through">
                                {formatPrice(selectedVariant.mrp)}
                              </p>
                            </div>

                            <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
                              <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                              <p className="text-sm text-blue-600 mb-1 font-medium">Discount</p>
                              <p className="text-2xl font-bold text-blue-700">
                                {calculateDiscount(selectedVariant.mrp, selectedVariant.price)}%
                              </p>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>

                  {(product.discountType || product.buyXGetY) && (
                    <div className="mt-6 p-6 bg-orange-50 rounded-lg border border-orange-200">
                      <h4 className="font-medium text-orange-900 mb-3 flex items-center gap-2">
                        <Star className="h-5 w-5 text-orange-600" />
                        Special Offers
                      </h4>
                      <div className="space-y-2">
                        {product.discountType && product.discountValue && (
                          <p className="text-orange-700 bg-white px-3 py-2 rounded-md">
                            {product.discountType === 'percentage' 
                              ? `${product.discountValue}% off` 
                              : `₹${product.discountValue} off`
                            }
                          </p>
                        )}
                        {product.buyXGetY && (
                          <p className="text-orange-700 bg-white px-3 py-2 rounded-md">
                            Buy {product.buyXGetY.x} Get {product.buyXGetY.y}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Stock Information */}
              <Card className="shadow-sm border">
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Package2 className="h-5 w-5 text-gray-600" />
                    Stock Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
                      <Package2 className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                      <p className="text-sm text-blue-600 mb-1 font-medium">Total Stock</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {getTotalStock(product.variants)}
                      </p>
                    </div>

                    <div className="text-center p-6 bg-purple-50 rounded-lg border border-purple-200">
                      <Palette className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                      <p className="text-sm text-purple-600 mb-1 font-medium">Variants</p>
                      <p className="text-2xl font-bold text-purple-700">
                        {product.variants?.length || 0}
                      </p>
                    </div>

                    {selectedVariant && (
                      <div className="text-center p-6 bg-indigo-50 rounded-lg border border-indigo-200">
                        <Eye className="h-8 w-8 text-indigo-600 mx-auto mb-3" />
                        <p className="text-sm text-indigo-600 mb-1 font-medium">Selected Variant Stock</p>
                        <p className="text-2xl font-bold text-indigo-700">
                          {selectedVariant.stock || 0}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Variants Tab */}
            <TabsContent value="variants" className="space-y-6">
              <Card className="shadow-sm border">
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Palette className="h-5 w-5 text-gray-600" />
                    Product Variants ({product.variants?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {product.variants && product.variants.length > 0 ? (
                    <div className="space-y-4">
                      {product.variants.map((variant, index) => (
                        <div
                          key={variant.sku || index}
                          className={`p-6 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm ${
                            selectedVariant?.sku === variant.sku
                              ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                          onClick={() => setSelectedVariant(variant)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-4">
                                <h4 className="font-semibold text-gray-900 text-lg">
                                  {variant.title || `Variant ${index + 1}`}
                                </h4>
                                {variant.sku && (
                                  <Badge variant="outline" className="text-xs bg-gray-100">
                                    SKU: {variant.sku}
                                  </Badge>
                                )}
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                                <div>
                                  <p className="text-gray-500 font-medium mb-1">Price</p>
                                  <p className="font-bold text-lg text-green-700">{formatPrice(variant.price)}</p>
                                  {variant.mrp && variant.mrp > variant.price && (
                                    <p className="text-gray-400 line-through text-sm">
                                      {formatPrice(variant.mrp)}
                                    </p>
                                  )}
                                </div>

                                <div>
                                  <p className="text-gray-500 font-medium mb-1">Stock</p>
                                  <div className="flex items-center gap-2">
                                    <p className={`font-bold text-lg ${
                                      (variant.stock || 0) > 10 
                                        ? 'text-green-600' 
                                        : (variant.stock || 0) > 0 
                                          ? 'text-yellow-600' 
                                          : 'text-red-600'
                                    }`}>
                                      {variant.stock || 0}
                                    </p>
                                    <div className={`w-2 h-2 rounded-full ${
                                      (variant.stock || 0) > 10 
                                        ? 'bg-green-500' 
                                        : (variant.stock || 0) > 0 
                                          ? 'bg-yellow-500' 
                                          : 'bg-red-500'
                                    }`}></div>
                                  </div>
                                </div>

                                {variant.attributes?.size && (
                                  <div>
                                    <p className="text-gray-500 font-medium mb-1">Size</p>
                                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 border border-blue-200">
                                      {variant.attributes.size}
                                    </Badge>
                                  </div>
                                )}

                                {variant.attributes?.color && (
                                  <div>
                                    <p className="text-gray-500 font-medium mb-1">Color</p>
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="w-6 h-6 rounded-full border-2 border-gray-300"
                                        style={{ backgroundColor: variant.attributes.color.toLowerCase() }}
                                      />
                                      <span className="text-sm font-medium">{variant.attributes.color}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {variant.images && variant.images.length > 0 && (
                              <div className="ml-6">
                                <div className="flex gap-2">
                                  {variant.images.slice(0, 3).map((image, imgIndex) => (
                                    <Image
                                      key={imgIndex}
                                      src={image}
                                      alt={`${variant.title || 'Variant'} ${imgIndex + 1}`}
                                      width={50}
                                      height={50}
                                      className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                                    />
                                  ))}
                                  {variant.images.length > 3 && (
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-xs text-gray-600 font-medium">
                                      +{variant.images.length - 3}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="h-10 w-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-700 mb-2">No variants configured</h3>
                      <p className="text-gray-500">This product doesn&apos;t have any variants set up yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-6">
              {/* Vendor Information */}
              {user?.role === 'admin' && (
                <Card className="shadow-sm border">
                  <CardHeader className="bg-gray-50 border-b">
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <Package className="h-5 w-5 text-gray-600" />
                      Vendor Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-500 mb-1 font-medium">Business Name</p>
                        <div className="bg-gray-50 p-4 rounded-lg border">
                          <p className="font-semibold text-gray-900">
                            {typeof product.vendorId === 'object' && product.vendorId && 'businessName' in product.vendorId
                              ? (product.vendorId as PopulatedVendor).businessName
                              : 'N/A'
                            }
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1 font-medium">Vendor ID</p>
                        <div className="bg-gray-50 p-4 rounded-lg border">
                          <code className="text-sm font-mono text-gray-800">
                            {typeof product.vendorId === 'object' && product.vendorId && '_id' in product.vendorId
                              ? (product.vendorId as PopulatedVendor)._id
                              : product.vendorId
                            }
                          </code>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Policies & Settings */}
              <Card className="shadow-sm border">
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <FileText className="h-5 w-5 text-gray-600" />
                    Policies & Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {product.returnPolicy && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Return Policy</h4>
                        <div className="bg-gray-50 p-6 rounded-lg border">
                          <p className="text-gray-700 leading-relaxed">
                            {product.returnPolicy}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-500 mb-1 font-medium">Featured Product</p>
                        <div className="bg-gray-50 p-4 rounded-lg border flex items-center gap-3">
                          <Badge variant={product.isFeatured ? "default" : "secondary"}>
                            {product.isFeatured ? 'Yes' : 'No'}
                          </Badge>
                          {product.isFeatured && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1 font-medium">Status</p>
                        <div className="bg-gray-50 p-4 rounded-lg border">
                          <Badge className={getStatusColor(product.status)}>
                            {getStatusIcon(product.status)}
                            {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timestamps */}
              <Card className="shadow-sm border">
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {product.createdAt && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1 font-medium">Created</p>
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200 flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-green-600" />
                          <p className="font-semibold text-gray-900">{formatDate(product.createdAt)}</p>
                        </div>
                      </div>
                    )}
                    {product.updatedAt && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1 font-medium">Last Updated</p>
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex items-center gap-3">
                          <Clock className="h-5 w-5 text-blue-600" />
                          <p className="font-semibold text-gray-900">{formatDate(product.updatedAt)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <Card className="shadow-sm border">
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <BarChart3 className="h-5 w-5 text-gray-600" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                      <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-4" />
                      <p className="text-sm text-green-600 mb-2 font-medium">Sales Count</p>
                      <p className="text-3xl font-bold text-green-700">
                        {product.salesCount || 0}
                      </p>
                    </div>

                    <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
                      <Heart className="h-8 w-8 text-red-600 mx-auto mb-4" />
                      <p className="text-sm text-red-600 mb-2 font-medium">Wishlist Count</p>
                      <p className="text-3xl font-bold text-red-700">
                        {product.wishlistCount || 0}
                      </p>
                    </div>

                    <div className="text-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
                      <Star className="h-8 w-8 text-yellow-600 mx-auto mb-4 fill-yellow-600" />
                      <p className="text-sm text-yellow-600 mb-2 font-medium">Average Rating</p>
                      <p className="text-3xl font-bold text-yellow-700">
                        {product.avgRating ? product.avgRating.toFixed(1) : '0.0'}
                      </p>
                      <div className="flex justify-center mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= (product.avgRating || 0)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
                      <Eye className="h-8 w-8 text-blue-600 mx-auto mb-4" />
                      <p className="text-sm text-blue-600 mb-2 font-medium">Total Reviews</p>
                      <p className="text-3xl font-bold text-blue-700">
                        {product.totalReviews || 0}
                      </p>
                    </div>
                  </div>

                  {/* Rating Distribution */}
                  {product.ratingDistribution && (
                    <div className="mt-8 p-6 bg-gray-50 rounded-lg border">
                      <h4 className="font-semibold text-gray-900 mb-6 text-lg">Rating Distribution</h4>
                      <div className="space-y-4">
                        {[5, 4, 3, 2, 1].map((rating) => {
                          const count = product.ratingDistribution?.[rating as keyof typeof product.ratingDistribution] || 0;
                          const total = product.totalReviews || 0;
                          const percentage = total > 0 ? (count / total) * 100 : 0;
                          
                          return (
                            <div key={rating} className="flex items-center gap-4">
                              <div className="flex items-center gap-2 w-16">
                                <span className="text-sm font-medium text-gray-700">{rating}</span>
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              </div>
                              <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                                <div
                                  className="bg-yellow-400 h-3 rounded-full transition-all duration-500"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <div className="flex items-center gap-2 w-20">
                                <span className="text-sm text-gray-600 font-medium">{count}</span>
                                <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Summary */}
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-bold text-green-600">{(product.avgRating || 0).toFixed(1)}</p>
                            <p className="text-sm text-gray-600">Average Rating</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-blue-600">{product.totalReviews || 0}</p>
                            <p className="text-sm text-gray-600">Total Reviews</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-purple-600">
                              {product.totalReviews ? Math.round(((product.ratingDistribution?.[5] || 0) + (product.ratingDistribution?.[4] || 0)) / product.totalReviews * 100) : 0}%
                            </p>
                            <p className="text-sm text-gray-600">Positive (4-5★)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  </div>
  );
};

export default ProductViewPage;

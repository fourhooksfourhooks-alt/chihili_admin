'use client';

import { useState, useEffect } from 'react';
import { X, AlertTriangle, Search, ChevronDown, Check, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useCategoryStore } from '@/store/categoryStore';
import type { Category } from '@/api/category.api';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { 
    name: string; 
    parent?: string | null; 
    isActive: boolean;
    image?: string | null; // preview url/string
    banner?: string | null; // preview url/string
    imageFile?: File | null; // actual file to upload
    bannerFile?: File | null; // actual file to upload
  }) => Promise<void>;
  initialData: Category | null;
  mode: 'create' | 'edit';
}

const CategoryModal = ({ isOpen, onClose, onSubmit, initialData, mode }: CategoryModalProps) => {
  const [name, setName] = useState(initialData?.name || '');
  const [parent, setParent] = useState<string | null>(initialData?.parent || null);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [image, setImage] = useState<string | null>(initialData?.image || null);
  const [banner, setBanner] = useState<string | null>(initialData?.banner || null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Track explicit removals to send null on edit
  const [imageRemoved, setImageRemoved] = useState(false);
  const [bannerRemoved, setBannerRemoved] = useState(false);
  
  // Parent category search state
  const [showParentDropdown, setShowParentDropdown] = useState(false);
  const [parentSearchTerm, setParentSearchTerm] = useState('');
  const [filteredParentCategories, setFilteredParentCategories] = useState<Category[]>([]);
  
  const { categories: allCategories, fetchCategories } = useCategoryStore();

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setParent(initialData.parent || null);
      setIsActive(initialData.isActive);
      // Normalize API values where backend may return string 'null' or empty string
      const normalizedImage = !initialData.image || initialData.image === 'null' || initialData.image.trim() === '' ? null : initialData.image;
      const normalizedBanner = !initialData.banner || initialData.banner === 'null' || initialData.banner.trim() === '' ? null : initialData.banner;
      setImage(normalizedImage);
      setBanner(normalizedBanner);
      setImageFile(null);
      setBannerFile(null);
      setImageRemoved(false);
      setBannerRemoved(false);
    } else {
      setName('');
      setParent(null);
      setIsActive(true);
      setImage(null);
      setBanner(null);
      setImageFile(null);
      setBannerFile(null);
      setImageRemoved(false);
      setBannerRemoved(false);
    }
    setError('');
  }, [initialData?._id, isOpen]);

  useEffect(() => {
    if (isOpen) {
      // Fetch all categories for parent selection
      fetchCategories({ limit: 100, sort: '-createdAt' });
    }
  }, [isOpen, fetchCategories]);

  useEffect(() => {
    if (parentSearchTerm.trim() === '') {
      setFilteredParentCategories(allCategories.filter(cat => cat._id !== initialData?._id));
    } else {
      const filtered = allCategories.filter(cat => 
        cat._id !== initialData?._id && 
        cat.name.toLowerCase().includes(parentSearchTerm.toLowerCase())
      );
      setFilteredParentCategories(filtered);
    }
  }, [parentSearchTerm, allCategories, initialData?._id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      // Build payload ensuring null is passed when removed in edit mode
      const payload: any = {
        name: name.trim(),
        parent: parent ?? null,
        isActive: Boolean(isActive),
      };

      if (mode === 'edit') {
        if (imageRemoved) payload.image = null; else if (image) payload.image = image;
        if (bannerRemoved) payload.banner = null; else if (banner) payload.banner = banner;
      } else {
        if (image) payload.image = image;
        if (banner) payload.banner = banner;
      }

      if (imageFile) payload.imageFile = imageFile;
      if (bannerFile) payload.bannerFile = bannerFile;
      
      await onSubmit(payload);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectParentCategory = (category: Category | null) => {
    setParent(category?._id || null);
    setShowParentDropdown(false);
    setParentSearchTerm('');
  };

  const getParentCategoryName = () => {
    if (!parent) return 'No parent category';
    const parentCat = allCategories.find(cat => cat._id === parent);
    return parentCat ? parentCat.name : 'Unknown category';
  };

  const handleImageUpload = (field: 'image' | 'banner', value: string) => {
    if (field === 'image') {
      setImage(value);
      setImageRemoved(false);
    } else {
      setBanner(value);
      setBannerRemoved(false);
    }
  };

  const removeImage = (field: 'image' | 'banner') => {
    if (field === 'image') {
      setImage(null);
      setImageFile(null);
      setImageRemoved(true);
    } else {
      setBanner(null);
      setBannerFile(null);
      setBannerRemoved(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 bg-opacity-75 transition-opacity">
      <div className="flex min-h-screen items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              onClick={onClose}
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 cursor-pointer"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg font-semibold leading-6 text-gray-900">
                {mode === 'create' ? 'Create New Category' : 'Edit Category'}
              </h3>
              
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {error && (
                  <div className="rounded-md bg-red-50 p-4 mb-4">
                    <div className="flex">
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                      <p className="ml-3 text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                )}

                {/* Category Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary1 focus:outline-none focus:ring-1 focus:ring-primary1"
                    placeholder="Enter category name"
                  />
                </div>

                {/* Parent Category Selection (optional) */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parent Category (optional)
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowParentDropdown(!showParentDropdown)}
                      className="w-full flex items-center justify-between rounded-md border border-gray-300 px-3 py-2 text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary1 focus:border-primary1"
                    >
                      <span className={parent ? 'text-gray-900' : 'text-gray-500'}>
                        {getParentCategoryName()}
                      </span>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </button>
                    
                    {showParentDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                        {/* Search input */}
                        <div className="p-2 border-b border-gray-200">
                          <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search categories..."
                              value={parentSearchTerm}
                              onChange={(e) => setParentSearchTerm(e.target.value)}
                              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary1 focus:border-primary1"
                            />
                          </div>
                        </div>
                        
                        {/* Category list */}
                        <div className="py-1">
                          <button
                            type="button"
                            onClick={() => selectParentCategory(null)}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          >
                            {!parent && <Check className="h-4 w-4 text-primary1 mr-2" />}
                            <span className={!parent ? 'font-medium' : ''}>No parent category</span>
                          </button>
                          
                          {filteredParentCategories.map((category) => (
                            <button
                              key={category._id}
                              type="button"
                              onClick={() => selectParentCategory(category)}
                              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                              {parent === category._id && <Check className="h-4 w-4 text-primary1 mr-2" />}
                              <span className={parent === category._id ? 'font-medium' : ''}>
                                {category.name}
                              </span>
                            </button>
                          ))}
                          
                          {filteredParentCategories.length === 0 && parentSearchTerm && (
                            <div className="px-3 py-2 text-sm text-gray-500">
                              No categories found
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Category Image (optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Image (optional)
                  </label>
                  <div className="space-y-3">
                    {image && image !== 'null' && image.trim() !== '' ? (
                      <div className="relative">
                        <img 
                          src={image} 
                          alt="Category" 
                          className="w-auto h-40 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage('image')}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-2">
                          <label htmlFor="image-upload" className="cursor-pointer">
                            <span className="text-sm font-medium text-primary1 hover:text-primary1/90">
                              Upload Image
                            </span>
                          </label>
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setImageFile(file);
                                const reader = new FileReader();
                                reader.onload = () => {
                                  handleImageUpload('image', reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Category Banner (optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Banner (optional)
                  </label>
                  <div className="space-y-3">
                    {banner && banner !== 'null' && banner.trim() !== '' ? (
                      <div className="relative">
                        <img 
                          src={banner} 
                          alt="Banner" 
                          className="w-auto h-40 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage('banner')}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
                        <div className="mt-2">
                          <label htmlFor="banner-upload" className="cursor-pointer">
                            <span className="text-sm font-medium text-primary1 hover:text-primary1/90">
                              Upload Banner
                            </span>
                          </label>
                          <input
                            id="banner-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setBannerFile(file);
                                const reader = new FileReader();
                                reader.onload = () => {
                                  handleImageUpload('banner', reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Active Status */}
                <div className="flex items-center">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 text-primary1 focus:ring-primary1 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                </div>

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex w-full justify-center rounded-md bg-primary1 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary1/90 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                        Processing...
                      </>
                    ) : mode === 'create' ? 'Create Category' : 'Update Category'}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;
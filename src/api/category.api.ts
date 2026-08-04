import axiosInstance from './axiosInstance';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parent?: string | null;
  isActive: boolean;
  image?: string | null;
  banner?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryData {
  name: string;
  parent?: string | null;
  isActive?: boolean;
  image?: string | null; // kept for backward-compat in UI; API uses FormData
  banner?: string | null; // kept for backward-compat in UI; API uses FormData
}

export interface UpdateCategoryData {
  name?: string;
  parent?: string | null;
  isActive?: boolean;
  image?: string | null;
  banner?: string | null;
}

export interface CategoryFilters {
  page?: number;
  limit?: number;
  sort?: string;
  fields?: string;
  search?: string;
  isActive?: boolean;
  parent?: string;
}

export interface CategoryListResponse {
  statusCode: number;
  data: {
    categories: Category[];
    total: number;
  };
  message: string;
  success: boolean;
}

export interface CategoryCreateResponse {
  statusCode: number;
  data: {
    category: Category;
  };
  message: string;
  success: boolean;
}

export interface CategoryUpdateResponse {
  statusCode: number;
  data: {
    category: Category;
  };
  message: string;
  success: boolean;
}

// Get a single category by ID
export const getCategoryById = async (id: string): Promise<Category> => {
  const response = await axiosInstance.get(`/categories/${id}`);
  return response.data.data.category as Category;
};

// List categories with filters and pagination
export const listCategories = async (filters: CategoryFilters = {}): Promise<CategoryListResponse> => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString());
    }
  });

  const response = await axiosInstance.get(`/categories?${params.toString()}`);
  return response.data;
};

// Create a new category (multipart/form-data)
export const createCategory = async (form: FormData): Promise<Category> => {
  const response = await axiosInstance.post('/categories', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data.category;
};

// Update a category (multipart/form-data)
export const updateCategory = async (id: string, form: FormData): Promise<Category> => {
  const response = await axiosInstance.put(`/categories/${id}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data.category;
};

// Toggle category active status
export const toggleCategoryActive = async (id: string): Promise<Category> => {
  const response = await axiosInstance.patch(`/categories/${id}/active`, { isActive: false });
  return response.data.data.category;
};

// Delete a category
export const deleteCategory = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/categories/${id}`);
};

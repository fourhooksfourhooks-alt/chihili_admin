import { create } from 'zustand';
import { 
  listCategories, 
  createCategory, 
  updateCategory, 
  toggleCategoryActive, 
  deleteCategory,
  type Category,
  type CreateCategoryData,
  type UpdateCategoryData,
  type CategoryFilters,
  getCategoryById
} from '@/api/category.api';

interface CategoryState {
  categories: Category[];
  selectedCategory: Category | null;
  loading: boolean;
  error: string | null;
  total: number;
  filters: CategoryFilters;
  
  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCategories: (categories: Category[]) => void;
  setSelectedCategory: (category: Category | null) => void;
  setTotal: (total: number) => void;
  setFilters: (filters: Partial<CategoryFilters>) => void;
  
  // API operations
  fetchCategories: (filters?: CategoryFilters) => Promise<void>;
  fetchCategoryById: (id: string) => Promise<Category | null>;
  addCategory: (data: CreateCategoryData | FormData) => Promise<void>;
  editCategory: (id: string, data: UpdateCategoryData | FormData) => Promise<void>;
  toggleActive: (id: string) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  
  // Reset state
  reset: () => void;
}

const initialState = {
  categories: [],
  selectedCategory: null,
  loading: false,
  error: null,
  total: 0,
  filters: {
    limit: 10,
    sort: '-createdAt',
    fields: 'name,slug,parent,isActive,createdAt,image,banner',
    search: '',
    isActive: undefined,
    parent: undefined,
  },
};

export const useCategoryStore = create<CategoryState>((set, get) => ({
  ...initialState,

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setCategories: (categories) => set({ categories }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setTotal: (total) => set({ total }),
  setFilters: (filters) => set((state) => ({ 
    filters: { ...state.filters, ...filters } // Update filters
  })),

  fetchCategories: async (filters = {}) => {
    try {
      set({ loading: true, error: null });
      const currentFilters = { ...get().filters, ...filters };
      const response = await listCategories(currentFilters);
      
      // Ensure we have valid data structure (response matches CategoryListResponse)
      const categories = response.data?.categories ?? [];
      const total = response.data?.total ?? 0;
      
      set({
        categories: Array.isArray(categories) ? categories : [],
        total: typeof total === 'number' ? total : 0,
        filters: currentFilters,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch categories';
      set({ 
        error: errorMessage,
        categories: [],
        total: 0
      });
      console.error('Error fetching categories:', error);
    } finally {
      set({ loading: false });
    }
  },

  fetchCategoryById: async (id) => {
    try {
      set({ loading: true, error: null });
      const category = await getCategoryById(id);
      set({ selectedCategory: category });
      return category;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch category';
      set({ error: errorMessage, selectedCategory: null });
      console.error('Error fetching category by id:', error);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  addCategory: async (data) => {
    try {
      set({ loading: true, error: null });
      const form = data instanceof FormData ? data : (() => {
        const fd = new FormData();
        fd.append('name', data.name);
        if (data.parent !== undefined && data.parent !== null) fd.append('parent', data.parent);
        if (typeof data.isActive === 'boolean') fd.append('isActive', String(data.isActive));
        // image and banner should be appended by caller as File if available
        return fd;
      })();

      const newCategory = await createCategory(form);
      
      set((state) => ({
        categories: [newCategory, ...state.categories],
        error: null,
      }));
      
      // Refresh the list to get updated data
      await get().fetchCategories();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create category';
      set({ error: errorMessage });
      console.error('Error creating category:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  editCategory: async (id, data) => {
    try {
      set({ loading: true, error: null });
      const form = data instanceof FormData ? data : (() => {
        const fd = new FormData();
        if (data.name !== undefined) fd.append('name', data.name);
        if (data.parent !== undefined) fd.append('parent', data.parent ?? '');
        if (typeof data.isActive === 'boolean') fd.append('isActive', String(data.isActive));
        // image and banner should be appended by caller as File if available
        return fd;
      })();

      const updatedCategory = await updateCategory(id, form);
      
      set((state) => ({
        categories: state.categories.map(cat => 
          cat._id === id ? updatedCategory : cat
        ),
        error: null,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update category';
      set({ error: errorMessage });
      console.error('Error updating category:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  toggleActive: async (id) => {
    try {
      set({ loading: true, error: null });
      const updatedCategory = await toggleCategoryActive(id);
      
      set((state) => ({
        categories: state.categories.map(cat => 
          cat._id === id ? updatedCategory : cat
        ),
        error: null,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle category status';
      set({ error: errorMessage });
      console.error('Error toggling category status:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  removeCategory: async (id) => {
    try {
      set({ loading: true, error: null });
      await deleteCategory(id);
      
      set((state) => ({
        categories: state.categories.filter(cat => cat._id !== id),
        error: null,
      }));
      
      // Refresh the list to get updated data
      await get().fetchCategories();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete category';
      set({ error: errorMessage });
      console.error('Error deleting category:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  reset: () => set(initialState),
}));

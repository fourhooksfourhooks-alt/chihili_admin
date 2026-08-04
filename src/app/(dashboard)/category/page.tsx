"use client";

import { useState, useEffect } from "react";
import {
  Edit3,
  Trash2,
  Plus,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  EyeOff,
  Image as ImageIcon,
} from "lucide-react";
import CategoryModal from "@/components/CategoryModal";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useCategoryStore } from "@/store/categoryStore";
import type { Category, CategoryFilters } from "@/api/category.api";

const CategoryPage = () => {
  const {
    categories,
    loading,
    error,
    total,
    filters,
    fetchCategories,
    fetchCategoryById,
    addCategory,
    editCategory,
    toggleActive,
    removeCategory,
    setFilters,
    setError,
  } = useCategoryStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Initialize categories on component mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Handle search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters.search) {
        setFilters({ search: searchTerm });
        // Trigger fetch with updated search
        fetchCategories({ search: searchTerm });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, filters.search, setFilters, fetchCategories]);

  // Handle category creation
  const handleCreateCategory = async (data: {
    name: string;
    parent?: string | null;
    isActive: boolean;
    image?: string | null;
    banner?: string | null;
    imageFile?: File | null;
    bannerFile?: File | null;
  }) => {
    try {
      const form = new FormData();
      form.append("name", data.name);
      if (data.parent) form.append("parent", data.parent);
      form.append("isActive", String(data.isActive));
      if (data.imageFile) form.append("image", data.imageFile);
      if (data.bannerFile) form.append("banner", data.bannerFile);

      await addCategory(form);
      setModalOpen(false);
    } catch (error) {
      throw error;
    }
  };

  // Handle category update
  const handleUpdateCategory = async (data: {
    name: string;
    parent?: string | null;
    isActive: boolean;
    image?: string | null;
    banner?: string | null;
    imageFile?: File | null;
    bannerFile?: File | null;
  }) => {
    if (!editingCategory) return;

    try {
      const form = new FormData();
      form.append("name", data.name);
      if (data.parent) form.append("parent", data.parent);
      form.append("isActive", String(data.isActive));
      if (data.imageFile) form.append("image", data.imageFile);
      // If user removed existing image, send explicit 'null' to clear on backend
      if (data.image === null && !data.imageFile) {
        form.append("image", "null");
      }
      if (data.bannerFile) form.append("banner", data.bannerFile);
      // If user removed existing banner, send explicit 'null' to clear on backend
      if (data.banner === null && !data.bannerFile) {
        form.append("banner", "null");
      }

      await editCategory(editingCategory._id, form);
      setEditingCategory(null);
    } catch (error) {
      throw error;
    }
  };

  // Handle category deletion
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      setIsDeleting(true);
      setError(null);

      await removeCategory(categoryToDelete._id);

      setDeleteModal(false);
      setCategoryToDelete(null);
    } catch (error) {
      console.error("Error deleting category:", error);
      setDeleteModal(false);
      setCategoryToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle toggle active status
  const handleToggleActive = async (category: Category) => {
    try {
      await toggleActive(category._id);
    } catch (error) {
      console.error("Error toggling category status:", error);
    }
  };

  const onEditClick = async (category: Category) => {
    // Fetch the latest data from server before editing
    const fresh = await fetchCategoryById(category._id);
    setEditingCategory(fresh || category);
    setModalOpen(true);
  };

  const onDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteModal(true);
  };

  const handleFilterChange = (newFilters: Partial<CategoryFilters>) => {
    setFilters(newFilters);
    // Trigger fetch with updated filters (partial)
    fetchCategories(newFilters);
  };

  const clearFilters = () => {
    const reset = {
      search: "",
      isActive: undefined,
      parent: undefined,
      sort: "-createdAt",
    } as Partial<CategoryFilters>;
    setFilters(reset);
    setSearchTerm("");
    fetchCategories(reset);
  };

  const getParentCategoryName = (parentId: string | null) => {
    if (!parentId) return "No parent";
    const parentCat = categories.find((cat) => cat._id === parentId);
    return parentCat ? parentCat.name : "Unknown";
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your menu categories here. You can add, edit, or remove
            categories.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={() => {
              setEditingCategory(null);
              setModalOpen(true);
            }}
            className="flex items-center justify-center rounded-md bg-primary1 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary1/90 transition-colors cursor-pointer"
          >
            <Plus className="h-5 w-5 mr-1" />
            Add Category
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mt-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary1 focus:border-primary1 sm:text-sm"
              />
            </div>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary1"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={
                    filters.isActive === undefined
                      ? ""
                      : filters.isActive.toString()
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    handleFilterChange({
                      isActive: value === "" ? undefined : value === "true",
                    });
                  }}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary1 focus:ring-1 focus:ring-primary1 focus:outline-none"
                >
                  <option value="">All</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  value={filters.sort || "-createdAt"}
                  onChange={(e) => handleFilterChange({ sort: e.target.value })}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary1 focus:ring-1 focus:ring-primary1 focus:outline-none"
                >
                  <option value="-createdAt">Newest First</option>
                  <option value="createdAt">Oldest First</option>
                  <option value="name">Name A-Z</option>
                  <option value="-name">Name Z-A</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary1"
                >
                  Clear Filters
                </button>
              </div>
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
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Parent
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Created At
                    </th>
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
                      <td colSpan={6} className="text-center py-4">
                        <div className="flex justify-center">
                          <div className="animate-spin h-5 w-5 border-2 border-primary1 border-t-transparent rounded-full"></div>
                        </div>
                      </td>
                    </tr>
                  ) : !Array.isArray(categories) || categories.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-4 text-gray-500"
                      >
                        No categories found
                      </td>
                    </tr>
                  ) : (
                    (Array.isArray(categories) ? categories : []).map(
                      (category) => (
                        <tr key={category._id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {category.image ? (
                              <img
                                src={category.image}
                                alt={category.name}
                                className="h-12 w-12 object-cover rounded-lg border border-gray-300"
                              />
                            ) : (
                              <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </td>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {category.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {getParentCategoryName(category.parent || null)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <button
                              onClick={() => handleToggleActive(category)}
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                category.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              } hover:opacity-80 transition-opacity`}
                            >
                              {category.isActive ? (
                                <>
                                  <Eye className="h-3 w-3 mr-1" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <EyeOff className="h-3 w-3 mr-1" />
                                  Inactive
                                </>
                              )}
                            </button>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {category.createdAt
                              ? new Date(
                                  category.createdAt
                                ).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button
                              onClick={() => onEditClick(category)}
                              className="text-gray-500 hover:text-primary1 p-2 rounded-lg hover:bg-primary1/10 transition-colors cursor-pointer"
                            >
                              <Edit3 className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => onDeleteClick(category)}
                              className="text-gray-500 hover:text-primary1 p-2 rounded-lg hover:bg-primary1/10 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      )
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Category Count */}
      {!loading && Array.isArray(categories) && categories.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-white rounded-lg shadow mt-4">
          <div className="text-center">
            <div className="text-sm text-gray-500">
              Total Categories: <span className="font-medium">{total}</span>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      <CategoryModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}
        initialData={editingCategory}
        mode={editingCategory ? "edit" : "create"}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal}
        onClose={() => {
          setDeleteModal(false);
          setCategoryToDelete(null);
        }}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        message={`Are you sure you want to delete the category "${
          categoryToDelete?.name || ""
        }"? This action cannot be undone.`}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        type="danger"
      />
    </div>
  );
};

export default CategoryPage;

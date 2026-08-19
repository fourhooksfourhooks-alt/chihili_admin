# Chihili Admin Panel - Technical Documentation

**Version:** 0.1.0  
**Last Updated:** October 17, 2025  
**Framework:** Next.js 15.3.5 with React 19  
**Language:** TypeScript 5.x

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Core Architecture](#core-architecture)
5. [State Management](#state-management)
6. [API Integration](#api-integration)
7. [Authentication & Authorization](#authentication--authorization)
8. [Key Features](#key-features)
9. [Admin Dashboard](#admin-dashboard)
10. [Vendor Management](#vendor-management)
11. [Product Management](#product-management)
12. [Category Management](#category-management)
13. [UI Components](#ui-components)
14. [Styling & Theming](#styling--theming)
15. [Configuration](#configuration)
16. [Development Guide](#development-guide)
17. [Build & Deployment](#build--deployment)
18. [Best Practices](#best-practices)
19. [Troubleshooting](#troubleshooting)

---

## 1. Overview

**Chihili Admin Panel** is a comprehensive administrative dashboard for managing the Chihili e-commerce platform. Built with Next.js 15 and React 19, it provides vendors and administrators with powerful tools to manage products, categories, orders, and business operations.

### Key Highlights

- **Vendor Portal:** Complete vendor onboarding and management
- **Product Management:** CRUD operations with variants, images, and stock control
- **Category Management:** Hierarchical category organization
- **Real-time Updates:** Live data synchronization
- **Role-based Access:** Admin and vendor-specific features
- **Modern UI:** Material-UI (MUI) and Radix UI components
- **Export Functionality:** Excel export for reports

### Target Users

1. **Super Admin** - Full system access and control
2. **Vendors** - Manage their products and inventory
3. **Admin Staff** - Category and content management

---

## 2. Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.3.5 | React framework with App Router |
| React | 19.0.0 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Utility-first CSS framework |

### UI Component Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| Material-UI (MUI) | 7.2.0 | Material Design components |
| Radix UI | Various | Headless UI primitives |
| Heroicons | 2.2.0 | Icon library |
| Lucide React | 0.539.0 | Additional icons |
| Framer Motion | 12.23.12 | Animations |

### State Management & Data

- **Zustand** (5.0.7) - Lightweight state management with persistence
- **Axios** (1.10.0) - HTTP client with interceptors
- **XLSX** (0.18.5) - Excel file generation

### Authentication & Security

- **Firebase** (12.1.0) - Social authentication provider
- **cookies-next** (6.1.0) - Secure cookie management

### Additional Libraries

- **Sonner** (2.0.7) - Toast notifications
- **next-themes** (0.4.6) - Dark mode support
- **class-variance-authority** (0.7.1) - Component variants
- **clsx** & **tailwind-merge** - Conditional styling

---

## 3. Project Structure

```
chihil-admin/
├── public/
│   └── images/                 # Static images and assets
│
├── src/
│   ├── api/                    # API integration layer
│   │   ├── axiosInstance.ts    # Configured axios with interceptors
│   │   ├── auth.api.ts         # Authentication endpoints
│   │   ├── vendor.auth.ts      # Vendor-specific endpoints
│   │   ├── category.api.ts     # Category CRUD operations
│   │   └── product.api.ts      # Product management endpoints
│   │
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Landing page
│   │   ├── globals.css         # Global styles
│   │   │
│   │   ├── (dashboard)/        # Dashboard route group
│   │   │   ├── layout.tsx      # Dashboard layout with sidebar
│   │   │   ├── home/           # Dashboard home
│   │   │   ├── category/       # Category management
│   │   │   │   ├── page.tsx    # Category list
│   │   │   │   ├── add/        # Add category
│   │   │   │   ├── edit/       # Edit category
│   │   │   │   └── view/       # View category
│   │   │   └── product/        # Product management
│   │   │       ├── page.tsx    # Product list
│   │   │       ├── add/        # Add product
│   │   │       ├── edit/       # Edit product
│   │   │       └── view/       # View product
│   │   │
│   │   ├── auth/               # Authentication pages
│   │   │   ├── login/          # Login page
│   │   │   └── signup/         # Registration
│   │   │
│   │   └── vendorsOnboard/     # Vendor onboarding flow
│   │
│   ├── components/             # React components
│   │   ├── Navbar.tsx          # Top navigation bar
│   │   ├── Menu.tsx            # Sidebar navigation menu
│   │   ├── ImageUpload.tsx     # Image upload component
│   │   ├── CategoryModal.tsx   # Category create/edit modal
│   │   ├── ProductModal.tsx    # Product create/edit modal
│   │   ├── VariantForm.tsx     # Product variant form
│   │   ├── DeleteConfirmationModal.tsx
│   │   ├── ConfirmationModal.tsx
│   │   ├── BlockingModal.tsx
│   │   ├── RegisterUserModal.tsx
│   │   ├── ResetPasswordModal.tsx
│   │   └── ui/                 # Reusable UI components
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       ├── card.tsx
│   │       ├── badge.tsx
│   │       ├── alert.tsx
│   │       ├── checkbox.tsx
│   │       ├── switch.tsx
│   │       ├── tabs.tsx
│   │       ├── label.tsx
│   │       ├── textarea.tsx
│   │       └── sonner.tsx      # Toast notifications
│   │
│   ├── store/                  # Zustand state stores
│   │   ├── authStore.ts        # Authentication & user state
│   │   ├── categoryStore.ts    # Category management state
│   │   └── productStore.ts     # Product management state
│   │
│   ├── hooks/                  # Custom React hooks
│   │   └── useForm.ts          # Form handling hook
│   │
│   ├── config/                 # Configuration files
│   │   └── firebaseConfig.ts   # Firebase configuration
│   │
│   ├── lib/                    # Utility libraries
│   │   ├── FirebaseClient.ts   # Firebase client setup
│   │   └── utils.ts            # Helper functions
│   │
│   └── utils/                  # Utility functions
│       └── imageUtils.ts       # Image processing utilities
│
├── components.json             # Shadcn UI configuration
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS config
├── tsconfig.json               # TypeScript config
├── eslint.config.mjs           # ESLint configuration
├── postcss.config.mjs          # PostCSS config
└── package.json                # Dependencies
```

---

## 4. Core Architecture

### App Router Pattern

The admin panel uses Next.js 15's App Router with route groups for organization:

#### Route Groups

1. **(dashboard)** - Protected admin/vendor pages with sidebar layout
2. **auth** - Authentication pages (login, signup)
3. **vendorsOnboard** - Vendor onboarding flow

#### Layout Hierarchy

```
Root Layout (app/layout.tsx)
    ├── Global styles and fonts
    ├── Toaster for notifications
    └── Common metadata
        │
        ├── Auth Layout (app/auth/layout.tsx)
        │   └── Minimal layout for login/signup
        │
        ├── Dashboard Layout (app/(dashboard)/layout.tsx)
        │   ├── Sidebar navigation (Menu)
        │   ├── Top navbar
        │   └── Main content area
        │
        └── Vendor Onboarding Layout
            └── Step-by-step onboarding flow
```

### Data Flow Architecture

```
User Interaction (Component)
    ↓
Zustand Store Action
    ↓
API Call (axios instance)
    ↓
Request Interceptor (Add JWT token)
    ↓
Backend API
    ↓
Response Interceptor (Handle 401, refresh token)
    ↓
Update Store State
    ↓
Component Re-render
    ↓
UI Update + Toast Notification
```

### Role-Based Access Control

```typescript
// User roles in the system
type UserRole = 'admin' | 'vendor' | 'staff';

// Route protection based on role
const protectedRoutes = {
  admin: ['/home', '/category', '/product', '/users', '/settings'],
  vendor: ['/home', '/product'],
  staff: ['/category', '/content']
};
```

---

## 5. State Management

### Zustand Store Architecture

Chihili Admin uses **Zustand** with persistence for state management.

#### Store Features

1. **Persistence** - State saved to localStorage
2. **DevTools** - Redux DevTools integration
3. **Type Safety** - Full TypeScript support
4. **Minimal Boilerplate** - Simple API

### Key Stores

#### 1. Auth Store (`authStore.ts`)

**Purpose:** Manages authentication, user session, and vendor information

**State:**
```typescript
{
  user: AuthUser | null;          // Current user
  token: string | null;           // JWT access token
  isAuthenticated: boolean;       // Auth status
  vendor: Vendor | null;          // Vendor profile
  vendorLoading: boolean;         // Vendor fetch state
  vendorError: string | null;     // Vendor errors
}
```

**Key Actions:**

1. **Authentication:**
   - `login(identifier, password)` - User login
   - `logout()` - Clear session
   - `refreshToken()` - Refresh JWT token
   - `signup(payload)` - User registration

2. **Vendor Management:**
   - `fetchVendor()` - Get current vendor profile
   - Returns vendor data or null if not onboarded

3. **State Management:**
   - `setAuth(user, token)` - Set authentication
   - `clearAuth()` - Clear all auth data

**Persistence:**
```typescript
// Persisted to localStorage under 'auth-storage'
persist(
  (set, get) => ({ /* state */ }),
  {
    name: 'auth-storage',
    storage: createJSONStorage(() => localStorage),
  }
)
```

**Usage Example:**
```typescript
import { useAuthStore } from '@/store/authStore';

const MyComponent = () => {
  const { user, vendor, login, logout } = useAuthStore();
  
  const handleLogin = async () => {
    try {
      const result = await login('admin@chihili.com', 'password');
      console.log('Logged in:', result.user);
      console.log('Vendor:', result.vendor);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  return (
    <div>
      {user ? `Welcome ${user.email}` : 'Please login'}
      {vendor && <p>Shop: {vendor.shopName}</p>}
    </div>
  );
};
```

---

#### 2. Category Store (`categoryStore.ts`)

**Purpose:** Manages product categories with CRUD operations

**State:**
```typescript
{
  categories: Category[];         // Category list
  selectedCategory: Category | null; // Current category
  loading: boolean;               // Loading state
  error: string | null;           // Error message
  total: number;                  // Total count
  filters: CategoryFilters;       // Active filters
}
```

**Key Actions:**

1. **CRUD Operations:**
   - `fetchCategories(filters)` - Get category list
   - `fetchCategoryById(id)` - Get single category
   - `addCategory(data)` - Create new category
   - `editCategory(id, data)` - Update category
   - `removeCategory(id)` - Delete category

2. **Status Management:**
   - `toggleActive(id)` - Toggle active/inactive status

3. **State Setters:**
   - `setCategories(categories)` - Update category list
   - `setSelectedCategory(category)` - Set current category
   - `setFilters(filters)` - Update filter state
   - `setError(error)` - Set error message
   - `reset()` - Reset to initial state

**Filters:**
```typescript
interface CategoryFilters {
  page?: number;
  limit?: number;              // Default: 10
  sort?: string;               // Default: '-createdAt'
  fields?: string;             // Selected fields
  search?: string;             // Search query
  isActive?: boolean;          // Filter by active status
  parent?: string;             // Filter by parent category
}
```

**Usage Example:**
```typescript
import { useCategoryStore } from '@/store/categoryStore';

const CategoryList = () => {
  const { 
    categories, 
    loading, 
    total,
    fetchCategories, 
    addCategory,
    toggleActive 
  } = useCategoryStore();
  
  useEffect(() => {
    fetchCategories({ limit: 20, isActive: true });
  }, []);
  
  const handleCreate = async (data) => {
    await addCategory(data);
    // List automatically refreshed
  };
  
  return (
    <div>
      <h2>Categories ({total})</h2>
      {loading ? <Spinner /> : (
        categories.map(cat => (
          <div key={cat._id}>
            {cat.name}
            <button onClick={() => toggleActive(cat._id)}>
              {cat.isActive ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        ))
      )}
    </div>
  );
};
```

---

#### 3. Product Store (`productStore.ts`)

**Purpose:** Comprehensive product management with variants, images, and stock

**State:**
```typescript
{
  products: Product[];            // Product list
  totalCount: number;             // Total products
  currentPage: number;            // Current page
  pageLimit: number;              // Items per page
  isLoading: boolean;             // Loading state
  error: string | null;           // Error message
  currentProduct: Product | null; // Selected product
  filters: ProductFilters;        // Active filters
}
```

**Key Actions:**

**1. Core CRUD:**
- `fetchProducts(filters)` - Get product list
- `fetchProductById(id)` - Get single product
- `fetchProductBySlug(slug)` - Get by URL slug
- `fetchVendorProducts(vendorId, filters)` - Get vendor's products
- `addProduct(data)` - Create new product
- `editProduct(id, data)` - Update product
- `removeProduct(id)` - Delete product

**2. Status Management:**
- `changeProductStatus(id, status)` - Change product status
  - Status: `draft | active | inactive | archived`
- `toggleProductFeatured(id, isFeatured)` - Toggle featured flag

**3. Variant Management:**
- `addProductVariants(productId, variants)` - Add variants
- `updateProductVariant(productId, sku, data)` - Update variant
- `removeProductVariant(productId, sku)` - Remove variant
- `updateProductStock(productId, updates)` - Update stock levels

**4. Image Management:**
- `uploadProductImages(productId, files)` - Upload product images
- `uploadVariantImages(productId, sku, files)` - Upload variant images
- `deleteProductImage(productId, imageUrl)` - Delete product image
- `deleteVariantImage(productId, sku, imageUrl)` - Delete variant image

**5. Special Endpoints:**
- `fetchBestSellingProducts(filters)` - Get top sellers
- `fetchFestivalFavorites(filters)` - Get featured products

**6. Utility:**
- `clearCurrentProduct()` - Clear selected product
- `setError(error)` - Set error message
- `setFilters(filters)` - Update filters

**Product Type:**
```typescript
interface Product {
  _id?: string;
  vendorId: string;               // Vendor owner
  name: string;                   // Product name
  slug?: string;                  // URL slug
  shortDescription?: string;
  description?: string;
  categories?: string[];          // Category IDs
  tags?: string[];                // Product tags
  images?: string[];              // Product images
  variants: ProductVariant[];     // Required: at least 1
  status: 'draft' | 'active' | 'inactive' | 'archived';
  isFeatured: boolean;
  returnPolicy?: string;
  discountType?: 'percentage' | 'flat';
  discountValue?: number;
  buyXGetY?: { x: number; y: number };
  avgRating?: number;
  ratingsCount?: number;
  totalReviews?: number;
  salesCount?: number;
  wishlistCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
```

**Variant Type:**
```typescript
interface ProductVariant {
  sku?: string;                   // Auto-generated
  title?: string;                 // Variant name
  attributes?: {
    size?: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
    color?: string;
  };
  price: number;                  // Required
  mrp?: number;                   // Original price
  stock?: number;                 // Stock quantity
  images?: string[];              // Variant-specific images
}
```

**Usage Example:**
```typescript
import { useProductStore } from '@/store/productStore';

const ProductManager = () => {
  const { 
    products, 
    isLoading,
    currentProduct,
    fetchProducts,
    addProduct,
    addProductVariants,
    uploadProductImages
  } = useProductStore();
  
  useEffect(() => {
    fetchProducts({ 
      status: 'active', 
      limit: 20,
      sort: '-createdAt' 
    });
  }, []);
  
  const handleCreateProduct = async () => {
    const productData = {
      vendorId: 'vendor123',
      name: 'Traditional Saree',
      description: 'Beautiful handwoven saree',
      categories: ['cat123'],
      variants: [
        {
          title: 'Red - Medium',
          attributes: { size: 'M', color: 'Red' },
          price: 2500,
          mrp: 3000,
          stock: 10
        }
      ],
      status: 'active',
      isFeatured: false
    };
    
    const newProduct = await addProduct(productData);
    
    // Upload images
    if (newProduct && files.length > 0) {
      await uploadProductImages(newProduct._id, files);
    }
  };
  
  return (
    <div>
      <h2>Products ({products.length})</h2>
      {isLoading ? <Spinner /> : (
        products.map(product => (
          <ProductCard key={product._id} product={product} />
        ))
      )}
    </div>
  );
};
```

---

## 6. API Integration

### Axios Instance Configuration

**File:** `src/api/axiosInstance.ts`

#### Features

1. **Base URL:**
   ```typescript
   baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://chihili-backend.onrender.com/api"
   ```

2. **Credentials:**
   ```typescript
   withCredentials: true  // Send HttpOnly cookies
   ```

3. **Request Interceptor:**
   - Automatically attaches JWT token from auth store
   - Adds `Authorization: Bearer <token>` header

4. **Response Interceptor:**
   - Handles 401 Unauthorized errors
   - Implements automatic token refresh
   - Queues failed requests during refresh
   - Retries requests with new token
   - Automatic logout on refresh failure

#### Token Refresh Flow

```
API Request → 401 Error
    ↓
Already refreshing? 
    ↓ Yes → Queue request
    ↓ No
Set isRefreshing = true
    ↓
Call authStore.refreshToken()
    ↓
Get new access token
    ↓
Process queued requests
    ↓
Retry original request
    ↓ On Failure
Clear auth & redirect to login
```

---

### API Modules

#### 1. Authentication API (`auth.api.ts`)

**Plain Instance:** Uses separate axios instance without interceptors to avoid circular dependencies.

**Endpoints:**

```typescript
// Login
POST /auth/login
Body: { identifier: string, password: string }
Returns: { user, accessToken, vendor }

// Social Login (Firebase)
POST /auth/login
Headers: { Authorization: 'Bearer <firebase-token>' }
Returns: { user, accessToken, vendor }

// Signup
POST /auth/signup
Body: { mobile?: string, email?: string }
Returns: OTP sent

// Verify OTP
POST /auth/verify-otp
Body: { otp: string, mobile?: string, email?: string }
Returns: { verificationToken }

// Create Password
POST /auth/create-password
Body: { password: string, verificationToken: string }
Returns: { user, accessToken }

// Refresh Token
POST /auth/refresh
Uses HttpOnly cookie
Returns: { accessToken }

// Logout
POST /auth/logout
Returns: Success message
```

---

#### 2. Vendor API (`vendor.auth.ts`)

**Endpoints:**

```typescript
// Create Vendor Profile (Onboarding)
POST /vendors
Body: VendorPayload {
  shopName: string;
  description: string;
  address: {
    street, city, state, postalCode, country
  };
  documents: {
    gstNumber, gstFile, panNumber, panFile
  };
  bankDetails: {
    accountName, accountNumber, ifscCode, bankName
  };
}
Returns: { vendor }

// Get Current User's Vendor
GET /vendors/me
Returns: { vendor | null }
```

**Vendor Type:**
```typescript
interface Vendor {
  _id: string;
  userId: string;
  shopName: string;
  description?: string;
  address?: object;
  documents?: object;
  bankDetails?: object;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  ratingAvg?: number;
  ratingCount?: number;
  createdAt?: string;
  updatedAt?: string;
}
```

---

#### 3. Category API (`category.api.ts`)

**Endpoints:**

```typescript
// List Categories
GET /categories
Query: CategoryFilters {
  page?, limit?, sort?, fields?, search?,
  isActive?, parent?
}
Returns: { categories: Category[], total: number }

// Get Category by ID
GET /categories/:id
Returns: { category: Category }

// Create Category
POST /categories
Body: FormData or CreateCategoryData {
  name: string;
  parent?: string;
  isActive?: boolean;
  image?: File;
  banner?: File;
}
Returns: { category: Category }

// Update Category
PATCH /categories/:id
Body: FormData or UpdateCategoryData
Returns: { category: Category }

// Toggle Active Status
PATCH /categories/:id/toggle-active
Returns: { category: Category }

// Delete Category
DELETE /categories/:id
Returns: Success message
```

**Category Type:**
```typescript
interface Category {
  _id: string;
  name: string;
  slug: string;              // Auto-generated
  description?: string;
  parent?: string | null;    // Parent category ID
  isActive: boolean;
  image?: string;            // Image URL
  banner?: string;           // Banner URL
  createdAt?: string;
  updatedAt?: string;
}
```

---

#### 4. Product API (`product.api.ts`)

**Endpoints:**

**Core CRUD:**
```typescript
// List Products
GET /products
Query: ProductFilters {
  search?, categories?, category?, status?,
  isFeatured?, sort?, vendorId?, page?, limit?
}
Returns: { products: Product[], total: number }

// Get Product by ID
GET /products/:id
Returns: { product: Product }

// Get Product by Slug
GET /products/slug/:slug
Returns: { product: Product }

// Get Vendor Products
GET /vendors/:vendorId/products
Query: ProductFilters
Returns: { products: Product[], total: number }

// Create Product
POST /products
Body: CreateProductData
Returns: { product: Product }

// Update Product
PATCH /products/:id
Body: UpdateProductData
Returns: { product: Product }

// Delete Product
DELETE /products/:id
Returns: Success message
```

**Status & Features:**
```typescript
// Update Product Status
PATCH /products/:id/status
Body: { status: 'draft' | 'active' | 'inactive' | 'archived' }
Returns: { product: Product }

// Toggle Featured
PATCH /products/:id/featured
Body: { isFeatured: boolean }
Returns: { product: Product }
```

**Variant Management:**
```typescript
// Add Variants
POST /products/:id/variants
Body: { variants: ProductVariant[] }
Returns: { product: Product }

// Update Variant
PATCH /products/:id/variants/:sku
Body: Partial<ProductVariant>
Returns: { product: Product }

// Remove Variant
DELETE /products/:id/variants/:sku
Returns: { product: Product }

// Update Stock
PATCH /products/:id/stock
Body: { updates: StockUpdate[] }
StockUpdate: { sku: string, stock: number }
Returns: { product: Product }
```

**Image Management:**
```typescript
// Upload Product Images
POST /products/:id/images
Body: FormData with files
Returns: { imageUrls: string[] }

// Upload Variant Images
POST /products/:id/variants/:sku/images
Body: FormData with files
Returns: { imageUrls: string[] }

// Delete Product Image
DELETE /products/:id/images
Body: { imageUrl: string }
Returns: Success

// Delete Variant Image
DELETE /products/:id/variants/:sku/images
Body: { imageUrl: string }
Returns: Success
```

**Special Endpoints:**
```typescript
// Best Selling Products
GET /products/best-selling
Query: { page?, limit?, category?, minRating? }
Returns: { products: Product[], total: number }

// Festival Favorites
GET /products/festival-favorites
Query: { page?, limit?, category?, festivalTag?, minRating? }
Returns: { products: Product[], total: number }
```

---

## 7. Authentication & Authorization

### Authentication Flow

#### 1. Standard Login Flow

```
User enters credentials
    ↓
authStore.login(identifier, password)
    ↓
POST /auth/login
    ↓
Backend validates
    ↓
Returns: { user, accessToken, vendor }
    ↓
Store in Zustand (persisted)
    ↓
Fetch vendor profile if exists
    ↓
Redirect to dashboard
```

**Code Example:**
```typescript
const handleLogin = async (email: string, password: string) => {
  try {
    const result = await useAuthStore.getState().login(email, password);
    
    console.log('User:', result.user);
    console.log('Vendor:', result.vendor);
    
    // Redirect based on role
    if (result.user.role === 'admin') {
      router.push('/home');
    } else if (result.vendor) {
      router.push('/product');
    } else {
      router.push('/vendorsOnboard');
    }
  } catch (error) {
    toast.error('Login failed');
  }
};
```

---

#### 2. Social Login (Firebase)

```
User clicks Google/Facebook
    ↓
Firebase popup authentication
    ↓
Get Firebase ID token
    ↓
loginWithFirebaseToken(idToken)
    ↓
POST /auth/login with Bearer token
    ↓
Backend verifies with Firebase
    ↓
Returns access token + user
    ↓
Store auth state
```

**Implementation:**
```typescript
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { loginWithFirebaseToken } from '@/api/auth.api';

const handleGoogleLogin = async () => {
  try {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();
    
    const response = await loginWithFirebaseToken(idToken);
    const { user, accessToken, vendor } = response.data;
    
    useAuthStore.getState().setAuth(user, accessToken);
    
    if (vendor) {
      useAuthStore.getState().vendor = vendor;
      router.push('/home');
    } else {
      router.push('/vendorsOnboard');
    }
  } catch (error) {
    console.error('Google login failed:', error);
  }
};
```

---

#### 3. Vendor Onboarding

For new vendors who haven't completed onboarding:

```
Login successful
    ↓
Check if vendor exists
    ↓ No vendor
Redirect to /vendorsOnboard
    ↓
Fill vendor form
    ↓
POST /vendors (create vendor)
    ↓
Vendor status: pending
    ↓
Wait for admin approval
    ↓
Status changed to: approved
    ↓
Access granted to dashboard
```

---

#### 4. Token Refresh

```
Page load/refresh
    ↓
Check if token exists in store
    ↓ No
Call authStore.refreshToken()
    ↓
POST /auth/refresh (with HttpOnly cookie)
    ↓
Backend validates refresh token
    ↓
Returns new access token
    ↓
Update store
    ↓
Resume normal operations
```

---

### Role-Based Access

```typescript
// Middleware or route protection
const checkRole = (requiredRole: string[]) => {
  const { user } = useAuthStore.getState();
  
  if (!user) {
    router.push('/auth/login');
    return false;
  }
  
  if (!requiredRole.includes(user.role)) {
    toast.error('Access denied');
    router.push('/home');
    return false;
  }
  
  return true;
};

// Usage in page
useEffect(() => {
  checkRole(['admin']);
}, []);
```

---

### Security Features

1. **JWT Access Tokens** - Short-lived (15 minutes)
2. **HttpOnly Refresh Tokens** - Secure, long-lived (7 days)
3. **Automatic Token Refresh** - Seamless user experience
4. **CORS Protection** - Allowed origins only
5. **CSRF Protection** - Token-based validation
6. **Password Hashing** - bcrypt on backend
7. **XSS Prevention** - React auto-escaping
8. **Rate Limiting** - API endpoint protection

---

## 8. Key Features

### 8.1 Dashboard Overview

**Location:** `app/(dashboard)/home/page.tsx`

**Features:**
- Sales statistics
- Recent orders
- Product performance
- Revenue charts
- Quick actions
- Notifications

**Widgets:**
1. **Total Sales** - Today, this week, this month
2. **Active Products** - Product count by status
3. **Pending Orders** - Orders to process
4. **Revenue Chart** - Line/bar chart
5. **Top Products** - Best sellers
6. **Recent Activity** - Action log

---

### 8.2 Category Management

**Location:** `app/(dashboard)/category/`

#### Features

**1. Category List:**
- Hierarchical tree view
- Parent-child relationships
- Search and filters
- Active/inactive toggle
- Bulk actions
- Excel export

**2. Create Category:**
- Category name (required)
- Parent category selection
- Description
- Image upload
- Banner upload
- Active status toggle

**3. Edit Category:**
- Update all fields
- Change parent
- Replace images
- Toggle active status

**4. Delete Category:**
- Confirmation modal
- Check for child categories
- Check for associated products
- Soft delete option

**Component:** `CategoryModal.tsx`

**API Calls:**
```typescript
// List categories
await fetchCategories({
  limit: 20,
  sort: '-createdAt',
  isActive: true
});

// Create category
await addCategory({
  name: 'Women Wear',
  parent: null,
  isActive: true
});

// Update category
await editCategory(categoryId, {
  name: 'Updated Name',
  isActive: false
});

// Delete category
await removeCategory(categoryId);
```

---

### 8.3 Product Management

**Location:** `app/(dashboard)/product/`

#### Features

**1. Product List:**
- Grid/list view toggle
- Advanced filters:
  - Search by name/SKU
  - Filter by category
  - Filter by status
  - Filter by featured
  - Sort options
- Quick edit
- Bulk status change
- Export to Excel

**2. Add Product:**

**Basic Information:**
- Product name (required)
- Short description
- Full description (rich text)
- Categories (multi-select)
- Tags
- Status (draft/active/inactive)
- Featured toggle

**Variants:**
- At least one variant required
- Variant title
- Attributes (size, color)
- Price (required)
- MRP (original price)
- Stock quantity
- Variant images

**Images:**
- Product images (up to 10)
- Variant-specific images
- Drag & drop upload
- Image preview
- Delete images

**Pricing & Discounts:**
- Discount type (percentage/flat)
- Discount value
- Buy X Get Y offers

**Policies:**
- Return policy
- Shipping info
- Care instructions

**3. Edit Product:**
- Update all fields
- Add/remove variants
- Manage stock
- Update images
- Change status

**4. Product Details:**
- Complete product view
- Sales statistics
- Stock levels
- Reviews & ratings
- Action buttons

**Component:** `ProductModal.tsx`, `VariantForm.tsx`

**Usage Example:**
```typescript
import { useProductStore } from '@/store/productStore';

const AddProduct = () => {
  const { addProduct, uploadProductImages } = useProductStore();
  
  const handleSubmit = async (formData) => {
    try {
      const productData = {
        vendorId: vendor._id,
        name: formData.name,
        description: formData.description,
        categories: formData.categories,
        variants: [
          {
            title: 'Red - Medium',
            attributes: { size: 'M', color: 'Red' },
            price: 2500,
            mrp: 3000,
            stock: 10
          }
        ],
        status: 'draft',
        isFeatured: false
      };
      
      const newProduct = await addProduct(productData);
      
      // Upload images
      if (newProduct && images.length > 0) {
        await uploadProductImages(newProduct._id, images);
      }
      
      toast.success('Product created successfully');
      router.push('/product');
    } catch (error) {
      toast.error('Failed to create product');
    }
  };
  
  return <ProductForm onSubmit={handleSubmit} />;
};
```

---

### 8.4 Image Management

**Component:** `ImageUpload.tsx`

**Features:**
- Drag & drop upload
- Multiple file selection
- Image preview
- Progress indicator
- Delete uploaded images
- Image compression
- Supported formats: JPG, PNG, WebP
- Max file size: 5MB per image

**S3 Integration:**
- Images uploaded to AWS S3
- Bucket: `chihili-bucket`
- Region: `ap-south-1`
- CDN URL returned

**Usage:**
```typescript
<ImageUpload
  multiple={true}
  maxFiles={10}
  onUpload={(urls) => setProductImages(urls)}
  existingImages={product?.images}
  onDelete={(url) => handleDeleteImage(url)}
/>
```

---

### 8.5 Vendor Onboarding

**Location:** `app/vendorsOnboard/`

**Flow:**

**Step 1: Business Information**
- Shop name (required)
- Business description
- Business category

**Step 2: Address**
- Street address
- City, State
- Postal code
- Country

**Step 3: Documents**
- GST Number
- GST Certificate (PDF/Image)
- PAN Number
- PAN Card (PDF/Image)

**Step 4: Bank Details**
- Account holder name
- Account number
- IFSC code
- Bank name

**Step 5: Review & Submit**
- Review all information
- Terms & conditions
- Submit for approval

**After Submission:**
- Status: Pending
- Email notification sent
- Wait for admin approval
- Approval notification
- Access granted to dashboard

**API Call:**
```typescript
const handleOnboarding = async (formData) => {
  try {
    const vendorPayload = {
      shopName: formData.shopName,
      description: formData.description,
      address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country
      },
      documents: {
        gstNumber: formData.gstNumber,
        gstFile: uploadedGstUrl,
        panNumber: formData.panNumber,
        panFile: uploadedPanUrl
      },
      bankDetails: {
        accountName: formData.accountName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode,
        bankName: formData.bankName
      }
    };
    
    await createVendor(vendorPayload);
    toast.success('Application submitted successfully');
    router.push('/home');
  } catch (error) {
    toast.error('Submission failed');
  }
};
```

---

### 8.6 Export Functionality

**Library:** XLSX (0.18.5)

**Features:**
- Export product list to Excel
- Export category list to Excel
- Custom column selection
- Date formatting
- Auto-fit columns

**Implementation:**
```typescript
import * as XLSX from 'xlsx';

const exportToExcel = (data: Product[], filename: string) => {
  // Prepare data
  const exportData = data.map(product => ({
    'Product ID': product._id,
    'Name': product.name,
    'Status': product.status,
    'Price': product.variants[0]?.price,
    'Stock': product.variants[0]?.stock,
    'Created': new Date(product.createdAt).toLocaleDateString()
  }));
  
  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(exportData);
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Products');
  
  // Save file
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

// Usage
<button onClick={() => exportToExcel(products, 'products-export')}>
  Export to Excel
</button>
```

---

## 9. Admin Dashboard

### Dashboard Layout

**File:** `app/(dashboard)/layout.tsx`

**Structure:**
```tsx
<div className="flex h-screen">
  {/* Sidebar */}
  <aside className={collapsed ? 'w-20' : 'w-64'}>
    <Menu collapsed={collapsed} />
  </aside>
  
  {/* Main Content */}
  <div className="flex-1 flex flex-col">
    <Navbar />
    <main className="flex-1 overflow-auto p-6">
      {children}
    </main>
  </div>
</div>
```

**Features:**
1. Collapsible sidebar
2. Sticky navbar
3. Responsive layout
4. Scroll container
5. Route-based active states

---

### Sidebar Navigation

**Component:** `Menu.tsx`

**Menu Items:**
```typescript
const adminMenuItems = [
  {
    label: 'Dashboard',
    href: '/home',
    icon: <HomeIcon />,
    color: 'from-primary1 to-primary1'
  },
  {
    label: 'Category',
    href: '/category',
    icon: <TagIcon />,
    color: 'from-primary1 to-primary1'
  },
  {
    label: 'Products',
    href: '/product',
    icon: <CubeIcon />,
    color: 'from-primary1 to-primary1'
  }
];
```

**Features:**
- Icon + label
- Active state highlighting
- Gradient backgrounds
- Hover effects
- Tooltip on collapsed state
- Smooth transitions

---

### Top Navbar

**Component:** `Navbar.tsx`

**Features:**
1. **User Profile Dropdown:**
   - User name and email
   - Vendor information
   - Profile link
   - Logout button

2. **Notifications:**
   - Notification bell
   - Unread count badge
   - Notification dropdown

3. **Quick Actions:**
   - Add product
   - Add category
   - Settings

**User Menu:**
```tsx
<div className="dropdown">
  <Avatar src={user.avatar} />
  <div className="menu">
    <div className="user-info">
      <p>{user.name}</p>
      <p>{user.email}</p>
    </div>
    {vendor && (
      <div className="vendor-info">
        <p>{vendor.shopName}</p>
        <Badge>{vendor.status}</Badge>
      </div>
    )}
    <Divider />
    <MenuItem onClick={() => router.push('/profile')}>
      Profile
    </MenuItem>
    <MenuItem onClick={handleLogout}>
      Logout
    </MenuItem>
  </div>
</div>
```

---

## 10. Vendor Management

### Vendor Status Workflow

```
Registration → Pending → Approved → Active
                    ↓
                 Rejected
                    ↓
              Can resubmit
```

**Status Types:**
- **Pending** - Awaiting admin approval
- **Approved** - Approved, can access dashboard
- **Rejected** - Application rejected
- **Suspended** - Temporarily suspended

### Vendor Permissions

**Approved Vendors Can:**
- ✅ View dashboard
- ✅ Add/edit/delete their products
- ✅ Manage product variants
- ✅ Upload product images
- ✅ View sales reports
- ✅ Update shop information

**Vendors Cannot:**
- ❌ Manage categories
- ❌ View other vendors' products
- ❌ Access admin settings
- ❌ Approve other vendors

---

## 11. Product Management

### Product Status Workflow

```
Draft → Active → Inactive
   ↓              ↓
Archived ← ← ← ← ←
```

**Status Definitions:**
- **Draft** - Work in progress, not visible to customers
- **Active** - Live on storefront, available for purchase
- **Inactive** - Temporarily hidden from storefront
- **Archived** - Removed from active catalog, kept for records

### Variant Management

**SKU Generation:**
```typescript
// Auto-generated SKU format
SKU: PROD-{productId}-VAR-{index}
Example: PROD-12345-VAR-001
```

**Variant Rules:**
- Minimum 1 variant required
- Unique SKU per variant
- Price required for each variant
- Stock tracking per variant
- Variant-specific images optional

**Stock Updates:**
```typescript
const updateStock = async (productId: string, updates: StockUpdate[]) => {
  await updateProductStock(productId, [
    { sku: 'PROD-12345-VAR-001', stock: 50 },
    { sku: 'PROD-12345-VAR-002', stock: 30 }
  ]);
};
```

---

## 12. Category Management

### Hierarchical Structure

**Category Levels:**
```
Root Categories (parent = null)
    ├── Subcategory Level 1
    │   ├── Subcategory Level 2
    │   │   └── Subcategory Level 3
    │   └── Subcategory Level 2
    └── Subcategory Level 1
```

**Example:**
```
Women Wear (root)
    ├── Sarees
    │   ├── Silk Sarees
    │   ├── Cotton Sarees
    │   └── Designer Sarees
    ├── Salwar Kameez
    └── Lehengas
```

### Category Features

**1. Slug Auto-generation:**
```typescript
// Name: "Women Wear"
// Slug: "women-wear"
```

**2. Image Types:**
- **Image** - Thumbnail/icon (200x200)
- **Banner** - Header banner (1200x400)

**3. Active/Inactive:**
- Inactive categories hidden from frontend
- Products remain associated
- Can be reactivated

---

## 13. UI Components

### Shadcn UI Components

**Location:** `src/components/ui/`

#### 1. Button (`button.tsx`)

```typescript
import { Button } from '@/components/ui/button';

<Button variant="default" size="md">
  Click Me
</Button>

// Variants: default, destructive, outline, secondary, ghost, link
// Sizes: default, sm, lg, icon
```

---

#### 2. Input (`input.tsx`)

```typescript
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

<div>
  <Label htmlFor="name">Name</Label>
  <Input id="name" placeholder="Enter name" />
</div>
```

---

#### 3. Select (`select.tsx`)

```typescript
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

<Select onValueChange={(value) => setSelected(value)}>
  <SelectTrigger>
    <SelectValue placeholder="Select category" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Category 1</SelectItem>
    <SelectItem value="2">Category 2</SelectItem>
  </SelectContent>
</Select>
```

---

#### 4. Card (`card.tsx`)

```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

---

#### 5. Toast (Sonner)

```typescript
import { toast } from 'sonner';

// Success
toast.success('Product created successfully');

// Error
toast.error('Failed to save changes');

// Info
toast.info('Data is loading...');

// Warning
toast.warning('Stock is low');

// Custom
toast.custom((t) => (
  <div>Custom toast content</div>
));
```

---

#### 6. Badge (`badge.tsx`)

```typescript
import { Badge } from '@/components/ui/badge';

<Badge variant="default">Active</Badge>
<Badge variant="destructive">Inactive</Badge>
<Badge variant="outline">Draft</Badge>
<Badge variant="secondary">Pending</Badge>
```

---

#### 7. Tabs (`tabs.tsx`)

```typescript
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

<Tabs defaultValue="details">
  <TabsList>
    <TabsTrigger value="details">Details</TabsTrigger>
    <TabsTrigger value="variants">Variants</TabsTrigger>
    <TabsTrigger value="images">Images</TabsTrigger>
  </TabsList>
  <TabsContent value="details">
    <ProductDetails />
  </TabsContent>
  <TabsContent value="variants">
    <VariantForm />
  </TabsContent>
  <TabsContent value="images">
    <ImageUpload />
  </TabsContent>
</Tabs>
```

---

### Custom Components

#### 8. ImageUpload (`ImageUpload.tsx`)

```typescript
<ImageUpload
  multiple={true}
  maxFiles={10}
  accept="image/*"
  onUpload={(urls: string[]) => setImages(urls)}
  existingImages={product?.images}
  onDelete={(url: string) => handleDelete(url)}
/>
```

**Features:**
- Drag & drop
- File size validation
- Format validation
- Preview thumbnails
- Delete existing images

---

#### 9. CategoryModal (`CategoryModal.tsx`)

```typescript
<CategoryModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  category={selectedCategory}  // For edit mode
  onSuccess={() => {
    fetchCategories();
    setIsOpen(false);
  }}
/>
```

**Modes:**
- Create (category = null)
- Edit (category provided)

---

#### 10. ProductModal (`ProductModal.tsx`)

```typescript
<ProductModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  product={selectedProduct}  // For edit mode
  onSuccess={() => {
    fetchProducts();
    setIsOpen(false);
  }}
/>
```

**Features:**
- Multi-step form
- Variant management
- Image upload
- Validation

---

#### 11. DeleteConfirmationModal

```typescript
<DeleteConfirmationModal
  isOpen={showDelete}
  onClose={() => setShowDelete(false)}
  onConfirm={async () => {
    await removeProduct(productId);
    setShowDelete(false);
  }}
  title="Delete Product"
  message="Are you sure you want to delete this product? This action cannot be undone."
  confirmText="Delete"
  cancelText="Cancel"
/>
```

---

## 14. Styling & Theming

### Tailwind Configuration

**File:** `tailwind.config.ts`

```typescript
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#CB0342",      // Brand red
        primary1: "#830A0C",     // Dark red
        primary2: "#540608",     // Darker red
        secondary: "#FAF8F0",    // Cream
        secondary1: "#F0EAD2",   // Light cream
      },
    },
  },
  plugins: [],
};
```

### Color Palette

```css
/* Primary Colors */
--primary: #CB0342;      /* Main brand color */
--primary1: #830A0C;     /* Darker shade */
--primary2: #540608;     /* Darkest shade */

/* Secondary Colors */
--secondary: #FAF8F0;    /* Light background */
--secondary1: #F0EAD2;   /* Cream */

/* Usage */
bg-primary text-white    /* Red background, white text */
bg-primary1 hover:bg-primary2  /* Darker on hover */
bg-secondary text-gray-800     /* Light background */
```

### Typography

```typescript
// Google Fonts
- Geist Sans (--font-geist-sans)
- Geist Mono (--font-geist-mono)

// Usage
<h1 className="font-sans text-4xl font-bold">
<code className="font-mono text-sm">
```

### Responsive Design

```css
/* Breakpoints */
sm: 640px   /* Tablet */
md: 768px   /* Tablet landscape */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */

/* Example */
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  /* Responsive grid */
</div>
```

---

## 15. Configuration

### Environment Variables

**File:** `.env.local` or `src/.env`

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://chihili-backend.onrender.com/api

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDvqX5d_Mt813_qjJVEVVhaWkizIl100Vw
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=chihili-92f01.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=chihili-92f01
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=chihili-92f01.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=870392136127
NEXT_PUBLIC_FIREBASE_APP_ID=1:870392136127:web:5aed50bdc60efe6199210a
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-CT4NL0X1W2

# AWS S3 (if needed)
NEXT_PUBLIC_S3_BUCKET=chihili-bucket
NEXT_PUBLIC_S3_REGION=ap-south-1
```

### Next.js Configuration

**File:** `next.config.ts`

```typescript
const nextConfig: NextConfig = {
  // Ignore ESLint errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Image domains
  images: {
    domains: [
      'chihili-bucket.s3.ap-south-1.amazonaws.com',
      'cdn.example.com'
    ],
  },
};
```

---

## 16. Development Guide

### Getting Started

```bash
# 1. Clone repository
git clone https://github.com/your-org/chihil-admin.git

# 2. Navigate to project
cd chihil-admin

# 3. Install dependencies
npm install

# 4. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# 5. Run development server
npm run dev

# Server runs on http://localhost:3000
```

### Development Commands

```bash
# Development
npm run dev              # Start with Turbopack
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
```

### Code Structure Guidelines

**1. Component Creation:**
```typescript
// components/MyComponent.tsx
'use client';

import React from 'react';

interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

export default function MyComponent({ title, onAction }: MyComponentProps) {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      {onAction && (
        <button onClick={onAction}>Action</button>
      )}
    </div>
  );
}
```

**2. Store Pattern:**
```typescript
// store/myStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MyState {
  data: any[];
  loading: boolean;
  fetchData: () => Promise<void>;
}

export const useMyStore = create<MyState>()(
  persist(
    (set) => ({
      data: [],
      loading: false,
      fetchData: async () => {
        set({ loading: true });
        // API call
        set({ data: result, loading: false });
      },
    }),
    { name: 'my-storage' }
  )
);
```

---

## 17. Build & Deployment

### Production Build

```bash
# Build for production
npm run build

# Output: .next/ directory

# Start production server
npm run start
```

### Deployment Options

#### 1. Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production
vercel --prod
```

#### 2. Docker

**Dockerfile:**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t chihil-admin .
docker run -p 3000:3000 chihil-admin
```

---

## 18. Best Practices

### Code Quality

1. **TypeScript Strict Mode**
   - Define interfaces for all data
   - Avoid `any` type
   - Use proper type annotations

2. **Component Organization**
   - Small, focused components
   - Extract reusable logic
   - Use composition

3. **State Management**
   - Global state in Zustand
   - Local state for UI only
   - Avoid prop drilling

4. **Performance**
   - Lazy load heavy components
   - Memoize expensive computations
   - Optimize images

### Security

1. **Authentication**
   - Secure token storage
   - Automatic token refresh
   - Role-based access

2. **API Security**
   - Validate all inputs
   - Sanitize user data
   - Use environment variables

3. **File Uploads**
   - Validate file types
   - Limit file sizes
   - Scan for malware

---

## 19. Troubleshooting

### Common Issues

**1. Build Errors:**
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

**2. Token Refresh Fails:**
```typescript
// Check axios interceptor
// Verify refresh endpoint
// Check cookie settings
```

**3. Images Not Loading:**
```typescript
// Add domain to next.config.ts
images: {
  domains: ['your-cdn.com'],
}
```

**4. State Not Persisting:**
```typescript
// Check localStorage
// Verify persist configuration
// Clear browser storage
```

---

## Appendix

### A. API Response Format

```typescript
interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}
```

### B. Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + S` | Save form |
| `Esc` | Close modal |
| `Ctrl/Cmd + K` | Search |

### C. Browser Support

| Browser | Version |
|---------|---------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

---

## Changelog

### Version 0.1.0 (Current)

**Added:**
- Admin dashboard
- Vendor portal
- Product management
- Category management
- Image upload
- Excel export
- Authentication with Firebase

**In Progress:**
- Order management
- User management
- Analytics dashboard

**Planned:**
- Inventory tracking
- Reporting
- Multi-language support

---

## Contributors

- **Lead Developer:** [Name]
- **Backend Team:** [Names]
- **UI/UX Designer:** [Name]

---

## License

© 2025 Chihili. All rights reserved.

---

**Document Version:** 1.0  
**Last Updated:** October 17, 2025  
**Maintained By:** Chihili Development Team

For support, contact: admin@chihili.com

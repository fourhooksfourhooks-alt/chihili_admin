import instance from "./axiosInstance";


// Vendor onboarding
export interface VendorPayload {
  shopName: string;
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  documents: {
    gstNumber: string;
    gstFile: string;
    panNumber: string;
    panFile: string;
  };
  bankDetails: {
    accountName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
}

export const createVendor = async (payload: VendorPayload) => {
  return instance.post("/vendors", payload);
};

// Current user's vendor details
export interface Vendor {
  _id: string;
  userId: string;
  shopName: string;
  description?: string;
  address?: Record<string, any> | null;
  documents?: Record<string, any> | null;
  bankDetails?: Record<string, any> | null;
  status: string;
  ratingAvg?: number;
  ratingCount?: number;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

interface GetMyVendorResponse {
  statusCode: number;
  data: { vendor: Vendor | null };
  message: string;
  success: boolean;
}

export const getMyVendor = async (): Promise<Vendor | null> => {
  const res = await instance.get("/vendors/me");
  const data = res.data as GetMyVendorResponse;
  return data?.data?.vendor ?? null;
};

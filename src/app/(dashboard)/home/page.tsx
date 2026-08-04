"use client";
import React, { useEffect, useState } from "react";
import BlockingModal from "@/components/BlockingModal";
import { useAuthStore } from "@/store/authStore";
import {
  ShoppingBag,
  Star,
  TrendingUp,
  Package,
  Users,
  Calendar,
  MapPin,
  CreditCard,
  FileText,
} from "lucide-react";

const HomePage = () => {
  const user = useAuthStore((s) => s.user);
  const vendor = useAuthStore((s) => s.vendor);
  const vendorLoading = useAuthStore((s) => s.vendorLoading);
  const fetchVendor = useAuthStore((s) => s.fetchVendor);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch vendor when user changes
  useEffect(() => {
    if (user) {
      fetchVendor();
    }
  }, [user, fetchVendor]);

  // Open modal only if vendor belongs to current user and status is accepted
  useEffect(() => {
    if (!user) {
      setIsModalOpen(false);
      return;
    }
    if (vendorLoading) {
      setIsModalOpen(false);
      return;
    }
    const authId = user._id;
    const vendorUserId = vendor?.userId;
    if (vendorUserId && vendorUserId === authId) {
      const status = String(vendor?.status || "").toLowerCase();
      // Hide when pending; show when accepted (also treat approved as accepted)
      if (status === "pending") {
        setIsModalOpen(true);
      } else if (status === "accepted" || status === "approved") {
        setIsModalOpen(false);
      } else {
        setIsModalOpen(true);
      }
    } else {
      setIsModalOpen(false);
    }
  }, [user?._id, vendor?.userId, vendor?.status, vendorLoading]);

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <div className="p-6 ">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#540608] mb-2">
            Welcome to Your Vendor Dashboard
          </h1>
          <p className="text-[#830A0C] text-lg">
            Manage your shop and track your business performance
          </p>
        </div>

        {vendorLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mx-auto mb-4"></div>
              <div className="text-gray-600 text-lg">
                Loading vendor information...
              </div>
            </div>
          </div>
        ) : vendor ? (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">
                      Shop Rating
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {vendor.ratingAvg || 0}/5
                    </p>
                    <p className="text-gray-400 text-sm">
                      {vendor.ratingCount || 0} reviews
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Star className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Status</p>
                    <p className="text-2xl font-bold text-gray-800 capitalize">
                      {vendor.status}
                    </p>
                    <p className="text-gray-400 text-sm">Application status</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">
                      Products
                    </p>
                    <p className="text-2xl font-bold text-gray-800">0</p>
                    <p className="text-gray-400 text-sm">Total listed</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <Package className="h-6 w-6 text-yellow-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Orders</p>
                    <p className="text-2xl font-bold text-gray-800">0</p>
                    <p className="text-gray-400 text-sm">This month</p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-full">
                    <ShoppingBag className="h-6 w-6 text-red-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Shop Information Card */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="bg-[#CB0342] p-3 rounded-full mr-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#540608]">
                  Shop Information
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Shop Name
                    </label>
                    <div className="bg-white border border-gray-200 rounded-lg p-3 text-gray-800">
                      {vendor.shopName}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Description
                    </label>
                    <div className="bg-white border border-gray-200 rounded-lg p-3 text-gray-800 min-h-[100px]">
                      {vendor.description}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-[#F0EAD2] rounded-lg p-4">
                    <h4 className="font-semibold text-[#540608] mb-3 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Registration Details
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-[#830A0C]">Created:</span>
                        <span className="text-[#540608] block mt-1">
                          {formatDate(vendor.createdAt)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#830A0C]">Updated:</span>
                        <span className="text-[#540608] block mt-1">
                          {formatDate(vendor.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`rounded-lg p-4 ${
                      vendor.status.toLowerCase() === "accepted" ||
                      vendor.status.toLowerCase() === "approved"
                        ? "bg-green-100 border border-green-200"
                        : vendor.status.toLowerCase() === "pending"
                        ? "bg-yellow-100 border border-yellow-200"
                        : "bg-red-100 border border-red-200"
                    }`}
                  >
                    <h4 className="font-semibold text-[#540608] mb-2">
                      Application Status
                    </h4>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        vendor.status.toLowerCase() === "accepted" ||
                        vendor.status.toLowerCase() === "approved"
                          ? "bg-green-200 text-green-800"
                          : vendor.status.toLowerCase() === "pending"
                          ? "bg-yellow-200 text-yellow-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {vendor.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Address & Contact */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="bg-[#830A0C] p-3 rounded-full mr-4">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#540608]">
                  Address & Location
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Street Address
                  </label>
                  <div className="bg-white border border-gray-200 rounded-lg p-3 text-gray-800">
                    {vendor?.address?.street || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    City
                  </label>
                  <div className="bg-white border border-gray-200 rounded-lg p-3 text-gray-800">
                    {vendor?.address?.city || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    State
                  </label>
                  <div className="bg-white border border-gray-200 rounded-lg p-3 text-gray-800">
                    {vendor?.address?.state || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Postal Code
                  </label>
                  <div className="bg-white border border-gray-200 rounded-lg p-3 text-gray-800">
                    {vendor?.address?.postalCode || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Country
                  </label>
                  <div className="bg-white border border-gray-200 rounded-lg p-3 text-gray-800">
                    {vendor?.address?.country || "N/A"}
                  </div>
                </div>
              </div>
            </div>

            {/* Banking & Documents */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Bank Details */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <div className="bg-[#AA073A] p-3 rounded-full mr-4">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-[#540608]">
                    Bank Details
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Account Name
                    </label>
                    <div className="bg-white border border-gray-200 rounded-lg p-3 text-gray-800">
                      {vendor?.bankDetails?.accountName || "N/A"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Account Number
                    </label>
                    <div className="bg-white border border-gray-200 rounded-lg p-3 text-gray-800 font-mono">
                      {vendor?.bankDetails?.accountNumber || "N/A"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      IFSC Code
                    </label>
                    <div className="bg-white border border-gray-200 rounded-lg p-3 text-gray-800 font-mono">
                      {vendor?.bankDetails?.ifscCode || "N/A"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Bank Name
                    </label>
                    <div className="bg-white border border-gray-200 rounded-lg p-3 text-gray-800">
                      {vendor?.bankDetails?.bankName || "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="bg-white rounded-xl shadow-lg p-8 lg:mt-8 mt-6">
                <div className="flex items-center mb-6">
                  <div className="bg-[#540608] p-3 rounded-full mr-4">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-[#540608]">
                    Documents
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      GST Number
                    </label>
                    <div className="bg-white border border-gray-200 rounded-lg p-3 text-gray-800 font-mono">
                      {vendor?.documents?.gstNumber || "N/A"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      GST Document
                    </label>
                    <div className="bg-white border border-gray-200 rounded-lg p-3 text-gray-800">
                      {vendor?.documents?.gstFile ? (
                        <a
                          href={vendor.documents.gstFile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View Document
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      PAN Number
                    </label>
                    <div className="bg-white border border-gray-200 rounded-lg p-3 text-gray-800 font-mono">
                      {vendor?.documents?.panNumber || "N/A"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      PAN Document
                    </label>
                    <div className="bg-white border border-gray-200 rounded-lg p-3 text-gray-800">
                      {vendor?.documents?.panFile ? (
                        <a
                          href={vendor.documents.panFile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View Document
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="bg-[#F0EAD2] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="h-10 w-10 text-[#CB0342]" />
            </div>
            <h3 className="text-2xl font-bold text-[#540608] mb-4">
              No Vendor Profile Found
            </h3>
            <p className="text-[#830A0C] mb-6">
              Complete your vendor registration to access the dashboard and
              start selling.
            </p>
            <button className="bg-[#CB0342] hover:bg-[#830A0C] text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              Complete Registration
            </button>
          </div>
        )}
      </div>

      <BlockingModal
        isOpen={isModalOpen}
        title="Vendor Application Pending"
        message={
          "Your vendor application is pending admin approval. You will be notified once approved to access the vendor panel."
        }
        type="info"
      />
    </>
  );
};

export default HomePage;

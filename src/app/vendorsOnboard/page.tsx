"use client";
import React, { useState } from "react";
import { AlertCircle, Building2, FileText, CreditCard, MapPin, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { createVendor, type VendorPayload } from "@/api/vendor.auth";

export default function VendorOnboardPage() {
  const router = useRouter();
  const [form, setForm] = useState<VendorPayload>({
    shopName: "",
    description: "",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
    documents: {
      gstNumber: "",
      gstFile: "",
      panNumber: "",
      panFile: "",
    },
    bankDetails: {
      accountName: "",
      accountNumber: "",
      ifscCode: "",
      bankName: "",
    },
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isAuthenticated] = useState(true); // Mock authenticated state

  const steps = [
    { id: 1, name: "Business Info", icon: Building2 },
    { id: 2, name: "Address", icon: MapPin },
    { id: 3, name: "Documents", icon: FileText },
    { id: 4, name: "Bank Details", icon: CreditCard },
  ];

  const updateField = (path: string, value: string) => {
    setForm((prev) => {
      const copy = { ...prev } as any;
      const keys = path.split(".");
      let cursor = copy;
      for (let i = 0; i < keys.length - 1; i += 1) {
        cursor[keys[i]] = { ...cursor[keys[i]] };
        cursor = cursor[keys[i]];
      }
      cursor[keys[keys.length - 1]] = value;
      return copy as VendorPayload;
    });
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    
    try {
      const res = await createVendor(form);
      if (res.status === 201 || res.status === 200) {
        router.push("/home");
      } else {
        setError((res as any).data?.message || "Failed to onboard vendor");
      }
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { message?: string } } };
      setError(anyErr?.response?.data?.message || "Error onboarding vendor");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return form.shopName;
      case 2:
        return form.address.street && form.address.city && form.address.country;
      case 3:
        return form.documents.gstNumber || form.documents.panNumber;
      case 4:
        return form.bankDetails.accountName && form.bankDetails.accountNumber;
      default:
        return true;
    }
  };

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary1 rounded-full mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-primary1 mb-2">
            Vendor Onboarding
          </h1>
          <p className="text-gray-600">Join our marketplace and start selling your products</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      currentStep >= step.id
                        ? "bg-primary1 text-white shadow-lg"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    <step.icon className="w-6 h-6" />
                  </div>
                  <span className={`mt-2 text-sm font-medium ${
                    currentStep >= step.id ? "text-primary1" : "text-gray-500"
                  }`}>
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-1 w-16 rounded transition-all duration-300 ${
                    currentStep > step.id ? "bg-primary1" : "bg-gray-200"
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm ">
          {/* Authentication Warning */}
          {!isAuthenticated && (
            <div className="bg-red-50 border-l-4 border-primary1 p-4 m-6 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                <span className="text-primary1 font-medium">You are not logged in. Please log in to continue.</span>
              </div>
            </div>
          )}

          {/* Status Messages */}
          {error && (
            <div className="bg-red-50 border-l-4 border-primary1 p-4 m-6 rounded-lg animate-pulse">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Success handled by modal */}

          <div className="p-8">
            {/* Step 1: Business Information */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <div className="flex items-center mb-6">
                  <Building2 className="w-6 h-6 text-primary1 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">Business Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Shop Name *</label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary1 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                      value={form.shopName}
                      onChange={(e) => updateField("shopName", e.target.value)}
                      placeholder="Enter your shop name"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Business Description</label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary1 focus:border-transparent transition-all duration-200 hover:border-gray-400 resize-none"
                    rows={4}
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="Tell us about your business..."
                  />
                </div>
              </div>
            )}

            {/* Step 2: Address */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <div className="flex items-center mb-6">
                  <MapPin className="w-6 h-6 text-primary1 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">Business Address</h2>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Street Address *</label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary1 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                      value={form.address.street}
                      onChange={(e) => updateField("address.street", e.target.value)}
                      placeholder="123 Main Street"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">City *</label>
                      <input
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary1 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                        value={form.address.city}
                        onChange={(e) => updateField("address.city", e.target.value)}
                        placeholder="City name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">State/Province</label>
                      <input
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary1 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                        value={form.address.state}
                        onChange={(e) => updateField("address.state", e.target.value)}
                        placeholder="State/Province"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Postal Code</label>
                      <input
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary1 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                        value={form.address.postalCode}
                        onChange={(e) => updateField("address.postalCode", e.target.value)}
                        placeholder="12345"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Country *</label>
                      <input
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary1 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                        value={form.address.country}
                        onChange={(e) => updateField("address.country", e.target.value)}
                        placeholder="Country"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Documents */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <div className="flex items-center mb-6">
                  <FileText className="w-6 h-6 text-primary1 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">Business Documents</h2>
                </div>

                <div className="bg-primary1/10 border border-primary1 rounded-xl p-4 mb-6">
                  <div className="flex items-start">
                    <FileText className="w-5 h-5 text-primary1 mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-primary1">Document Requirements</h3>
                      <p className="text-sm text-primary1 mt-1">Please provide at least one of the following documents for verification.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 p-6 border border-gray-200 rounded-xl hover:border-primary1 transition-colors">
                    <h3 className="font-semibold text-gray-900">GST Information</h3>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">GST Number</label>
                      <input
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary1 focus:border-transparent transition-all duration-200"
                        value={form.documents.gstNumber}
                        onChange={(e) => updateField("documents.gstNumber", e.target.value)}
                        placeholder="22AAAAA0000A1Z5"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">GST Certificate URL</label>
                      <input
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary1 focus:border-transparent transition-all duration-200"
                        value={form.documents.gstFile}
                        onChange={(e) => updateField("documents.gstFile", e.target.value)}
                        placeholder="https://example.com/gst-certificate.pdf"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 p-6 border border-gray-200 rounded-xl hover:border-primary1 transition-colors">
                    <h3 className="font-semibold text-gray-900">PAN Information</h3>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">PAN Number</label>
                      <input
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary1 focus:border-transparent transition-all duration-200"
                        value={form.documents.panNumber}
                        onChange={(e) => updateField("documents.panNumber", e.target.value)}
                        placeholder="ABCDE1234F"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">PAN Card URL</label>
                      <input
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary1 focus:border-transparent transition-all duration-200"
                        value={form.documents.panFile}
                        onChange={(e) => updateField("documents.panFile", e.target.value)}
                        placeholder="https://example.com/pan-card.pdf"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Bank Details */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <div className="flex items-center mb-6">
                  <CreditCard className="w-6 h-6 text-primary1 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">Bank Account Details</h2>
                </div>

                <div className="bg-primary1/10 border border-primary1 rounded-xl p-4 mb-6">
                  <div className="flex items-start">
                    <Lock className="w-5 h-5 text-primary1 mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-primary1">Secure Information</h3>
                      <p className="text-sm text-primary1 mt-1">Your banking information is encrypted and secure. This is used for payment processing.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Account Holder Name *</label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary1 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                      value={form.bankDetails.accountName}
                      onChange={(e) => updateField("bankDetails.accountName", e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Account Number *</label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary1 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                      value={form.bankDetails.accountNumber}
                      onChange={(e) => updateField("bankDetails.accountNumber", e.target.value)}
                      placeholder="1234567890"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">IFSC Code</label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary1 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                      value={form.bankDetails.ifscCode}
                      onChange={(e) => updateField("bankDetails.ifscCode", e.target.value)}
                      placeholder="SBIN0001234"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Bank Name</label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary1 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                      value={form.bankDetails.bankName}
                      onChange={(e) => updateField("bankDetails.bankName", e.target.value)}
                      placeholder="State Bank of India"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-8 border-t border-gray-200 mt-8">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Previous
              </button>

              <div className="flex space-x-3">
                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!canProceed()}
                    className="flex items-center px-8 py-3 bg-primary1 text-white rounded-xl font-medium hover:from-primary hover:to-primary1 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (currentStep === 4 && canProceed()) {
                        handleSubmit();
                      }
                    }}
                    disabled={loading || !isAuthenticated || !canProceed()}
                    className="flex items-center px-8 py-3 bg-primary1 text-white rounded-xl font-medium hover:from-primary hover:to-primary1 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      "Submit Application"
                    )}
                  </button>
                )}

                <button
                  type="button"
                  className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200"
                  onClick={() => console.log("Cancel clicked")}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600">
          <p className="text-sm">
            Need help? Contact our support team at{" "}
            <a href="mailto:support@example.com" className="text-primary1 hover:underline">
              support@example.com
            </a>
          </p>
        </div>
      </div>
    </div>
    
    </>
  );
}
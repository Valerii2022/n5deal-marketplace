"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import SellerSidebar from "@/components/seller/SellerSidebar";
import { AssetType } from "@/types";

export default function NewListingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assetType: "",
    industry: "",
    location: "",
    askingPrice: "",
    revenue: "",
    ebitda: "",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const authRes = await fetch("/api/auth/me");
      if (!authRes.ok) {
        router.push("/login");
        return;
      }

      const authData = await authRes.json();
      if (authData.role !== "SELLER") {
        setError("Access denied. Seller role required.");
        setLoading(false);
        return;
      }

      setLoading(false);
    } catch (err) {
      setError("Failed to verify authentication");
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const payload: any = {
        title: formData.title,
        description: formData.description,
        assetType: formData.assetType,
        industry: formData.industry,
        location: formData.location,
        askingPrice: parseFloat(formData.askingPrice),
      };

      if (formData.revenue) {
        payload.revenue = parseFloat(formData.revenue);
      }

      if (formData.ebitda) {
        payload.ebitda = parseFloat(formData.ebitda);
      }

      const response = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/marketplace/${data.data.id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to create listing");
        setSaving(false);
      }
    } catch (err) {
      setError("Failed to create listing");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="text-sm text-slate-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          <SellerSidebar />

          <div className="flex-1">
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <h1 className="mb-6 text-2xl font-bold text-slate-900">
                Create New Listing
              </h1>

              {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    placeholder="e.g., Profitable SaaS Platform"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                    rows={6}
                    placeholder="Provide a detailed description of the asset..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Asset Type */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Asset Type *
                  </label>
                  <select
                    value={formData.assetType}
                    onChange={(e) =>
                      setFormData({ ...formData, assetType: e.target.value })
                    }
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select type</option>
                    <option value={AssetType.BUSINESS}>Business</option>
                    <option value={AssetType.REAL_ESTATE}>Real Estate</option>
                    <option value={AssetType.EQUITY}>Equity</option>
                    <option value={AssetType.OTHER}>Other</option>
                  </select>
                </div>

                {/* Industry */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Industry *
                  </label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) =>
                      setFormData({ ...formData, industry: e.target.value })
                    }
                    required
                    placeholder="e.g., Technology"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    required
                    placeholder="e.g., San Francisco, CA"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Asking Price */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Asking Price *
                  </label>
                  <input
                    type="number"
                    value={formData.askingPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, askingPrice: e.target.value })
                    }
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Revenue (Optional) */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Annual Revenue (Optional)
                  </label>
                  <input
                    type="number"
                    value={formData.revenue}
                    onChange={(e) =>
                      setFormData({ ...formData, revenue: e.target.value })
                    }
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* EBITDA (Optional) */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    EBITDA (Optional)
                  </label>
                  <input
                    type="number"
                    value={formData.ebitda}
                    onChange={(e) =>
                      setFormData({ ...formData, ebitda: e.target.value })
                    }
                    step="0.01"
                    placeholder="0.00"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Submit */}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? "Creating..." : "Create Listing"}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/seller/listings")}
                    className="rounded-lg border border-slate-300 px-6 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-50"
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
}

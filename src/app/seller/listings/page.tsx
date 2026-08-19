"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import SellerSidebar from "@/components/seller/SellerSidebar";
import { formatCurrency } from "@/lib/format";

interface Asset {
  _id: string;
  title: string;
  description: string;
  assetType: string;
  industry: string;
  location: string;
  askingPrice: number;
  revenue?: number;
  ebitda?: number;
  status: string;
  sellerId: {
    _id: string;
    name: string;
    email: string;
    company?: string;
    location?: string;
  };
  createdAt: string;
}

export default function SellerListingsPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [sellerId, setSellerId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
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

      setSellerId(authData.id);

      // Fetch all assets - API doesn't support sellerId filter
      // So we fetch with a high limit and filter client-side
      const assetsRes = await fetch("/api/assets?limit=50");
      if (assetsRes.ok) {
        const assetsData = await assetsRes.json();
        // Filter to only show current seller's assets
        const sellerAssets = (assetsData.data || []).filter(
          (asset: Asset) => asset.sellerId._id === authData.id
        );
        setAssets(sellerAssets);
      }

      setLoading(false);
    } catch (err) {
      setError("Failed to load listings");
      setLoading(false);
    }
  };

  const handleDelete = async (assetId: string) => {
    if (!confirm("Are you sure you want to suspend this listing?")) {
      return;
    }

    try {
      const response = await fetch(`/api/assets/${assetId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Reload listings
        loadListings();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to suspend listing");
      }
    } catch (err) {
      alert("Failed to suspend listing");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="text-sm text-slate-600">Loading listings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-slate-900">My Listings</h1>
              <Link
                href="/seller/listings/new"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Add Listing
              </Link>
            </div>

            {assets.length > 0 ? (
              <div className="space-y-4">
                {assets.map((asset) => (
                  <div
                    key={asset._id}
                    className="rounded-lg border border-slate-200 bg-white p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-slate-900">
                            {asset.title}
                          </h3>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              asset.status === "ACTIVE"
                                ? "bg-green-50 text-green-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {asset.status}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                          {asset.description}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                          <span className="rounded bg-slate-100 px-2 py-0.5">
                            {asset.assetType}
                          </span>
                          <span>{asset.industry}</span>
                          <span>•</span>
                          <span>{asset.location}</span>
                        </div>

                        <div className="mt-3 flex items-center gap-4">
                          <div>
                            <div className="text-xs text-slate-500">
                              Asking Price
                            </div>
                            <div className="font-semibold text-slate-900">
                              {formatCurrency(asset.askingPrice)}
                            </div>
                          </div>
                          {asset.revenue !== undefined && (
                            <div>
                              <div className="text-xs text-slate-500">Revenue</div>
                              <div className="font-semibold text-slate-900">
                                {formatCurrency(asset.revenue)}
                              </div>
                            </div>
                          )}
                          {asset.ebitda !== undefined && (
                            <div>
                              <div className="text-xs text-slate-500">EBITDA</div>
                              <div className="font-semibold text-slate-900">
                                {formatCurrency(asset.ebitda)}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="mt-3 text-xs text-slate-400">
                          Listed {new Date(asset.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Link
                          href={`/marketplace/${asset._id}`}
                          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                        >
                          View
                        </Link>
                        {asset.status === "ACTIVE" && (
                          <button
                            onClick={() => handleDelete(asset._id)}
                            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                          >
                            Suspend
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-slate-900">
                  No listings yet
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Get started by creating your first asset listing
                </p>
                <Link
                  href="/seller/listings/new"
                  className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Add Listing
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

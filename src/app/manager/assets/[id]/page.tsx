"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import ManagerSidebar from "@/components/manager/ManagerSidebar";
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
  updatedAt: string;
}

export default function ManagerAssetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const assetId = params.id as string;

  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    checkAuthAndLoadAsset();
  }, [assetId]);

  const checkAuthAndLoadAsset = async () => {
    try {
      // Check authentication
      const authRes = await fetch("/api/auth/me");
      if (!authRes.ok) {
        router.push("/login");
        return;
      }

      const authData = await authRes.json();
      if (authData.role !== "MANAGER") {
        setError("Access denied. Manager role required.");
        setLoading(false);
        return;
      }

      // Load asset details - using manager assets endpoint with search
      const assetsRes = await fetch(`/api/manager/assets?limit=50`);
      if (assetsRes.ok) {
        const assetsData = await assetsRes.json();
        const foundAsset = assetsData.data.find((a: Asset) => a._id === assetId);
        
        if (foundAsset) {
          setAsset(foundAsset);
        } else {
          setError("Asset not found");
        }
      } else {
        setError("Failed to load asset");
      }

      setLoading(false);
    } catch (err) {
      setError("Failed to load asset");
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!asset) return;

    if (!confirm(`Are you sure you want to ${newStatus === "ACTIVE" ? "activate" : "suspend"} this asset?`)) {
      return;
    }

    try {
      setUpdating(true);

      const response = await fetch(`/api/manager/assets/${assetId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const data = await response.json();
        setAsset(data.data);
        alert(`Asset ${newStatus === "ACTIVE" ? "activated" : "suspended"} successfully`);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to update asset status");
      }

      setUpdating(false);
    } catch (err) {
      alert("Failed to update asset status");
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="text-sm text-slate-600">Loading asset...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-600">{error || "Asset not found"}</p>
            <Link
              href="/manager/assets"
              className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700"
            >
              ← Back to Assets
            </Link>
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
          <ManagerSidebar />

          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <Link
                  href="/manager/assets"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  ← Back to Assets
                </Link>
                <h1 className="mt-2 text-2xl font-bold text-slate-900">Asset Details</h1>
              </div>

              {/* Status Badge */}
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  asset.status === "ACTIVE"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {asset.status}
              </span>
            </div>

            {/* Asset Information */}
            <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">
                Asset Information
              </h2>

              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-slate-500">Title</div>
                  <div className="mt-1 text-lg font-semibold text-slate-900">
                    {asset.title}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-slate-500">Description</div>
                  <div className="mt-1 text-slate-900">{asset.description}</div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-sm font-medium text-slate-500">Asset Type</div>
                    <div className="mt-1">
                      <span className="rounded bg-slate-100 px-2 py-1 text-sm font-medium text-slate-700">
                        {asset.assetType}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-slate-500">Industry</div>
                    <div className="mt-1 text-slate-900">{asset.industry}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-slate-500">Location</div>
                    <div className="mt-1 text-slate-900">{asset.location}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-slate-500">Status</div>
                    <div className="mt-1">
                      <span
                        className={`rounded-full px-2 py-1 text-sm font-medium ${
                          asset.status === "ACTIVE"
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {asset.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <div className="text-sm font-medium text-slate-500">Asking Price</div>
                    <div className="mt-1 text-xl font-bold text-slate-900">
                      {formatCurrency(asset.askingPrice)}
                    </div>
                  </div>

                  {asset.revenue !== undefined && (
                    <div>
                      <div className="text-sm font-medium text-slate-500">Revenue</div>
                      <div className="mt-1 text-xl font-bold text-slate-900">
                        {formatCurrency(asset.revenue)}
                      </div>
                    </div>
                  )}

                  {asset.ebitda !== undefined && (
                    <div>
                      <div className="text-sm font-medium text-slate-500">EBITDA</div>
                      <div className="mt-1 text-xl font-bold text-slate-900">
                        {formatCurrency(asset.ebitda)}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-sm font-medium text-slate-500">Listed</div>
                    <div className="mt-1 text-slate-900">
                      {new Date(asset.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-slate-500">Last Updated</div>
                    <div className="mt-1 text-slate-900">
                      {new Date(asset.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Seller Information */}
            <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">
                Seller Information
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-sm font-medium text-slate-500">Name</div>
                  <div className="mt-1 text-slate-900">{asset.sellerId.name}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-slate-500">Email</div>
                  <div className="mt-1 text-slate-900">{asset.sellerId.email}</div>
                </div>

                {asset.sellerId.company && (
                  <div>
                    <div className="text-sm font-medium text-slate-500">Company</div>
                    <div className="mt-1 text-slate-900">{asset.sellerId.company}</div>
                  </div>
                )}

                {asset.sellerId.location && (
                  <div>
                    <div className="text-sm font-medium text-slate-500">Location</div>
                    <div className="mt-1 text-slate-900">{asset.sellerId.location}</div>
                  </div>
                )}
              </div>

              <Link
                href={`/manager/users/${asset.sellerId._id}`}
                className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700"
              >
                View Seller Profile →
              </Link>
            </div>

            {/* Moderation Actions */}
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">
                Moderation Actions
              </h2>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <Link
                    href={`/marketplace/${asset._id}`}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    View in Marketplace
                  </Link>
                </div>

                {asset.status === "ACTIVE" ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <h3 className="font-medium text-red-900">Suspend Asset</h3>
                    <p className="mt-1 text-sm text-red-700">
                      Suspending this asset will remove it from the marketplace and prevent
                      buyers from viewing it.
                    </p>
                    <button
                      onClick={() => handleStatusUpdate("SUSPENDED")}
                      disabled={updating}
                      className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                    >
                      {updating ? "Updating..." : "Suspend Asset"}
                    </button>
                  </div>
                ) : (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <h3 className="font-medium text-green-900">Activate Asset</h3>
                    <p className="mt-1 text-sm text-green-700">
                      Activating this asset will make it visible in the marketplace again.
                    </p>
                    <button
                      onClick={() => handleStatusUpdate("ACTIVE")}
                      disabled={updating}
                      className="mt-3 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                    >
                      {updating ? "Updating..." : "Activate Asset"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

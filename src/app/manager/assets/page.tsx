"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import ManagerSidebar from "@/components/manager/ManagerSidebar";
import { formatCurrency } from "@/lib/format";

interface Asset {
  id: string;
  title: string;
  description: string;
  assetType: string;
  industry: string;
  location: string;
  askingPrice: number;
  revenue?: number;
  ebitda?: number;
  status: string;
  seller: {
    id: string;
    name: string;
    email: string;
    company?: string;
  };
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function ManagerAssetsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [typeFilter, setTypeFilter] = useState(searchParams.get("assetType") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1", 10)
  );

  useEffect(() => {
    checkAuthAndLoadAssets();
  }, [currentPage, typeFilter, statusFilter]);

  const checkAuthAndLoadAssets = async () => {
    try {
      setLoading(true);

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

      // Build query params
      const params = new URLSearchParams();
      params.set("page", currentPage.toString());
      params.set("limit", "20");
      if (search) params.set("search", search);
      if (typeFilter) params.set("assetType", typeFilter);
      if (statusFilter) params.set("status", statusFilter);

      // Load assets
      const assetsRes = await fetch(`/api/manager/assets?${params.toString()}`);
      if (assetsRes.ok) {
        const assetsData = await assetsRes.json();
        setAssets(assetsData.data || []);
        setPagination(assetsData.pagination);
      } else {
        setError("Failed to load assets");
      }

      setLoading(false);
    } catch (err) {
      setError("Failed to load assets");
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    checkAuthAndLoadAssets();
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="text-sm text-slate-600">Loading assets...</p>
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
          <ManagerSidebar />

          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900">Asset Moderation</h1>
              <p className="mt-1 text-sm text-slate-600">
                Manage and moderate platform assets
              </p>
            </div>

            {/* Filters */}
            <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Search
                    </label>
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Title or description..."
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Asset Type
                    </label>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">All Types</option>
                      <option value="BUSINESS">Business</option>
                      <option value="REAL_ESTATE">Real Estate</option>
                      <option value="INTELLECTUAL_PROPERTY">Intellectual Property</option>
                      <option value="FINANCIAL_ASSET">Financial Asset</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">All Status</option>
                      <option value="ACTIVE">Active</option>
                      <option value="SUSPENDED">Suspended</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Apply Filters
                </button>
              </form>
            </div>

            {/* Assets List */}
            {assets.length > 0 ? (
              <>
                <div className="space-y-4">
                  {assets.map((asset) => (
                    <div
                      key={asset.id}
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
                                  : "bg-red-50 text-red-700"
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
                              <div className="text-xs text-slate-500">Asking Price</div>
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
                          </div>

                          <div className="mt-3 text-xs text-slate-400">
                            Seller: {asset.seller.name} • Listed{" "}
                            {new Date(asset.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        <Link
                          href={`/manager/assets/${asset.id}`}
                          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                        >
                          Moderate
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
                    <div className="text-sm text-slate-600">
                      Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                      {pagination.total} assets
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="rounded-lg border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="rounded-lg border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
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
                <h3 className="mt-2 text-sm font-medium text-slate-900">No assets found</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Try adjusting your filters
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ManagerAssetsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="text-sm text-slate-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <ManagerAssetsContent />
    </Suspense>
  );
}

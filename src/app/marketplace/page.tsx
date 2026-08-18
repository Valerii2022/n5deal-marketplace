"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import AssetCard from "@/components/marketplace/AssetCard";
import AssetFilters from "@/components/marketplace/AssetFilters";
import { AssetsResponse } from "@/types/client";

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [assets, setAssets] = useState<AssetsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams?.get("search") || "");
  const [sort, setSort] = useState(searchParams?.get("sort") || "newest");

  const fetchAssets = async (params: Record<string, string> = {}) => {
    setLoading(true);
    const queryParams = new URLSearchParams();

    // Add all params
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.set(key, value);
    });

    try {
      const response = await fetch(`/api/assets?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setAssets(data);
      }
    } catch (error) {
      console.error("Failed to fetch assets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (sort) params.sort = sort;
    if (searchParams?.get("page")) params.page = searchParams.get("page")!;

    fetchAssets(params);
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    const params: Record<string, string> = { search: value };
    if (sort) params.sort = sort;
    fetchAssets(params);
  };

  const handleSort = (value: string) => {
    setSort(value);
    const params: Record<string, string> = { sort: value };
    if (search) params.search = search;
    fetchAssets(params);
  };

  const handleFilters = (filters: any) => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (sort) params.sort = sort;
    if (filters.assetType) params.assetType = filters.assetType;
    if (filters.industry) params.industry = filters.industry;
    if (filters.location) params.location = filters.location;
    if (filters.status) params.status = filters.status;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    fetchAssets(params);
  };

  const handleResetFilters = () => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (sort) params.sort = sort;
    fetchAssets(params);
  };

  const handlePageChange = (page: number) => {
    const params: Record<string, string> = { page: page.toString() };
    if (search) params.search = search;
    if (sort) params.sort = sort;
    fetchAssets(params);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      {/* Hero Section */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="mb-2 text-3xl font-bold text-slate-900">
            Marketplace
          </h1>
          <p className="text-slate-600">
            Discover premium businesses, real estate, and investment
            opportunities
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch(search);
                    }
                  }}
                  placeholder="Find the perfect asset..."
                  className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Sort and Filters */}
            <div className="flex items-center gap-3">
              <select
                value={sort}
                onChange={(e) => handleSort(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>

              <AssetFilters
                onApply={handleFilters}
                onReset={handleResetFilters}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="text-sm text-slate-600">Loading assets...</p>
            </div>
          </div>
        ) : assets && assets.data.length > 0 ? (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-sm text-slate-600">
                Showing {assets.data.length} of {assets.pagination.total}{" "}
                assets
              </p>
            </div>

            {/* Asset Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {assets.data.map((asset) => (
                <AssetCard key={asset._id} asset={asset} />
              ))}
            </div>

            {/* Pagination */}
            {assets.pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() =>
                    handlePageChange(assets.pagination.page - 1)
                  }
                  disabled={assets.pagination.page === 1}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <span className="px-4 py-2 text-sm text-slate-600">
                  Page {assets.pagination.page} of{" "}
                  {assets.pagination.totalPages}
                </span>

                <button
                  onClick={() =>
                    handlePageChange(assets.pagination.page + 1)
                  }
                  disabled={
                    assets.pagination.page === assets.pagination.totalPages
                  }
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-12 text-center">
            <p className="text-slate-600">No assets found</p>
          </div>
        )}
      </div>

      {/* FAQ Section */}
      <div className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-2xl font-bold text-slate-900">
            Frequently Asked Questions
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-semibold text-slate-900">
                What is N5Deal Marketplace?
              </h3>
              <p className="text-sm text-slate-600">
                N5Deal is a premium marketplace connecting buyers and sellers of
                businesses, real estate, equity stakes, and other investment
                opportunities. Our platform facilitates secure, professional
                transactions in the M&A space.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-slate-900">
                What types of assets can I find?
              </h3>
              <p className="text-sm text-slate-600">
                Our marketplace features businesses for sale, commercial real
                estate, equity investments, and other financial assets across
                various industries including technology, healthcare,
                manufacturing, and more.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-slate-900">
                How do I contact a seller?
              </h3>
              <p className="text-sm text-slate-600">
                Once you create a buyer account and log in, you can contact
                sellers directly through our secure messaging system. Simply
                view an asset listing and click "Contact Seller" to start a
                conversation.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-slate-900">
                How does the acquisition process work?
              </h3>
              <p className="text-sm text-slate-600">
                After connecting with a seller, you can discuss terms, request
                additional information, and negotiate directly. N5Deal provides
                the platform for discovery and communication, while you maintain
                control of your transaction process.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
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
      <MarketplaceContent />
    </Suspense>
  );
}

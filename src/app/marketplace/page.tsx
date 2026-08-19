"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import AssetCard from "@/components/marketplace/AssetCard";
import AssetFilters from "@/components/marketplace/AssetFilters";
import { AssetsResponse } from "@/types/client";
import { useDebounce } from "@/hooks/useDebounce";

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [assets, setAssets] = useState<AssetsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams?.get("search") || "");
  const [sort, setSort] = useState(searchParams?.get("sort") || "newest");
  const [activeFilters, setActiveFilters] = useState({
    assetType: searchParams?.get("assetType") || "",
    industry: searchParams?.get("industry") || "",
    location: searchParams?.get("location") || "",
    status: searchParams?.get("status") || "",
    minPrice: searchParams?.get("minPrice") || "",
    maxPrice: searchParams?.get("maxPrice") || "",
  });

  const debouncedSearch = useDebounce(search, 400);
  const isInitialMount = useRef(true);

  const updateURL = (params: Record<string, string>) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.set(key, value);
    });
    const newURL = queryParams.toString() 
      ? `/marketplace?${queryParams.toString()}`
      : '/marketplace';
    router.replace(newURL, { scroll: false });
  };

  const fetchAssets = async (params: Record<string, string> = {}) => {
    setLoading(true);
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.set(key, value);
    });

    try {
      const response = await fetch(`/api/assets?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setAssets(data);
      } else {
        setAssets({ data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } });
      }
    } catch (error) {
      console.error("Failed to fetch assets");
      setAssets({ data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } });
    } finally {
      setLoading(false);
    }
  };

  // Initialize from URL on mount
  useEffect(() => {
    const params: Record<string, string> = {};
    if (searchParams?.get("search")) params.search = searchParams.get("search")!;
    if (searchParams?.get("sort")) params.sort = searchParams.get("sort")!;
    if (searchParams?.get("assetType")) params.assetType = searchParams.get("assetType")!;
    if (searchParams?.get("industry")) params.industry = searchParams.get("industry")!;
    if (searchParams?.get("location")) params.location = searchParams.get("location")!;
    if (searchParams?.get("status")) params.status = searchParams.get("status")!;
    if (searchParams?.get("minPrice")) params.minPrice = searchParams.get("minPrice")!;
    if (searchParams?.get("maxPrice")) params.maxPrice = searchParams.get("maxPrice")!;
    if (searchParams?.get("page")) params.page = searchParams.get("page")!;

    fetchAssets(params);
    isInitialMount.current = false;
  }, []);

  // Fetch when debounced search changes
  useEffect(() => {
    if (!isInitialMount.current) {
      const params: Record<string, string> = {
        sort,
        ...activeFilters,
      };
      if (debouncedSearch) {
        params.search = debouncedSearch;
      }
      updateURL(params);
      fetchAssets(params);
    }
  }, [debouncedSearch]);

  const handleSort = (value: string) => {
    setSort(value);
    const params: Record<string, string> = {
      sort: value,
      ...activeFilters,
    };
    if (debouncedSearch) {
      params.search = debouncedSearch;
    }
    updateURL(params);
    fetchAssets(params);
  };

  const handleFilters = (filters: any) => {
    setActiveFilters(filters);
    const params: Record<string, string> = {
      sort,
      ...filters,
    };
    if (debouncedSearch) {
      params.search = debouncedSearch;
    }
    updateURL(params);
    fetchAssets(params);
  };

  const handleResetFilters = () => {
    setActiveFilters({
      assetType: "",
      industry: "",
      location: "",
      status: "",
      minPrice: "",
      maxPrice: "",
    });
    const params: Record<string, string> = {
      sort,
    };
    if (debouncedSearch) {
      params.search = debouncedSearch;
    }
    updateURL(params);
    fetchAssets(params);
  };

  const handleRemoveFilter = (filterKey: string) => {
    const newFilters = { ...activeFilters, [filterKey]: "" };
    setActiveFilters(newFilters);
    const params: Record<string, string> = {
      sort,
      ...newFilters,
    };
    if (debouncedSearch) {
      params.search = debouncedSearch;
    }
    updateURL(params);
    fetchAssets(params);
  };

  const handleRemovePriceFilter = () => {
    const newFilters = { ...activeFilters, minPrice: "", maxPrice: "" };
    setActiveFilters(newFilters);
    const params: Record<string, string> = {
      sort,
      ...newFilters,
    };
    if (debouncedSearch) {
      params.search = debouncedSearch;
    }
    updateURL(params);
    fetchAssets(params);
  };

  const handlePageChange = (page: number) => {
    const params: Record<string, string> = {
      sort,
      ...activeFilters,
      page: page.toString(),
    };
    if (debouncedSearch) {
      params.search = debouncedSearch;
    }
    updateURL(params);
    fetchAssets(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearSearch = () => {
    setSearch("");
  };

  const activeFilterCount = Object.values(activeFilters).filter(v => v).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      {/* Hero Section */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="mb-1 text-2xl font-bold text-slate-900">
            Marketplace
          </h1>
          <p className="text-sm text-slate-600">
            Discover premium businesses, real estate, and investment opportunities
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <div className="flex-1 w-full sm:max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Find the perfect asset..."
                  className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                {search && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Sort and Filters */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <select
                value={sort}
                onChange={(e) => handleSort(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>

              <AssetFilters
                filters={activeFilters}
                activeCount={activeFilterCount}
                onApply={handleFilters}
                onReset={handleResetFilters}
              />
            </div>
          </div>

          {/* Active Filters */}
          {(search || activeFilterCount > 0) && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {search && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  Search: {search}
                  <button
                    onClick={handleClearSearch}
                    className="hover:text-blue-900"
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {activeFilters.assetType && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  Type: {activeFilters.assetType}
                  <button
                    onClick={() => handleRemoveFilter("assetType")}
                    className="hover:text-slate-900"
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {activeFilters.industry && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  Industry: {activeFilters.industry}
                  <button
                    onClick={() => handleRemoveFilter("industry")}
                    className="hover:text-slate-900"
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {activeFilters.location && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  Location: {activeFilters.location}
                  <button
                    onClick={() => handleRemoveFilter("location")}
                    className="hover:text-slate-900"
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {activeFilters.status && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  Status: {activeFilters.status}
                  <button
                    onClick={() => handleRemoveFilter("status")}
                    className="hover:text-slate-900"
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {(activeFilters.minPrice || activeFilters.maxPrice) && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  Price: {activeFilters.minPrice || "0"} - {activeFilters.maxPrice || "∞"}
                  <button
                    onClick={handleRemovePriceFilter}
                    className="hover:text-slate-900"
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg border border-slate-200 bg-white p-4">
                <div className="mb-3 h-6 bg-slate-200 rounded"></div>
                <div className="mb-2 h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="mb-4 h-4 bg-slate-200 rounded w-1/2"></div>
                <div className="mb-3 h-8 bg-slate-200 rounded"></div>
                <div className="h-10 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : assets && assets.data.length > 0 ? (
          <>
            {/* Results Count */}
            <div className="mb-4">
              <p className="text-sm text-slate-600">
                {assets.pagination.total} {assets.pagination.total === 1 ? "asset" : "assets"} found
              </p>
            </div>

            {/* Asset Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {assets.data.map((asset) => (
                <AssetCard key={asset._id} asset={asset} />
              ))}
            </div>

            {/* Pagination */}
            {assets.pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(assets.pagination.page - 1)}
                  disabled={assets.pagination.page === 1}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <span className="px-4 py-2 text-sm text-slate-600">
                  Page {assets.pagination.page} of {assets.pagination.totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(assets.pagination.page + 1)}
                  disabled={assets.pagination.page === assets.pagination.totalPages}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-slate-900">No assets found</h3>
            <p className="mt-1 text-sm text-slate-500">
              {search || activeFilterCount > 0
                ? "Try adjusting your search or filters"
                : "No assets are currently available"}
            </p>
            {(search || activeFilterCount > 0) && (
              <button
                onClick={() => {
                  setSearch("");
                  handleResetFilters();
                }}
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* FAQ Section */}
      <div className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-xl font-bold text-slate-900">
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
            <p className="text-sm text-slate-600">Loading marketplace...</p>
          </div>
        </div>
      </div>
    }>
      <MarketplaceContent />
    </Suspense>
  );
}

"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navigation from "@/components/Navigation";
import SellerSidebar from "@/components/seller/SellerSidebar";
import { formatCurrency } from "@/lib/format";
import { useDebounce } from "@/hooks/useDebounce";

interface Buyer {
  id: string;
  name: string;
  email: string;
  company?: string;
  location?: string;
  bio?: string;
  industries?: string[];
  investmentRange?: {
    min: number;
    max: number;
  };
  acquisitionTypes?: string[];
}

interface BuyersResponse {
  data: Buyer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface Asset {
  _id: string;
  title: string;
}

function SellerBuyersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [buyers, setBuyers] = useState<BuyersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Search and filter state
  const [search, setSearch] = useState(searchParams?.get("search") || "");
  const [activeFilters, setActiveFilters] = useState({
    industry: searchParams?.get("industry") || "",
    location: searchParams?.get("location") || "",
    minInvestment: searchParams?.get("minInvestment") || "",
    maxInvestment: searchParams?.get("maxInvestment") || "",
    acquisitionType: searchParams?.get("acquisitionType") || "",
  });
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams?.get("page") || "1", 10)
  );
  
  const debouncedSearch = useDebounce(search, 400);
  const isInitialMount = useRef(true);
  
  // Contact modal state
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [sending, setSending] = useState(false);
  const [sellerAssets, setSellerAssets] = useState<Asset[]>([]);
  
  // Filter modal state
  const [showFilters, setShowFilters] = useState(false);
  const [draftFilters, setDraftFilters] = useState(activeFilters);

  useEffect(() => {
    loadSellerAssets();
  }, []);

  // Initialize from URL on mount
  useEffect(() => {
    const params: Record<string, string> = {};
    if (searchParams?.get("search")) params.search = searchParams.get("search")!;
    if (searchParams?.get("industry")) params.industry = searchParams.get("industry")!;
    if (searchParams?.get("location")) params.location = searchParams.get("location")!;
    if (searchParams?.get("minInvestment")) params.minInvestment = searchParams.get("minInvestment")!;
    if (searchParams?.get("maxInvestment")) params.maxInvestment = searchParams.get("maxInvestment")!;
    if (searchParams?.get("acquisitionType")) params.acquisitionType = searchParams.get("acquisitionType")!;
    if (searchParams?.get("page")) params.page = searchParams.get("page")!;

    fetchBuyers(params);
    isInitialMount.current = false;
  }, []);

  // Fetch when debounced search changes
  useEffect(() => {
    if (!isInitialMount.current) {
      const params: Record<string, string> = {
        ...activeFilters,
      };
      if (debouncedSearch) {
        params.search = debouncedSearch;
      }
      setCurrentPage(1); // Reset to page 1 on search change
      updateURL(params);
      fetchBuyers(params);
    }
  }, [debouncedSearch]);

  const updateURL = (params: Record<string, string>) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.set(key, value);
    });
    const newURL = queryParams.toString() 
      ? `/seller/buyers?${queryParams.toString()}`
      : '/seller/buyers';
    router.replace(newURL, { scroll: false });
  };

  const fetchBuyers = async (params: Record<string, string> = {}) => {
    try {
      setLoading(true);
      
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

      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.set(key, value);
      });
      queryParams.set("limit", "20");

      const buyersRes = await fetch(`/api/sellers/buyers?${queryParams.toString()}`);
      if (buyersRes.ok) {
        const buyersData = await buyersRes.json();
        setBuyers(buyersData);
      } else {
        setBuyers({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });
      }

      setLoading(false);
    } catch (err) {
      setError("Failed to load buyers");
      setLoading(false);
    }
  };

  const loadSellerAssets = async () => {
    try {
      const authRes = await fetch("/api/auth/me");
      if (!authRes.ok) return;

      const authData = await authRes.json();
      
      // Load seller's own assets for optional reference
      const assetsRes = await fetch("/api/assets?limit=100");
      if (assetsRes.ok) {
        const assetsData = await assetsRes.json();
        // Filter to only this seller's assets
        const myAssets = assetsData.data.filter(
          (asset: any) => asset.sellerId._id === authData.id
        );
        setSellerAssets(myAssets);
      }
    } catch (err) {
      // Silently fail - asset reference is optional
      console.error("Failed to load seller assets:", err);
    }
  };

  const handleApplyFilters = () => {
    setActiveFilters(draftFilters);
    setCurrentPage(1); // Reset to page 1 on filter change
    const params: Record<string, string> = {
      ...draftFilters,
    };
    if (debouncedSearch) {
      params.search = debouncedSearch;
    }
    updateURL(params);
    fetchBuyers(params);
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    const emptyFilters = {
      industry: "",
      location: "",
      minInvestment: "",
      maxInvestment: "",
      acquisitionType: "",
    };
    setActiveFilters(emptyFilters);
    setDraftFilters(emptyFilters);
    setSearch("");
    setCurrentPage(1);
    updateURL({});
    fetchBuyers({});
    setShowFilters(false);
  };

  const handleRemoveFilter = (filterKey: string) => {
    const newFilters = { ...activeFilters, [filterKey]: "" };
    setActiveFilters(newFilters);
    setDraftFilters(newFilters);
    setCurrentPage(1);
    const params: Record<string, string> = {
      ...newFilters,
    };
    if (debouncedSearch) {
      params.search = debouncedSearch;
    }
    updateURL(params);
    fetchBuyers(params);
  };

  const handleRemoveInvestmentFilter = () => {
    const newFilters = { ...activeFilters, minInvestment: "", maxInvestment: "" };
    setActiveFilters(newFilters);
    setDraftFilters(newFilters);
    setCurrentPage(1);
    const params: Record<string, string> = {
      ...newFilters,
    };
    if (debouncedSearch) {
      params.search = debouncedSearch;
    }
    updateURL(params);
    fetchBuyers(params);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const params: Record<string, string> = {
      ...activeFilters,
      page: page.toString(),
    };
    if (debouncedSearch) {
      params.search = debouncedSearch;
    }
    updateURL(params);
    fetchBuyers(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeFilterCount = Object.values(activeFilters).filter(v => v).length + (search ? 1 : 0);

  const openContactModal = (buyer: Buyer) => {
    setSelectedBuyer(buyer);
    setMessageSubject(`Inquiry from ${buyer.company || buyer.name}`);
    setMessageBody("");
    setSelectedAssetId("");
    setShowContactModal(true);
  };

  const handleContactBuyer = async () => {
    if (!selectedBuyer) return;

    if (!messageSubject.trim() || !messageBody.trim()) {
      alert("Please fill in both subject and message");
      return;
    }

    setSending(true);

    try {
      const payload: any = {
        recipientId: selectedBuyer.id,
        subject: messageSubject,
        body: messageBody,
      };

      // Add asset reference if selected
      if (selectedAssetId) {
        payload.assetId = selectedAssetId;
      }

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowContactModal(false);
        setMessageBody("");
        setMessageSubject("");
        setSelectedAssetId("");
        setSelectedBuyer(null);
        alert("Message sent successfully!");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to send message. Please try again.");
      }
    } catch (error) {
      alert("Unable to send message. Please check your connection and try again.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="text-sm text-slate-600">Loading buyers...</p>
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
            <h1 className="mb-6 text-2xl font-bold text-slate-900">
              Buyer Directory
            </h1>

            {/* Search and Filter Bar */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search buyers by name, email, or company..."
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => {
                  setDraftFilters(activeFilters);
                  setShowFilters(true);
                }}
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Active Filters */}
            {(search || activeFilterCount > 0) && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {search && (
                  <div className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
                    <span>Search: {search}</span>
                    <button
                      onClick={() => setSearch("")}
                      className="ml-1 hover:text-blue-900"
                    >
                      ×
                    </button>
                  </div>
                )}
                {activeFilters.industry && (
                  <div className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
                    <span>Industry: {activeFilters.industry}</span>
                    <button
                      onClick={() => handleRemoveFilter("industry")}
                      className="ml-1 hover:text-blue-900"
                    >
                      ×
                    </button>
                  </div>
                )}
                {activeFilters.location && (
                  <div className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
                    <span>Location: {activeFilters.location}</span>
                    <button
                      onClick={() => handleRemoveFilter("location")}
                      className="ml-1 hover:text-blue-900"
                    >
                      ×
                    </button>
                  </div>
                )}
                {(activeFilters.minInvestment || activeFilters.maxInvestment) && (
                  <div className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
                    <span>
                      Investment: {activeFilters.minInvestment && formatCurrency(parseInt(activeFilters.minInvestment))}
                      {activeFilters.minInvestment && activeFilters.maxInvestment && " – "}
                      {activeFilters.maxInvestment && formatCurrency(parseInt(activeFilters.maxInvestment))}
                    </span>
                    <button
                      onClick={handleRemoveInvestmentFilter}
                      className="ml-1 hover:text-blue-900"
                    >
                      ×
                    </button>
                  </div>
                )}
                {activeFilters.acquisitionType && (
                  <div className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
                    <span>Type: {activeFilters.acquisitionType}</span>
                    <button
                      onClick={() => handleRemoveFilter("acquisitionType")}
                      className="ml-1 hover:text-blue-900"
                    >
                      ×
                    </button>
                  </div>
                )}
                {(search || activeFilterCount > 0) && (
                  <button
                    onClick={handleResetFilters}
                    className="text-sm text-slate-600 hover:text-slate-900"
                  >
                    Reset all
                  </button>
                )}
              </div>
            )}

            {buyers && buyers.data.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {buyers.data.map((buyer) => (
                  <div
                    key={buyer.id}
                    className="rounded-lg border border-slate-200 bg-white p-6"
                  >
                    <h3 className="text-lg font-semibold text-slate-900">
                      {buyer.name}
                    </h3>

                    {buyer.company && (
                      <div className="mt-1 text-sm text-slate-600">
                        {buyer.company}
                      </div>
                    )}

                    {buyer.location && (
                      <div className="mt-1 text-sm text-slate-500">
                        {buyer.location}
                      </div>
                    )}

                    {buyer.bio && (
                      <p className="mt-3 text-sm text-slate-600 line-clamp-3">
                        {buyer.bio}
                      </p>
                    )}

                    {buyer.industries && buyer.industries.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs font-medium text-slate-500">
                          Industries
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {buyer.industries.map((industry, i) => (
                            <span
                              key={i}
                              className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
                            >
                              {industry}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {buyer.investmentRange && (
                      <div className="mt-3">
                        <div className="text-xs font-medium text-slate-500">
                          Investment Range
                        </div>
                        <div className="mt-1 text-sm text-slate-900">
                          {formatCurrency(buyer.investmentRange.min)} -{" "}
                          {formatCurrency(buyer.investmentRange.max)}
                        </div>
                      </div>
                    )}

                    {buyer.acquisitionTypes &&
                      buyer.acquisitionTypes.length > 0 && (
                        <div className="mt-3">
                          <div className="text-xs font-medium text-slate-500">
                            Acquisition Types
                          </div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {buyer.acquisitionTypes.map((type, i) => (
                              <span
                                key={i}
                                className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    <div className="mt-4 text-xs text-slate-400">
                      {buyer.email}
                    </div>

                    <button
                      onClick={() => openContactModal(buyer)}
                      className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                    >
                      Contact Buyer
                    </button>
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-slate-900">
                  No buyers found
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {activeFilterCount > 0 || search
                    ? "Try adjusting your filters or search"
                    : "Check back later for potential buyers"}
                </p>
                {(activeFilterCount > 0 || search) && (
                  <button
                    onClick={handleResetFilters}
                    className="mt-4 text-sm text-blue-600 hover:text-blue-700"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}

            {/* Pagination */}
            {buyers && buyers.pagination && buyers.pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
                <div className="text-sm text-slate-600">
                  Showing {(buyers.pagination.page - 1) * buyers.pagination.limit + 1} to{" "}
                  {Math.min(buyers.pagination.page * buyers.pagination.limit, buyers.pagination.total)} of{" "}
                  {buyers.pagination.total} buyers
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(buyers.pagination.page - 1)}
                    disabled={buyers.pagination.page === 1}
                    className="rounded-lg border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(buyers.pagination.page + 1)}
                    disabled={buyers.pagination.page === buyers.pagination.totalPages}
                    className="rounded-lg border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && selectedBuyer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="mb-4 text-lg sm:text-xl font-semibold text-slate-900">
              Contact Buyer
            </h2>

            <div className="mb-4 rounded-lg bg-slate-50 p-3">
              <div className="font-medium text-slate-900">{selectedBuyer.name}</div>
              {selectedBuyer.company && (
                <div className="text-sm text-slate-600">{selectedBuyer.company}</div>
              )}
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Subject
              </label>
              <input
                type="text"
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Message
              </label>
              <textarea
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                rows={6}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Introduce yourself and explain your interest..."
              />
            </div>

            {sellerAssets.length > 0 && (
              <div className="mb-6">
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Reference Asset (Optional)
                </label>
                <select
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">No asset reference</option>
                  {sellerAssets.map((asset) => (
                    <option key={asset._id} value={asset._id}>
                      {asset.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowContactModal(false);
                  setSelectedBuyer(null);
                }}
                disabled={sending}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleContactBuyer}
                disabled={sending}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send Message"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="mb-4 text-lg sm:text-xl font-semibold text-slate-900">
              Filter Buyers
            </h2>

            <div className="space-y-4">
              {/* Industry Filter */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Industry
                </label>
                <select
                  value={draftFilters.industry}
                  onChange={(e) => setDraftFilters({ ...draftFilters, industry: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">All Industries</option>
                  <option value="Technology">Technology</option>
                  <option value="SaaS">SaaS</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Distribution">Distribution</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Hospitality">Hospitality</option>
                  <option value="Retail">Retail</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Wellness">Wellness</option>
                  <option value="Medical Services">Medical Services</option>
                  <option value="Consumer Goods">Consumer Goods</option>
                  <option value="Services">Services</option>
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Location
                </label>
                <input
                  type="text"
                  value={draftFilters.location}
                  onChange={(e) => setDraftFilters({ ...draftFilters, location: e.target.value })}
                  placeholder="e.g., San Francisco, CA"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Investment Range */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Investment Range
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="number"
                      value={draftFilters.minInvestment}
                      onChange={(e) => setDraftFilters({ ...draftFilters, minInvestment: e.target.value })}
                      placeholder="Min"
                      min="0"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={draftFilters.maxInvestment}
                      onChange={(e) => setDraftFilters({ ...draftFilters, maxInvestment: e.target.value })}
                      placeholder="Max"
                      min="0"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Acquisition Type Filter */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Acquisition Type
                </label>
                <select
                  value={draftFilters.acquisitionType}
                  onChange={(e) => setDraftFilters({ ...draftFilters, acquisitionType: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="Strategic Acquisition">Strategic Acquisition</option>
                  <option value="Majority Stake">Majority Stake</option>
                  <option value="Full Acquisition">Full Acquisition</option>
                  <option value="Management Buyout">Management Buyout</option>
                  <option value="Asset Purchase">Asset Purchase</option>
                  <option value="Portfolio Acquisition">Portfolio Acquisition</option>
                  <option value="Minority Stake">Minority Stake</option>
                  <option value="Growth Capital">Growth Capital</option>
                  <option value="Partnership">Partnership</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setDraftFilters(activeFilters);
                  setShowFilters(false);
                }}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyFilters}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SellerBuyersPage() {
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
      <SellerBuyersContent />
    </Suspense>
  );
}

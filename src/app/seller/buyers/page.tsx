"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import SellerSidebar from "@/components/seller/SellerSidebar";
import { formatCurrency } from "@/lib/format";

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

export default function SellerBuyersPage() {
  const router = useRouter();
  const [buyers, setBuyers] = useState<BuyersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadBuyers();
  }, []);

  const loadBuyers = async () => {
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

      const buyersRes = await fetch("/api/sellers/buyers?limit=50");
      if (buyersRes.ok) {
        const buyersData = await buyersRes.json();
        setBuyers(buyersData);
      }

      setLoading(false);
    } catch (err) {
      setError("Failed to load buyers");
      setLoading(false);
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
                  Check back later for potential buyers
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

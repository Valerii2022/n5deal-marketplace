"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import SellerSidebar from "@/components/seller/SellerSidebar";
import { formatCurrency } from "@/lib/format";

interface SellerProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  company?: string;
  location?: string;
  bio?: string;
  industries?: string[];
}

interface Asset {
  id: string;
  title: string;
  assetType: string;
  industry: string;
  location: string;
  askingPrice: number;
  status: string;
  createdAt: string;
}

export default function SellerDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [totalAssets, setTotalAssets] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      // Check authentication
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

      // Load seller profile
      const profileRes = await fetch("/api/sellers/me");
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData.data);
      }

      // Load seller's assets (recent 5)
      const assetsRes = await fetch("/api/assets?limit=5");
      if (assetsRes.ok) {
        const assetsData = await assetsRes.json();
        setAssets(assetsData.data || []);
        setTotalAssets(assetsData.pagination?.total || 0);
      }

      setLoading(false);
    } catch (err) {
      setError("Failed to load dashboard data");
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
            <p className="text-sm text-slate-600">Loading dashboard...</p>
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
            <Link
              href="/marketplace"
              className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700"
            >
              Go to Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeAssets = assets.filter((a) => a.status === "ACTIVE").length;
  const suspendedAssets = assets.filter((a) => a.status === "SUSPENDED").length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar */}
          <SellerSidebar />

          {/* Main Content */}
          <div className="flex-1">
            {/* Welcome Section */}
            <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
              <h1 className="mb-2 text-2xl font-bold text-slate-900">
                Welcome back, {profile?.name?.split(" ")[0] || "Seller"}
              </h1>
              <p className="text-slate-600">
                Manage your listings and connect with potential buyers
              </p>
            </div>

            {/* Stats Cards */}
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <div className="text-sm font-medium text-slate-500">
                  Total Listings
                </div>
                <div className="mt-2 text-3xl font-bold text-slate-900">
                  {totalAssets}
                </div>
                <Link
                  href="/seller/listings"
                  className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-700"
                >
                  View all →
                </Link>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <div className="text-sm font-medium text-slate-500">
                  Active Listings
                </div>
                <div className="mt-2 text-3xl font-bold text-green-600">
                  {activeAssets}
                </div>
                <Link
                  href="/seller/listings"
                  className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-700"
                >
                  Manage listings →
                </Link>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <div className="text-sm font-medium text-slate-500">
                  Suspended
                </div>
                <div className="mt-2 text-3xl font-bold text-slate-400">
                  {suspendedAssets}
                </div>
                <Link
                  href="/seller/listings"
                  className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-700"
                >
                  Review →
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">
                Quick Actions
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Link
                  href="/seller/listings/new"
                  className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                    <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">Add Listing</div>
                    <div className="text-xs text-slate-500">Create new asset</div>
                  </div>
                </Link>

                <Link
                  href="/seller/buyers"
                  className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                    <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">Browse Buyers</div>
                    <div className="text-xs text-slate-500">Find potential buyers</div>
                  </div>
                </Link>

                <Link
                  href="/seller/messages"
                  className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                    <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">Messages</div>
                    <div className="text-xs text-slate-500">View inquiries</div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Listings */}
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  Recent Listings
                </h2>
                <Link
                  href="/seller/listings"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  View all →
                </Link>
              </div>

              {assets.length > 0 ? (
                <div className="space-y-3">
                  {assets.map((asset) => (
                    <Link
                      key={asset.id}
                      href={`/marketplace/${asset.id}`}
                      className="block rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900">
                              {asset.title}
                            </span>
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
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span>{asset.assetType}</span>
                            <span>•</span>
                            <span>{asset.industry}</span>
                            <span>•</span>
                            <span>{asset.location}</span>
                          </div>
                          <div className="mt-2 text-sm font-semibold text-slate-900">
                            {formatCurrency(asset.askingPrice)}
                          </div>
                        </div>
                        <div className="text-xs text-slate-400 whitespace-nowrap">
                          {new Date(asset.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500">
                  <p>No listings yet</p>
                  <Link
                    href="/seller/listings/new"
                    className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-700"
                  >
                    Create your first listing →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

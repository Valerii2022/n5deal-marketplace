"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import ManagerSidebar from "@/components/manager/ManagerSidebar";
import { formatCurrency } from "@/lib/format";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  company?: string;
  createdAt: string;
}

interface Asset {
  id: string;
  title: string;
  assetType: string;
  industry: string;
  location: string;
  askingPrice: number;
  status: string;
  seller: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export default function ManagerDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [userStats, setUserStats] = useState({ total: 0, active: 0, suspended: 0 });
  const [assetStats, setAssetStats] = useState({ total: 0, active: 0, suspended: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
console.log({users})
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
      if (authData.role !== "MANAGER") {
        setError("Access denied. Manager role required.");
        setLoading(false);
        return;
      }

      // Load users
      const usersRes = await fetch("/api/manager/users?limit=5");
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.data || []);
        
        // Calculate user stats from pagination
        const totalUsers = usersData.pagination?.total || 0;
        setUserStats({
          total: totalUsers,
          active: 0, // Will calculate from full list
          suspended: 0,
        });
      }

      // Load assets
      const assetsRes = await fetch("/api/manager/assets?limit=5");
      if (assetsRes.ok) {
        const assetsData = await assetsRes.json();
        setAssets(assetsData.data || []);
        
        // Calculate asset stats from pagination
        const totalAssets = assetsData.pagination?.total || 0;
        setAssetStats({
          total: totalAssets,
          active: 0, // Will calculate from full list
          suspended: 0,
        });
      }

      // Get full counts for status statistics
      const [activeUsersRes, suspendedUsersRes, activeAssetsRes, suspendedAssetsRes] = await Promise.all([
        fetch("/api/manager/users?status=ACTIVE&limit=1"),
        fetch("/api/manager/users?status=SUSPENDED&limit=1"),
        fetch("/api/manager/assets?status=ACTIVE&limit=1"),
        fetch("/api/manager/assets?status=SUSPENDED&limit=1"),
      ]);

      if (activeUsersRes.ok) {
        const data = await activeUsersRes.json();
        setUserStats(prev => ({ ...prev, active: data.pagination?.total || 0 }));
      }
      if (suspendedUsersRes.ok) {
        const data = await suspendedUsersRes.json();
        setUserStats(prev => ({ ...prev, suspended: data.pagination?.total || 0 }));
      }
      if (activeAssetsRes.ok) {
        const data = await activeAssetsRes.json();
        setAssetStats(prev => ({ ...prev, active: data.pagination?.total || 0 }));
      }
      if (suspendedAssetsRes.ok) {
        const data = await suspendedAssetsRes.json();
        setAssetStats(prev => ({ ...prev, suspended: data.pagination?.total || 0 }));
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

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          <ManagerSidebar />

          <div className="flex-1">
            {/* Welcome Section */}
            <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
              <h1 className="mb-2 text-2xl font-bold text-slate-900">
                Manager Dashboard
              </h1>
              <p className="text-slate-600">
                Platform moderation and user management
              </p>
            </div>

            {/* User Stats */}
            <div className="mb-6">
              <h2 className="mb-3 text-lg font-semibold text-slate-900">User Statistics</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-white p-6">
                  <div className="text-sm font-medium text-slate-500">Total Users</div>
                  <div className="mt-2 text-3xl font-bold text-slate-900">
                    {userStats.total}
                  </div>
                  <Link
                    href="/manager/users"
                    className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-700"
                  >
                    View all →
                  </Link>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-6">
                  <div className="text-sm font-medium text-slate-500">Active Users</div>
                  <div className="mt-2 text-3xl font-bold text-green-600">
                    {userStats.active}
                  </div>
                  <Link
                    href="/manager/users?status=ACTIVE"
                    className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-700"
                  >
                    View active →
                  </Link>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-6">
                  <div className="text-sm font-medium text-slate-500">Suspended</div>
                  <div className="mt-2 text-3xl font-bold text-red-600">
                    {userStats.suspended}
                  </div>
                  <Link
                    href="/manager/users?status=SUSPENDED"
                    className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-700"
                  >
                    Review →
                  </Link>
                </div>
              </div>
            </div>

            {/* Asset Stats */}
            <div className="mb-6">
              <h2 className="mb-3 text-lg font-semibold text-slate-900">Asset Statistics</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-white p-6">
                  <div className="text-sm font-medium text-slate-500">Total Assets</div>
                  <div className="mt-2 text-3xl font-bold text-slate-900">
                    {assetStats.total}
                  </div>
                  <Link
                    href="/manager/assets"
                    className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-700"
                  >
                    View all →
                  </Link>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-6">
                  <div className="text-sm font-medium text-slate-500">Active Assets</div>
                  <div className="mt-2 text-3xl font-bold text-green-600">
                    {assetStats.active}
                  </div>
                  <Link
                    href="/manager/assets?status=ACTIVE"
                    className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-700"
                  >
                    View active →
                  </Link>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-6">
                  <div className="text-sm font-medium text-slate-500">Suspended</div>
                  <div className="mt-2 text-3xl font-bold text-red-600">
                    {assetStats.suspended}
                  </div>
                  <Link
                    href="/manager/assets?status=SUSPENDED"
                    className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-700"
                  >
                    Review →
                  </Link>
                </div>
              </div>
            </div>

            {/* Recent Users */}
            <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Recent Users</h2>
                <Link
                  href="/manager/users"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  View all →
                </Link>
              </div>

              {users.length > 0 ? (
                <div className="space-y-3">
                  {users.map((user) => (
                    <Link
                      key={user.id}
                      href={`/manager/users/${user.id}`}
                      className="block rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-slate-900">{user.name}</div>
                          <div className="text-sm text-slate-500">{user.email}</div>
                          {user.company && (
                            <div className="text-sm text-slate-500">{user.company}</div>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                            {user.role}
                          </span>
                          <div className="mt-1">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                user.status === "ACTIVE"
                                  ? "bg-green-50 text-green-700"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              {user.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No users found</p>
              )}
            </div>

            {/* Recent Assets */}
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Recent Assets</h2>
                <Link
                  href="/manager/assets"
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
                      href={`/manager/assets/${asset.id}`}
                      className="block rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-slate-900">{asset.title}</div>
                          <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                            <span className="rounded bg-slate-100 px-2 py-0.5">
                              {asset.assetType}
                            </span>
                            <span>{asset.industry}</span>
                            <span>•</span>
                            <span>{asset.location}</span>
                          </div>
                          <div className="mt-1 text-sm text-slate-500">
                            Seller: {asset.seller.name}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-slate-900">
                            {formatCurrency(asset.askingPrice)}
                          </div>
                          <div className="mt-1">
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
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No assets found</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

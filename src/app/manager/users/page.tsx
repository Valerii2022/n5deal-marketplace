"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import ManagerSidebar from "@/components/manager/ManagerSidebar";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  company?: string;
  location?: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function ManagerUsersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [roleFilter, setRoleFilter] = useState(searchParams.get("role") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1", 10)
  );

  useEffect(() => {
    checkAuthAndLoadUsers();
  }, [currentPage, roleFilter, statusFilter]);

  const checkAuthAndLoadUsers = async () => {
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
      if (roleFilter) params.set("role", roleFilter);
      if (statusFilter) params.set("status", statusFilter);

      // Load users
      const usersRes = await fetch(`/api/manager/users?${params.toString()}`);
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.data || []);
        setPagination(usersData.pagination);
      } else {
        setError("Failed to load users");
      }

      setLoading(false);
    } catch (err) {
      setError("Failed to load users");
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    checkAuthAndLoadUsers();
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
            <p className="text-sm text-slate-600">Loading users...</p>
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
              <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
              <p className="mt-1 text-sm text-slate-600">
                Manage platform users and permissions
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
                      placeholder="Name or email..."
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Role
                    </label>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">All Roles</option>
                      <option value="BUYER">Buyer</option>
                      <option value="SELLER">Seller</option>
                      <option value="MANAGER">Manager</option>
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

            {/* Users List */}
            {users.length > 0 ? (
              <>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="rounded-lg border border-slate-200 bg-white p-6"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-slate-900">
                              {user.name}
                            </h3>
                            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                              {user.role}
                            </span>
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

                          <p className="mt-1 text-sm text-slate-600">{user.email}</p>

                          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                            {user.company && <span>{user.company}</span>}
                            {user.location && (
                              <>
                                {user.company && <span>•</span>}
                                <span>{user.location}</span>
                              </>
                            )}
                          </div>

                          <div className="mt-2 text-xs text-slate-400">
                            Joined {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        <Link
                          href={`/manager/users/${user.id}`}
                          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                        >
                          View Details
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
                      {pagination.total} users
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
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-slate-900">No users found</h3>
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

export default function ManagerUsersPage() {
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
      <ManagerUsersContent />
    </Suspense>
  );
}

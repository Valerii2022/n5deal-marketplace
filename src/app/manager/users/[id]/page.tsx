"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import ManagerSidebar from "@/components/manager/ManagerSidebar";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  company?: string;
  location?: string;
  bio?: string;
  industries?: string[];
  investmentRange?: {
    min: number;
    max: number;
  };
  acquisitionTypes?: string[];
  createdAt: string;
  updatedAt: string;
}

export default function ManagerUserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    checkAuthAndLoadUser();
  }, [userId]);

  const checkAuthAndLoadUser = async () => {
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

      // Load user details - using manager users endpoint with search
      const usersRes = await fetch(`/api/manager/users?limit=50`);
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        const foundUser = usersData.data.find((u: User) => u._id === userId);
        
        if (foundUser) {
          setUser(foundUser);
        } else {
          setError("User not found");
        }
      } else {
        setError("Failed to load user");
      }

      setLoading(false);
    } catch (err) {
      setError("Failed to load user");
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!user) return;

    if (!confirm(`Are you sure you want to ${newStatus === "ACTIVE" ? "activate" : "suspend"} this user?`)) {
      return;
    }

    try {
      setUpdating(true);

      const response = await fetch(`/api/manager/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
        alert(`User ${newStatus === "ACTIVE" ? "activated" : "suspended"} successfully`);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to update user status");
      }

      setUpdating(false);
    } catch (err) {
      alert("Failed to update user status");
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
            <p className="text-sm text-slate-600">Loading user...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-600">{error || "User not found"}</p>
            <Link
              href="/manager/users"
              className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700"
            >
              ← Back to Users
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
                  href="/manager/users"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  ← Back to Users
                </Link>
                <h1 className="mt-2 text-2xl font-bold text-slate-900">User Details</h1>
              </div>

              {/* Status Badge */}
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  user.status === "ACTIVE"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {user.status}
              </span>
            </div>

            {/* User Information */}
            <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">
                Profile Information
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-sm font-medium text-slate-500">Name</div>
                  <div className="mt-1 text-slate-900">{user.name}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-slate-500">Email</div>
                  <div className="mt-1 text-slate-900">{user.email}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-slate-500">Role</div>
                  <div className="mt-1">
                    <span className="rounded bg-slate-100 px-2 py-1 text-sm font-medium text-slate-700">
                      {user.role}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-slate-500">Status</div>
                  <div className="mt-1">
                    <span
                      className={`rounded-full px-2 py-1 text-sm font-medium ${
                        user.status === "ACTIVE"
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {user.status}
                    </span>
                  </div>
                </div>

                {user.company && (
                  <div>
                    <div className="text-sm font-medium text-slate-500">Company</div>
                    <div className="mt-1 text-slate-900">{user.company}</div>
                  </div>
                )}

                {user.location && (
                  <div>
                    <div className="text-sm font-medium text-slate-500">Location</div>
                    <div className="mt-1 text-slate-900">{user.location}</div>
                  </div>
                )}

                <div>
                  <div className="text-sm font-medium text-slate-500">Joined</div>
                  <div className="mt-1 text-slate-900">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-slate-500">Last Updated</div>
                  <div className="mt-1 text-slate-900">
                    {new Date(user.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {user.bio && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-slate-500">Bio</div>
                  <div className="mt-1 text-slate-900">{user.bio}</div>
                </div>
              )}

              {user.industries && user.industries.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-slate-500">Industries</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {user.industries.map((industry, index) => (
                      <span
                        key={index}
                        className="rounded bg-slate-100 px-2 py-1 text-sm text-slate-700"
                      >
                        {industry}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {user.investmentRange && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-slate-500">
                    Investment Range
                  </div>
                  <div className="mt-1 text-slate-900">
                    ${user.investmentRange.min.toLocaleString()} - $
                    {user.investmentRange.max.toLocaleString()}
                  </div>
                </div>
              )}

              {user.acquisitionTypes && user.acquisitionTypes.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-slate-500">
                    Acquisition Types
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {user.acquisitionTypes.map((type, index) => (
                      <span
                        key={index}
                        className="rounded bg-slate-100 px-2 py-1 text-sm text-slate-700"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Moderation Actions */}
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">
                Moderation Actions
              </h2>

              <div className="space-y-4">
                {user.status === "ACTIVE" ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <h3 className="font-medium text-red-900">Suspend User</h3>
                    <p className="mt-1 text-sm text-red-700">
                      Suspending this user will prevent them from accessing the platform.
                    </p>
                    <button
                      onClick={() => handleStatusUpdate("SUSPENDED")}
                      disabled={updating}
                      className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                    >
                      {updating ? "Updating..." : "Suspend User"}
                    </button>
                  </div>
                ) : (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <h3 className="font-medium text-green-900">Activate User</h3>
                    <p className="mt-1 text-sm text-green-700">
                      Activating this user will restore their platform access.
                    </p>
                    <button
                      onClick={() => handleStatusUpdate("ACTIVE")}
                      disabled={updating}
                      className="mt-3 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                    >
                      {updating ? "Updating..." : "Activate User"}
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

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import BuyerSidebar from "@/components/buyer/BuyerSidebar";
import { formatCurrency } from "@/lib/format";

interface BuyerProfile {
  id: string;
  name: string;
  email: string;
  role: string;
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

interface Message {
  _id: string;
  senderId: {
    _id: string;
    name: string;
    company?: string;
  };
  recipientId: {
    _id: string;
    name: string;
  };
  assetId?: {
    _id: string;
    title: string;
  };
  subject: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export default function BuyerDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<BuyerProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [assetCount, setAssetCount] = useState(0);
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
      if (authData.role !== "BUYER") {
        setError("Access denied. Buyer role required.");
        setLoading(false);
        return;
      }

      // Load buyer profile
      const profileRes = await fetch("/api/buyers/me");
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData.data);
      }

      // Load messages
      const messagesRes = await fetch("/api/messages?limit=5");
      if (messagesRes.ok) {
        const messagesData = await messagesRes.json();
        setMessages(messagesData.data || []);
      }

      // Load asset count
      const assetsRes = await fetch("/api/assets?limit=1");
      if (assetsRes.ok) {
        const assetsData = await assetsRes.json();
        setAssetCount(assetsData.pagination?.total || 0);
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

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar */}
          <BuyerSidebar />

          {/* Main Content */}
          <div className="flex-1">
            {/* Welcome Section */}
            <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
              <h1 className="mb-2 text-2xl font-bold text-slate-900">
                Welcome back, {profile?.name?.split(" ")[0] || "Buyer"}
              </h1>
              <p className="text-slate-600">
                Here's an overview of your acquisition activity
              </p>
            </div>

            {/* Stats Cards */}
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <div className="text-sm font-medium text-slate-500">
                  Available Assets
                </div>
                <div className="mt-2 text-3xl font-bold text-slate-900">
                  {assetCount}
                </div>
                <Link
                  href="/marketplace"
                  className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-700"
                >
                  Browse marketplace →
                </Link>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <div className="text-sm font-medium text-slate-500">
                  Unread Messages
                </div>
                <div className="mt-2 text-3xl font-bold text-slate-900">
                  {unreadCount}
                </div>
                <Link
                  href="/buyer/messages"
                  className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-700"
                >
                  View messages →
                </Link>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <div className="text-sm font-medium text-slate-500">
                  Total Messages
                </div>
                <div className="mt-2 text-3xl font-bold text-slate-900">
                  {messages.length}
                </div>
                <Link
                  href="/buyer/messages"
                  className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-700"
                >
                  View all →
                </Link>
              </div>
            </div>

            {/* Profile Summary */}
            <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  Profile Summary
                </h2>
                <Link
                  href="/buyer/profile"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Edit Profile →
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-sm font-medium text-slate-500">Name</div>
                  <div className="mt-1 text-slate-900">{profile?.name}</div>
                </div>

                {profile?.company && (
                  <div>
                    <div className="text-sm font-medium text-slate-500">
                      Company
                    </div>
                    <div className="mt-1 text-slate-900">{profile.company}</div>
                  </div>
                )}

                {profile?.location && (
                  <div>
                    <div className="text-sm font-medium text-slate-500">
                      Location
                    </div>
                    <div className="mt-1 text-slate-900">{profile.location}</div>
                  </div>
                )}

                {profile?.industries && profile.industries.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-slate-500">
                      Industries
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {profile.industries.map((industry, i) => (
                        <span
                          key={i}
                          className="rounded bg-slate-100 px-2 py-0.5 text-sm text-slate-700"
                        >
                          {industry}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {profile?.investmentRange && (
                  <div>
                    <div className="text-sm font-medium text-slate-500">
                      Investment Range
                    </div>
                    <div className="mt-1 text-slate-900">
                      {formatCurrency(profile.investmentRange.min)} -{" "}
                      {formatCurrency(profile.investmentRange.max)}
                    </div>
                  </div>
                )}

                {profile?.acquisitionTypes &&
                  profile.acquisitionTypes.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-slate-500">
                        Acquisition Types
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {profile.acquisitionTypes.map((type, i) => (
                          <span
                            key={i}
                            className="rounded bg-slate-100 px-2 py-0.5 text-sm text-slate-700"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Recent Messages */}
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  Recent Messages
                </h2>
                <Link
                  href="/buyer/messages"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  View all →
                </Link>
              </div>

              {messages.length > 0 ? (
                <div className="space-y-3">
                  {messages.map((message) => {
                    const senderName = message.senderId?.name || "Unknown";
                    const senderCompany = message.senderId?.company;
                    const assetTitle = message.assetId?.title;

                    return (
                      <Link
                        key={message._id}
                        href={`/buyer/messages/${message._id}`}
                        className="block rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-sm font-medium ${
                                  message.read
                                    ? "text-slate-700"
                                    : "text-slate-900"
                                }`}
                              >
                                {senderName}
                              </span>
                              {!message.read && (
                                <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                              )}
                            </div>
                            {senderCompany && (
                              <div className="text-xs text-slate-500">
                                {senderCompany}
                              </div>
                            )}
                            <div
                              className={`mt-1 text-sm ${
                                message.read
                                  ? "text-slate-600"
                                  : "font-medium text-slate-900"
                              }`}
                            >
                              {message.subject}
                            </div>
                            {assetTitle && (
                              <div className="mt-1 text-xs text-slate-500">
                                Re: {assetTitle}
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 whitespace-nowrap">
                            {new Date(message.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500">
                  <p>No messages yet</p>
                  <Link
                    href="/marketplace"
                    className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-700"
                  >
                    Browse marketplace to connect with sellers
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

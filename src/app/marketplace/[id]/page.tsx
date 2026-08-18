"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { Asset, User } from "@/types/client";
import { formatCurrency, formatDate } from "@/lib/format";

export default function AssetDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // Fetch current user
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data || null))
      .catch(() => setUser(null));

    // Fetch asset
    if (params?.id) {
      fetch(`/api/assets/${params.id}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.data) {
            setAsset(data.data);
            setMessageSubject(`Inquiry about ${data.data.title}`);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [params?.id]);

  const handleContactSeller = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!messageSubject.trim() || !messageBody.trim()) {
      alert("Please fill in both subject and message");
      return;
    }

    setSending(true);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: asset?.sellerId._id,
          assetId: asset?._id,
          subject: messageSubject,
          body: messageBody,
        }),
      });

      if (response.ok) {
        alert("Message sent successfully!");
        setShowContactModal(false);
        setMessageBody("");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to send message");
      }
    } catch (error) {
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const getAssetTypeLabel = (type: string) => {
    switch (type) {
      case "BUSINESS":
        return "Business";
      case "REAL_ESTATE":
        return "Real Estate";
      case "EQUITY":
        return "Equity";
      case "OTHER":
        return "Other";
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="text-sm text-slate-600">Loading asset...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="mx-auto max-w-4xl px-4 py-12 text-center">
          <h1 className="mb-4 text-2xl font-bold text-slate-900">
            Asset Not Found
          </h1>
          <Link
            href="/marketplace"
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const canContactSeller = user && user.role === "BUYER";

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/marketplace"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Marketplace
        </Link>

        {/* Main Content */}
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          {/* Header */}
          <div className="border-b border-slate-200 bg-slate-50 px-8 py-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="mb-2 text-3xl font-bold text-slate-900">
                  {asset.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                  <span className="rounded bg-white px-3 py-1 font-medium">
                    {getAssetTypeLabel(asset.assetType)}
                  </span>
                  <span>•</span>
                  <span>{asset.industry}</span>
                  <span>•</span>
                  <span>{asset.location}</span>
                </div>
              </div>
              {asset.status === "ACTIVE" ? (
                <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                  {asset.status}
                </span>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="px-8 py-6">
            {/* Asking Price */}
            <div className="mb-8">
              <div className="text-sm font-medium text-slate-500">
                Asking Price
              </div>
              <div className="text-4xl font-bold text-slate-900">
                {formatCurrency(asset.askingPrice)}
              </div>
            </div>

            {/* Financials */}
            {(asset.revenue || asset.ebitda) && (
              <div className="mb-8 grid gap-6 sm:grid-cols-2">
                {asset.revenue && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="text-sm font-medium text-slate-500">
                      Annual Revenue
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      {formatCurrency(asset.revenue)}
                    </div>
                  </div>
                )}
                {asset.ebitda && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="text-sm font-medium text-slate-500">
                      EBITDA
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      {formatCurrency(asset.ebitda)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div className="mb-8">
              <h2 className="mb-3 text-lg font-semibold text-slate-900">
                Description
              </h2>
              <p className="whitespace-pre-wrap text-slate-700">
                {asset.description}
              </p>
            </div>

            {/* Seller Information */}
            <div className="mb-8 rounded-lg border border-slate-200 bg-slate-50 p-6">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">
                Seller Information
              </h2>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-slate-500">Name: </span>
                  <span className="font-medium text-slate-900">
                    {asset.sellerId.name}
                  </span>
                </div>
                {asset.sellerId.company && (
                  <div>
                    <span className="text-sm text-slate-500">Company: </span>
                    <span className="font-medium text-slate-900">
                      {asset.sellerId.company}
                    </span>
                  </div>
                )}
                {asset.sellerId.location && (
                  <div>
                    <span className="text-sm text-slate-500">Location: </span>
                    <span className="font-medium text-slate-900">
                      {asset.sellerId.location}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="text-sm text-slate-500">
              Listed on {formatDate(asset.createdAt)}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 bg-slate-50 px-8 py-6">
            {canContactSeller ? (
              <button
                onClick={() => setShowContactModal(true)}
                className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-medium text-white transition-opacity hover:opacity-90"
              >
                Contact Seller
              </button>
            ) : !user ? (
              <Link
                href="/login"
                className="inline-block rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-medium text-white transition-opacity hover:opacity-90"
              >
                Login to Contact Seller
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">
              Contact Seller
            </h2>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Subject
              </label>
              <input
                type="text"
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Message
              </label>
              <textarea
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                rows={6}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Introduce yourself and explain your interest..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowContactModal(false)}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleContactSeller}
                disabled={sending}
                className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send Message"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

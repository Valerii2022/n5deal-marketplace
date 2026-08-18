"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import BuyerSidebar from "@/components/buyer/BuyerSidebar";

interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    email: string;
    company?: string;
    location?: string;
  };
  recipient: {
    id: string;
    name: string;
  };
  asset?: {
    id: string;
    title: string;
    assetType: string;
    industry: string;
    location: string;
    askingPrice: number;
  };
  subject: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export default function MessageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [message, setMessage] = useState<Message | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMessage();
  }, [params?.id]);

  const loadMessage = async () => {
    try {
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

      setCurrentUserId(authData.id);

      if (!params?.id) {
        setError("Message ID is required");
        setLoading(false);
        return;
      }

      const messageRes = await fetch(`/api/messages/${params.id}`);
      console.log({messageRes})
      if (messageRes.ok) {
        const messageData = await messageRes.json();
        setMessage(messageData.data);

        // Mark as read if current user is recipient and message is unread
        if (
          messageData.data.recipient.id === authData.id &&
          !messageData.data.read
        ) {
          await fetch(`/api/messages/${params.id}/read`, {
            method: "PATCH",
          });
        }
      } else {
        setError("Message not found");
      }

      setLoading(false);
    } catch (err) {
      setError("Failed to load message");
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
            <p className="text-sm text-slate-600">Loading message...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !message) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-600">{error || "Message not found"}</p>
            <Link
              href="/buyer/messages"
              className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700"
            >
              Back to Messages
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isRecipient = message.recipient?.id === currentUserId;
  const senderName = message.sender?.name || "Unknown";
  const recipientName = message.recipient?.name || "Unknown";
  const senderCompany = message.sender?.company;
  const senderLocation = message.sender?.location;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          <BuyerSidebar />

          <div className="flex-1">
            <div className="mb-4">
              <Link
                href="/buyer/messages"
                className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
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
                Back to Messages
              </Link>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6">
              {/* Header */}
              <div className="mb-6 border-b border-slate-200 pb-6">
                <h1 className="mb-2 text-2xl font-bold text-slate-900">
                  {message.subject}
                </h1>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>
                    {new Date(message.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {!message.read && isRecipient && (
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                      New
                    </span>
                  )}
                </div>
              </div>

              {/* Sender Info */}
              <div className="mb-6 rounded-lg bg-slate-50 p-4">
                <div className="text-sm font-medium text-slate-500">
                  {isRecipient ? "From" : "To"}
                </div>
                <div className="mt-1 font-medium text-slate-900">
                  {isRecipient ? senderName : recipientName}
                </div>
                {isRecipient && senderCompany && (
                  <div className="text-sm text-slate-600">
                    {senderCompany}
                  </div>
                )}
                {isRecipient && senderLocation && (
                  <div className="text-sm text-slate-500">
                    {senderLocation}
                  </div>
                )}
              </div>

              {/* Asset Reference */}
              {message.asset && (
                <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-2 text-sm font-medium text-slate-500">
                    Regarding Asset
                  </div>
                  <Link
                    href={`/marketplace/${message.asset.id}`}
                    className="block hover:bg-white rounded-lg p-3 transition-colors"
                  >
                    <div className="font-medium text-slate-900">
                      {message.asset.title}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="rounded bg-slate-100 px-2 py-0.5">
                        {message.asset.assetType}
                      </span>
                      <span>•</span>
                      <span>{message.asset.industry}</span>
                      <span>•</span>
                      <span>{message.asset.location}</span>
                    </div>
                    <div className="mt-2 text-sm font-semibold text-slate-900">
                      ${message.asset.askingPrice.toLocaleString()}
                    </div>
                  </Link>
                </div>
              )}

              {/* Message Body */}
              <div className="mb-6">
                <div className="mb-2 text-sm font-medium text-slate-500">
                  Message
                </div>
                <div className="whitespace-pre-wrap text-slate-700">
                  {message.body}
                </div>
              </div>

              {/* Actions */}
              {isRecipient && message.asset && (
                <div className="border-t border-slate-200 pt-6">
                  <Link
                    href={`/marketplace/${message.asset.id}`}
                    className="inline-block rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    View Asset Details
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

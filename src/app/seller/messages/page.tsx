"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import SellerSidebar from "@/components/seller/SellerSidebar";

interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    company?: string;
  };
  recipient: {
    id: string;
    name: string;
    company?: string;
  };
  asset?: {
    id: string;
    title: string;
  } | null;
  subject: string;
  body: string;
  read: boolean;
  createdAt: string;
}

interface MessagesResponse {
  data: Message[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function SellerMessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<MessagesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
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

      const messagesRes = await fetch("/api/messages?limit=50");
      if (messagesRes.ok) {
        const messagesData = await messagesRes.json();
        setMessages(messagesData);
      }

      setLoading(false);
    } catch (err) {
      setError("Failed to load messages");
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
            <p className="text-sm text-slate-600">Loading messages...</p>
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
            <h1 className="mb-6 text-2xl font-bold text-slate-900">Messages</h1>

            <div className="rounded-lg border border-slate-200 bg-white p-6">
              {messages && messages.data.length > 0 ? (
                <div className="space-y-2">
                  {messages.data.map((message) => {
                    const senderName = message.sender?.name || "Unknown";
                    const senderCompany = message.sender?.company;
                    const assetTitle = message.asset?.title;

                    return (
                      <Link
                        key={message.id}
                        href={`/seller/messages/${message.id}`}
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
                                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                                  New
                                </span>
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
                            <div className="mt-2 text-sm text-slate-500 line-clamp-2">
                              {message.body}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="text-xs text-slate-400 whitespace-nowrap">
                              {new Date(message.createdAt).toLocaleDateString()}
                            </div>
                            <svg
                              className="h-5 w-5 text-slate-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center">
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-slate-900">
                    No messages
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    You haven't received any messages yet
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

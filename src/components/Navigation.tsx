"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User } from "@/types/client";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setUser(data || null);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
              <span className="text-xl font-bold text-white">N5</span>
            </div>
            <span className="text-xl font-semibold text-slate-900">
              N5Deal
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link
              href="/marketplace"
              className={`text-sm font-medium transition-colors ${
                pathname?.startsWith("/marketplace")
                  ? "text-blue-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Marketplace
            </Link>

            {!loading && (
              <>
                {user ? (
                  <>
                    <Link
                      href="/messages"
                      className={`text-sm font-medium transition-colors ${
                        pathname === "/messages"
                          ? "text-blue-600"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Messages
                    </Link>

                    {user.role === "BUYER" && (
                      <Link
                        href="/buyer/dashboard"
                        className={`text-sm font-medium transition-colors ${
                          pathname?.startsWith("/buyer")
                            ? "text-blue-600"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Dashboard
                      </Link>
                    )}

                    {user.role === "SELLER" && (
                      <Link
                        href="/seller/dashboard"
                        className={`text-sm font-medium transition-colors ${
                          pathname?.startsWith("/seller")
                            ? "text-blue-600"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Dashboard
                      </Link>
                    )}

                    {user.role === "MANAGER" && (
                      <Link
                        href="/manager/dashboard"
                        className={`text-sm font-medium transition-colors ${
                          pathname?.startsWith("/manager")
                            ? "text-blue-600"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Manager
                      </Link>
                    )}

                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-600">
                        {user.name}
                      </span>
                      <button
                        onClick={handleLogout}
                        className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                  >
                    Login
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

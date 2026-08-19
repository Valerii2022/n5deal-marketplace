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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const checkAuth = () => {
    setLoading(true);
    fetch("/api/auth/me", {
      credentials: 'same-origin',
      cache: 'no-store'
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setUser(data || null);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  };

  // Check auth on mount only
  useEffect(() => {
    checkAuth();
  }, []);

  // Re-check auth when pathname changes, but with a small delay to ensure cookie is available
  useEffect(() => {
    const timer = setTimeout(() => {
      checkAuth();
    }, 100);
    return () => clearTimeout(timer);
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setMobileMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link 
            href={
              user?.role === "BUYER"
                ? "/buyer/dashboard"
                : user?.role === "SELLER"
                ? "/seller/dashboard"
                : user?.role === "MANAGER"
                ? "/manager/dashboard"
                : "/"
            }
            className="flex items-center gap-2 flex-shrink-0"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
              <span className="text-xl font-bold text-white">N5</span>
            </div>
            <span className="hidden sm:inline text-xl font-semibold text-slate-900">
              N5Deal
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
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
                    {(user.role === "BUYER" || user.role === "SELLER") && (
                      <Link
                        href={
                          user.role === "BUYER"
                            ? "/buyer/messages"
                            : "/seller/messages"
                        }
                        className={`text-sm font-medium transition-colors ${
                          pathname?.includes("/messages")
                            ? "text-blue-600"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Messages
                      </Link>
                    )}

                    {user.role === "BUYER" && (
                      <Link
                        href="/buyer/dashboard"
                        className={`text-sm font-medium transition-colors ${
                          pathname === "/buyer/dashboard" || pathname === "/buyer/profile"
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
                          pathname === "/seller/dashboard" || pathname === "/seller/profile" || pathname === "/seller/listings" || pathname === "/seller/listings/new" || pathname === "/seller/buyers"
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
                      <span className="text-sm font-bold text-slate-950 border-l border-slate-300 pl-4">
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
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    Login
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {!loading && !user && (
              <Link
                href="/login"
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white"
              >
                Login
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-4">
            <div className="flex flex-col space-y-3">
              <Link
                href="/marketplace"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-medium px-2 py-1 ${
                  pathname?.startsWith("/marketplace")
                    ? "text-blue-600"
                    : "text-slate-600"
                }`}
              >
                Marketplace
              </Link>

              {!loading && user && (
                <>
                  {(user.role === "BUYER" || user.role === "SELLER") && (
                    <Link
                      href={
                        user.role === "BUYER"
                          ? "/buyer/messages"
                          : "/seller/messages"
                      }
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-sm font-medium px-2 py-1 ${
                        pathname?.includes("/messages")
                          ? "text-blue-600"
                          : "text-slate-600"
                      }`}
                    >
                      Messages
                    </Link>
                  )}

                  {user.role === "BUYER" && (
                    <Link
                      href="/buyer/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-sm font-medium px-2 py-1 ${
                        pathname === "/buyer/dashboard" || pathname === "/buyer/profile"
                          ? "text-blue-600"
                          : "text-slate-600"
                      }`}
                    >
                      Dashboard
                    </Link>
                  )}

                  {user.role === "SELLER" && (
                    <Link
                      href="/seller/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-sm font-medium px-2 py-1 ${
                        pathname === "/seller/dashboard" || pathname === "/seller/profile" || pathname === "/seller/listings" || pathname === "/seller/listings/new" || pathname === "/seller/buyers"
                          ? "text-blue-600"
                          : "text-slate-600"
                      }`}
                    >
                      Dashboard
                    </Link>
                  )}

                  {user.role === "MANAGER" && (
                    <Link
                      href="/manager/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-sm font-medium px-2 py-1 ${
                        pathname?.startsWith("/manager")
                          ? "text-blue-600"
                          : "text-slate-600"
                      }`}
                    >
                      Manager
                    </Link>
                  )}

                  <div className="border-t border-slate-200 pt-3 mt-2">
                    <div className="text-sm font-bold text-slate-950 px-2 mb-2">
                      {user.name}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left rounded-lg bg-slate-100 px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

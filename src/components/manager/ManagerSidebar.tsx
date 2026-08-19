"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ManagerSidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Dashboard",
      href: "/manager/dashboard",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: "Users",
      href: "/manager/users",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      name: "Assets",
      href: "/manager/assets",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      name: "Marketplace",
      href: "/marketplace",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden mb-4">
        <div className="rounded-lg border border-slate-200 bg-white p-2">
          <div className="flex gap-2 overflow-x-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {item.icon}
                  <span className="hidden sm:inline">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

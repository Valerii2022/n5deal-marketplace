"use client";

import { useState, useEffect } from "react";
import { AssetType, AssetStatus } from "@/types";

interface FilterState {
  assetType: string;
  industry: string;
  location: string;
  status: string;
  minPrice: string;
  maxPrice: string;
}

interface AssetFiltersProps {
  filters: FilterState;
  activeCount: number;
  onApply: (filters: FilterState) => void;
  onReset: () => void;
}

export default function AssetFilters({ filters: initialFilters, activeCount, onApply, onReset }: AssetFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  // Only sync with parent filters when the panel is CLOSED
  // This prevents parent state changes from destroying draft edits while user is editing
  useEffect(() => {
    if (!isOpen) {
      setFilters(initialFilters);
    }
  }, [initialFilters, isOpen]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isMobile]);

  const handleApply = () => {
    onApply(filters);
    setIsOpen(false);
  };

  const handleReset = () => {
    const emptyFilters = {
      assetType: "",
      industry: "",
      location: "",
      status: "",
      minPrice: "",
      maxPrice: "",
    };
    setFilters(emptyFilters);
    onReset();
    setIsOpen(false);
  };

  const filterContent = (
    <div className="space-y-4">
      {/* Asset Type */}
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Asset Type
        </label>
        <select
          value={filters.assetType}
          onChange={(e) =>
            setFilters({ ...filters, assetType: e.target.value })
          }
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          <option value={AssetType.BUSINESS}>Business</option>
          <option value={AssetType.REAL_ESTATE}>Real Estate</option>
          <option value={AssetType.EQUITY}>Equity</option>
          <option value={AssetType.OTHER}>Other</option>
        </select>
      </div>

      {/* Industry */}
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Industry
        </label>
        <input
          type="text"
          value={filters.industry}
          onChange={(e) =>
            setFilters({ ...filters, industry: e.target.value })
          }
          placeholder="e.g., Technology"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Location */}
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Location
        </label>
        <input
          type="text"
          value={filters.location}
          onChange={(e) =>
            setFilters({ ...filters, location: e.target.value })
          }
          placeholder="e.g., Boston"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Status */}
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Status
        </label>
        <select
          value={filters.status}
          onChange={(e) =>
            setFilters({ ...filters, status: e.target.value })
          }
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value={AssetStatus.ACTIVE}>Active</option>
          <option value={AssetStatus.SUSPENDED}>Suspended</option>
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Price Range
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) =>
              setFilters({ ...filters, minPrice: e.target.value })
            }
            placeholder="Min"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) =>
              setFilters({ ...filters, maxPrice: e.target.value })
            }
            placeholder="Max"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
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
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        Filters
        {activeCount > 0 && (
          <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
            {activeCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Desktop Popover */}
          {!isMobile && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
              />
              <div className="absolute right-0 z-50 mt-2 w-80 rounded-lg border border-slate-200 bg-white p-6 shadow-xl">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">
                  Filter Assets
                </h3>

                {filterContent}

                {/* Actions */}
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={handleReset}
                    className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleApply}
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Mobile Drawer */}
          {isMobile && (
            <div className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-slate-200 bg-white shadow-2xl">
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Filter Assets
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                {filterContent}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 z-10 flex gap-3 border-t border-slate-200 bg-white p-4">
                <button
                  onClick={handleReset}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Reset
                </button>
                <button
                  onClick={handleApply}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

import Link from "next/link";
import { Asset } from "@/types/client";
import { formatCurrency, formatDate } from "@/lib/format";

interface AssetCardProps {
  asset: Asset;
}

export default function AssetCard({ asset }: AssetCardProps) {
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

  const getStatusBadge = (status: string) => {
    if (status === "ACTIVE") {
      return (
        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
        {status}
      </span>
    );
  };

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition-shadow hover:shadow-lg">
      <div className="flex flex-1 flex-col p-4">
        {/* Header */}
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="mb-1 text-lg font-semibold text-slate-900 line-clamp-2 group-hover:text-blue-600">
              {asset.title}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
              <span className="rounded bg-slate-100 px-2 py-0.5 font-medium">
                {getAssetTypeLabel(asset.assetType)}
              </span>
              <span>•</span>
              <span className="truncate">{asset.industry}</span>
              <span>•</span>
              <span className="truncate">{asset.location}</span>
            </div>
          </div>
          {getStatusBadge(asset.status)}
        </div>

        {/* Description */}
        <p className="mb-3 text-sm text-slate-600 line-clamp-2">
          {asset.description}
        </p>

        {/* Asking Price - Primary Metric */}
        <div className="mb-3">
          <div className="text-xs font-medium text-slate-500 mb-0.5">
            Asking Price
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {formatCurrency(asset.askingPrice)}
          </div>
        </div>

        {/* Financials */}
        {(asset.revenue || asset.ebitda) && (
          <div className="mb-3 flex gap-4 text-xs border-t border-slate-100 pt-2">
            {asset.revenue && (
              <div>
                <span className="text-slate-500">Revenue: </span>
                <span className="font-semibold text-slate-700">
                  {formatCurrency(asset.revenue)}
                </span>
              </div>
            )}
            {asset.ebitda && (
              <div>
                <span className="text-slate-500">EBITDA: </span>
                <span className="font-semibold text-slate-700">
                  {formatCurrency(asset.ebitda)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Seller Info */}
        <div className="mb-3 border-t border-slate-100 pt-2">
          <div className="text-xs text-slate-500">Listed by</div>
          <div className="font-medium text-slate-900 text-sm">
            {asset.sellerId.name}
          </div>
          {asset.sellerId.company && (
            <div className="text-xs text-slate-600">
              {asset.sellerId.company}
            </div>
          )}
        </div>

        {/* Footer - pushed to bottom */}
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-xs text-slate-400">
            {formatDate(asset.createdAt)}
          </span>
          <Link
            href={`/marketplace/${asset._id}`}
            className="whitespace-nowrap rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

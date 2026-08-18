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
        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
        {status}
      </span>
    );
  };

  return (
    <div className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white transition-all hover:border-blue-300 hover:shadow-md">
      <div className="p-5">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="mb-1 text-lg font-semibold text-slate-900 line-clamp-2 group-hover:text-blue-600">
              {asset.title}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="rounded bg-slate-100 px-2 py-0.5 font-medium">
                {getAssetTypeLabel(asset.assetType)}
              </span>
              <span>•</span>
              <span>{asset.industry}</span>
              <span>•</span>
              <span>{asset.location}</span>
            </div>
          </div>
          {getStatusBadge(asset.status)}
        </div>

        {/* Description */}
        <p className="mb-4 text-sm text-slate-600 line-clamp-2">
          {asset.description}
        </p>

        {/* Financials */}
        <div className="mb-4 space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-medium text-slate-500">
              Asking Price:
            </span>
            <span className="text-xl font-bold text-slate-900">
              {formatCurrency(asset.askingPrice)}
            </span>
          </div>

          {(asset.revenue || asset.ebitda) && (
            <div className="flex flex-wrap gap-4 text-xs">
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
        </div>

        {/* Seller Info */}
        <div className="mb-4 rounded-md bg-slate-50 p-3">
          <div className="text-xs text-slate-500">Listed by</div>
          <div className="font-medium text-slate-900">
            {asset.sellerId.name}
          </div>
          {asset.sellerId.company && (
            <div className="text-sm text-slate-600">
              {asset.sellerId.company}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Listed {formatDate(asset.createdAt)}
          </span>
          <Link
            href={`/marketplace/${asset._id}`}
            className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

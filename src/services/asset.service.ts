import connectDB from "@/lib/db";
import { Asset } from "@/models";
import { AssetType, AssetStatus, UserRole } from "@/types";
import { Types } from "mongoose";

export interface AssetFilters {
  search?: string;
  assetType?: AssetType;
  industry?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface AssetPagination {
  page: number;
  limit: number;
  sort?: "newest" | "price_asc" | "price_desc";
}

export interface CreateAssetData {
  sellerId: string;
  title: string;
  description: string;
  assetType: AssetType;
  industry: string;
  location: string;
  askingPrice: number;
  revenue?: number;
  ebitda?: number;
}

export interface UpdateAssetData {
  title?: string;
  description?: string;
  assetType?: AssetType;
  industry?: string;
  location?: string;
  askingPrice?: number;
  revenue?: number;
  ebitda?: number;
  status?: AssetStatus;
}

/**
 * List assets with filters, search, and pagination
 */
export async function listAssets(
  filters: AssetFilters,
  pagination: AssetPagination,
  userRole: UserRole
) {
  await connectDB();

  // Build query
  const query: Record<string, unknown> = {};

  // Only show ACTIVE assets to buyers and sellers
  if (userRole !== UserRole.MANAGER) {
    query.status = AssetStatus.ACTIVE;
  }

  // Text search across multiple fields
  if (filters.search) {
    const searchRegex = new RegExp(filters.search, "i");
    query.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { industry: searchRegex },
      { location: searchRegex },
    ];
  }

  // Exact match filters
  if (filters.assetType) {
    query.assetType = filters.assetType;
  }

  if (filters.industry) {
    query.industry = new RegExp(`^${filters.industry}$`, "i");
  }

  if (filters.location) {
    query.location = new RegExp(filters.location, "i");
  }

  // Price range filters
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    query.askingPrice = {};
    if (filters.minPrice !== undefined) {
      (query.askingPrice as Record<string, number>).$gte = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      (query.askingPrice as Record<string, number>).$lte = filters.maxPrice;
    }
  }

  // Determine sort order
  let sort: Record<string, 1 | -1> = { createdAt: -1 }; // Default: newest first
  if (pagination.sort === "price_asc") {
    sort = { askingPrice: 1 };
  } else if (pagination.sort === "price_desc") {
    sort = { askingPrice: -1 };
  }

  // Calculate pagination
  const skip = (pagination.page - 1) * pagination.limit;

  // Execute query with pagination
  const [assets, total] = await Promise.all([
    Asset.find(query)
      .populate("sellerId", "name email company location")
      .sort(sort)
      .skip(skip)
      .limit(pagination.limit)
      .lean(),
    Asset.countDocuments(query),
  ]);

  return {
    data: assets,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit),
    },
  };
}

/**
 * Get a single asset by ID
 */
export async function getAssetById(id: string, userRole: UserRole) {
  await connectDB();

  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  const asset = await Asset.findById(id)
    .populate("sellerId", "name email company location")
    .lean();

  if (!asset) {
    return null;
  }

  // Only managers can view suspended assets
  if (asset.status === AssetStatus.SUSPENDED && userRole !== UserRole.MANAGER) {
    return null;
  }

  return asset;
}

/**
 * Create a new asset
 */
export async function createAsset(data: CreateAssetData) {
  await connectDB();

  const asset = await Asset.create({
    ...data,
    status: AssetStatus.ACTIVE,
  });

  return asset.toObject();
}

/**
 * Update an asset
 */
export async function updateAsset(
  id: string,
  data: UpdateAssetData,
  userId: string,
  userRole: UserRole
) {
  await connectDB();

  if (!Types.ObjectId.isValid(id)) {
    return { error: "Invalid asset ID", status: 400 };
  }

  const asset = await Asset.findById(id);

  if (!asset) {
    return { error: "Asset not found", status: 404 };
  }

  // Authorization check
  if (userRole === UserRole.SELLER) {
    // Sellers can only update their own assets
    if (asset.sellerId.toString() !== userId) {
      return { error: "Insufficient permissions", status: 403 };
    }

    // Sellers cannot change status to SUSPENDED
    if (data.status === AssetStatus.SUSPENDED) {
      return { error: "Sellers cannot suspend assets", status: 403 };
    }
  }

  // Update allowed fields
  if (data.title !== undefined) asset.title = data.title;
  if (data.description !== undefined) asset.description = data.description;
  if (data.assetType !== undefined) asset.assetType = data.assetType;
  if (data.industry !== undefined) asset.industry = data.industry;
  if (data.location !== undefined) asset.location = data.location;
  if (data.askingPrice !== undefined) asset.askingPrice = data.askingPrice;
  if (data.revenue !== undefined) asset.revenue = data.revenue;
  if (data.ebitda !== undefined) asset.ebitda = data.ebitda;
  if (data.status !== undefined && userRole === UserRole.MANAGER) {
    asset.status = data.status;
  }

  await asset.save();

  return { data: asset.toObject() };
}

/**
 * Soft delete an asset (set status to SUSPENDED)
 */
export async function deleteAsset(
  id: string,
  userId: string,
  userRole: UserRole
) {
  await connectDB();

  if (!Types.ObjectId.isValid(id)) {
    return { error: "Invalid asset ID", status: 400 };
  }

  const asset = await Asset.findById(id);

  if (!asset) {
    return { error: "Asset not found", status: 404 };
  }

  // Authorization check
  if (userRole === UserRole.SELLER) {
    // Sellers can only suspend their own assets
    if (asset.sellerId.toString() !== userId) {
      return { error: "Insufficient permissions", status: 403 };
    }
  } else if (userRole === UserRole.BUYER) {
    return { error: "Insufficient permissions", status: 403 };
  }

  // Soft delete by setting status to SUSPENDED
  asset.status = AssetStatus.SUSPENDED;
  await asset.save();

  return { data: asset.toObject() };
}

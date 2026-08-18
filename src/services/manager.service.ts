import connectDB from "@/lib/db";
import { User, Asset } from "@/models";
import { UserRole, UserStatus, AssetType, AssetStatus } from "@/types";
import { Types } from "mongoose";

export interface UserFilters {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface AssetFilters {
  search?: string;
  assetType?: AssetType;
  industry?: string;
  status?: AssetStatus;
}

export interface Pagination {
  page: number;
  limit: number;
}

export interface SafeManagerUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  company?: string;
  location?: string;
  bio?: string;
  industries: string[];
  investmentRange?: {
    min: number;
    max: number;
  };
  acquisitionTypes: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SafeManagerAsset {
  id: string;
  seller: {
    id: string;
    name: string;
    email: string;
    company?: string;
    location?: string;
  };
  title: string;
  description: string;
  assetType: AssetType;
  industry: string;
  location: string;
  askingPrice: number;
  revenue?: number;
  ebitda?: number;
  status: AssetStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * List users for manager dashboard
 */
export async function getManagerUsers(
  filters: UserFilters,
  pagination: Pagination
) {
  await connectDB();

  // Build query
  const query: Record<string, unknown> = {};

  // Text search
  if (filters.search) {
    const searchRegex = new RegExp(filters.search, "i");
    query.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { company: searchRegex },
      { location: searchRegex },
    ];
  }

  // Role filter
  if (filters.role) {
    query.role = filters.role;
  }

  // Status filter
  if (filters.status) {
    query.status = filters.status;
  }

  // Calculate pagination
  const skip = (pagination.page - 1) * pagination.limit;

  // Execute query
  const [users, total] = await Promise.all([
    User.find(query)
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pagination.limit)
      .lean(),
    User.countDocuments(query),
  ]);

  // Transform to safe users
  const safeUsers: SafeManagerUser[] = users.map((user) => ({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    company: user.company,
    location: user.location,
    bio: user.bio,
    industries: user.industries || [],
    investmentRange: user.investmentRange,
    acquisitionTypes: user.acquisitionTypes || [],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }));

  return {
    data: safeUsers,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit),
    },
  };
}

/**
 * Update user status (suspend/activate)
 */
export async function updateUserStatus(
  managerId: string,
  targetUserId: string,
  status: UserStatus
): Promise<{
  success: boolean;
  user?: SafeManagerUser;
  error?: string;
  statusCode?: number;
}> {
  await connectDB();

  // Validate ObjectId
  if (!Types.ObjectId.isValid(targetUserId)) {
    return { success: false, error: "Invalid user ID", statusCode: 400 };
  }

  // Manager cannot modify their own status
  if (targetUserId === managerId) {
    return {
      success: false,
      error: "Cannot modify your own account status",
      statusCode: 400,
    };
  }

  // Find target user
  const user = await User.findById(targetUserId);

  if (!user) {
    return { success: false, error: "User not found", statusCode: 404 };
  }

  // Update status
  user.status = status;
  await user.save();

  // Return safe user
  const safeUser: SafeManagerUser = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    company: user.company,
    location: user.location,
    bio: user.bio,
    industries: user.industries || [],
    investmentRange: user.investmentRange,
    acquisitionTypes: user.acquisitionTypes || [],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return { success: true, user: safeUser };
}

/**
 * List assets for manager dashboard
 */
export async function getManagerAssets(
  filters: AssetFilters,
  pagination: Pagination
) {
  await connectDB();

  // Build query
  const query: Record<string, unknown> = {};

  // Text search
  if (filters.search) {
    const searchRegex = new RegExp(filters.search, "i");
    query.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { industry: searchRegex },
      { location: searchRegex },
    ];
  }

  // AssetType filter
  if (filters.assetType) {
    query.assetType = filters.assetType;
  }

  // Industry filter
  if (filters.industry) {
    query.industry = new RegExp(`^${filters.industry}$`, "i");
  }

  // Status filter
  if (filters.status) {
    query.status = filters.status;
  }

  // Calculate pagination
  const skip = (pagination.page - 1) * pagination.limit;

  // Execute query
  const [assets, total] = await Promise.all([
    Asset.find(query)
      .populate("sellerId", "name email company location")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pagination.limit)
      .lean(),
    Asset.countDocuments(query),
  ]);

  // Transform to safe assets
  const safeAssets: SafeManagerAsset[] = assets.map((asset) => {
    const seller = asset.sellerId as any;
    return {
      id: asset._id.toString(),
      seller: {
        id: seller._id.toString(),
        name: seller.name,
        email: seller.email,
        company: seller.company,
        location: seller.location,
      },
      title: asset.title,
      description: asset.description,
      assetType: asset.assetType,
      industry: asset.industry,
      location: asset.location,
      askingPrice: asset.askingPrice,
      revenue: asset.revenue,
      ebitda: asset.ebitda,
      status: asset.status,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
    };
  });

  return {
    data: safeAssets,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit),
    },
  };
}

/**
 * Update asset status (suspend/activate)
 */
export async function updateAssetStatus(
  targetAssetId: string,
  status: AssetStatus
): Promise<{
  success: boolean;
  asset?: SafeManagerAsset;
  error?: string;
  statusCode?: number;
}> {
  await connectDB();

  // Validate ObjectId
  if (!Types.ObjectId.isValid(targetAssetId)) {
    return { success: false, error: "Invalid asset ID", statusCode: 400 };
  }

  // Find asset
  const asset = await Asset.findById(targetAssetId);

  if (!asset) {
    return { success: false, error: "Asset not found", statusCode: 404 };
  }

  // Update status
  asset.status = status;
  await asset.save();

  // Populate seller for response
  await asset.populate("sellerId", "name email company location");

  // Return safe asset
  const safeAsset: SafeManagerAsset = {
    id: asset._id.toString(),
    seller: {
      id: (asset.sellerId as any)._id.toString(),
      name: (asset.sellerId as any).name,
      email: (asset.sellerId as any).email,
      company: (asset.sellerId as any).company,
      location: (asset.sellerId as any).location,
    },
    title: asset.title,
    description: asset.description,
    assetType: asset.assetType,
    industry: asset.industry,
    location: asset.location,
    askingPrice: asset.askingPrice,
    revenue: asset.revenue,
    ebitda: asset.ebitda,
    status: asset.status,
    createdAt: asset.createdAt,
    updatedAt: asset.updatedAt,
  };

  return { success: true, asset: safeAsset };
}

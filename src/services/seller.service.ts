import connectDB from "@/lib/db";
import { User } from "@/models";
import { UserRole, UserStatus } from "@/types";

export interface UpdateSellerProfileData {
  name?: string;
  company?: string;
  location?: string;
  bio?: string;
  industries?: string[];
}

export interface SafeSellerProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  company?: string;
  location?: string;
  bio?: string;
  industries: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SafeBuyerListItem {
  id: string;
  name: string;
  email: string;
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
}

export interface BuyerFilters {
  search?: string;
  industry?: string;
  location?: string;
  minInvestment?: number;
  maxInvestment?: number;
  acquisitionType?: string;
}

export interface BuyerPagination {
  page: number;
  limit: number;
}

/**
 * Get seller profile by user ID
 */
export async function getSellerProfile(
  userId: string
): Promise<SafeSellerProfile | null> {
  await connectDB();

  const user = await User.findById(userId).lean();

  if (!user || user.role !== UserRole.SELLER) {
    return null;
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    company: user.company,
    location: user.location,
    bio: user.bio,
    industries: user.industries || [],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Update seller profile
 */
export async function updateSellerProfile(
  userId: string,
  data: UpdateSellerProfileData
): Promise<SafeSellerProfile | null> {
  await connectDB();

  const user = await User.findById(userId);

  if (!user || user.role !== UserRole.SELLER) {
    return null;
  }

  // Update allowed fields
  if (data.name !== undefined) {
    user.name = data.name.trim();
  }

  if (data.company !== undefined) {
    user.company = data.company.trim() || undefined;
  }

  if (data.location !== undefined) {
    user.location = data.location.trim() || undefined;
  }

  if (data.bio !== undefined) {
    user.bio = data.bio.trim() || undefined;
  }

  if (data.industries !== undefined) {
    user.industries = data.industries.map((industry) => industry.trim());
  }

  await user.save();

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    company: user.company,
    location: user.location,
    bio: user.bio,
    industries: user.industries || [],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * List buyers for seller directory with filters and pagination
 */
export async function listBuyers(
  filters: BuyerFilters,
  pagination: BuyerPagination
) {
  await connectDB();

  // Build query
  const query: Record<string, unknown> = {
    role: UserRole.BUYER,
    status: UserStatus.ACTIVE,
  };

  // Text search across multiple fields
  if (filters.search) {
    const searchRegex = new RegExp(filters.search, "i");
    query.$or = [
      { name: searchRegex },
      { company: searchRegex },
      { bio: searchRegex },
      { industries: searchRegex },
    ];
  }

  // Industry filter
  if (filters.industry) {
    query.industries = new RegExp(filters.industry, "i");
  }

  // Location filter
  if (filters.location) {
    query.location = new RegExp(filters.location, "i");
  }

  // Investment range filters
  if (filters.minInvestment !== undefined) {
    query["investmentRange.max"] = { $gte: filters.minInvestment };
  }

  if (filters.maxInvestment !== undefined) {
    if (query["investmentRange.min"]) {
      (query["investmentRange.min"] as Record<string, number>).$lte = filters.maxInvestment;
    } else {
      query["investmentRange.min"] = { $lte: filters.maxInvestment };
    }
  }

  // Acquisition type filter
  if (filters.acquisitionType) {
    query.acquisitionTypes = new RegExp(`^${filters.acquisitionType}$`, "i");
  }

  // Calculate pagination
  const skip = (pagination.page - 1) * pagination.limit;

  // Execute query with pagination
  const [buyers, total] = await Promise.all([
    User.find(query)
      .select("-passwordHash -role -status -updatedAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pagination.limit)
      .lean(),
    User.countDocuments(query),
  ]);

  // Transform to safe buyer list items
  const safeBuyers: SafeBuyerListItem[] = buyers.map((buyer) => ({
    id: buyer._id.toString(),
    name: buyer.name,
    email: buyer.email,
    company: buyer.company,
    location: buyer.location,
    bio: buyer.bio,
    industries: buyer.industries || [],
    investmentRange: buyer.investmentRange,
    acquisitionTypes: buyer.acquisitionTypes || [],
    createdAt: buyer.createdAt,
  }));

  return {
    data: safeBuyers,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit),
    },
  };
}

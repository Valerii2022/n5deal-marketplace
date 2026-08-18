import connectDB from "@/lib/db";
import { User } from "@/models";
import { UserRole, UserStatus, InvestmentRange } from "@/types";

export interface UpdateBuyerProfileData {
  name?: string;
  company?: string;
  location?: string;
  bio?: string;
  industries?: string[];
  investmentRange?: InvestmentRange;
  acquisitionTypes?: string[];
}

export interface SafeBuyerProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  company?: string;
  location?: string;
  bio?: string;
  industries: string[];
  investmentRange?: InvestmentRange;
  acquisitionTypes: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get buyer profile by user ID
 */
export async function getBuyerProfile(
  userId: string
): Promise<SafeBuyerProfile | null> {
  await connectDB();

  const user = await User.findById(userId).lean();

  if (!user || user.role !== UserRole.BUYER) {
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
    investmentRange: user.investmentRange,
    acquisitionTypes: user.acquisitionTypes || [],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Update buyer profile
 */
export async function updateBuyerProfile(
  userId: string,
  data: UpdateBuyerProfileData
): Promise<SafeBuyerProfile | null> {
  await connectDB();

  const user = await User.findById(userId);

  if (!user || user.role !== UserRole.BUYER) {
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

  if (data.investmentRange !== undefined) {
    user.investmentRange = data.investmentRange;
  }

  if (data.acquisitionTypes !== undefined) {
    user.acquisitionTypes = data.acquisitionTypes.map((type) => type.trim());
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
    investmentRange: user.investmentRange,
    acquisitionTypes: user.acquisitionTypes || [],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

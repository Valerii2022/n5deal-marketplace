import { AssetType, AssetStatus, UserRole } from "./index";

export interface Asset {
  _id: string;
  sellerId: {
    _id: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface AssetsResponse {
  data: Asset[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: string;
  company?: string;
  location?: string;
}

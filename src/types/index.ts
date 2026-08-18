export enum UserRole {
  BUYER = "BUYER",
  SELLER = "SELLER",
  MANAGER = "MANAGER",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
}

export enum AssetStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
}

export enum AssetType {
  BUSINESS = "BUSINESS",
  REAL_ESTATE = "REAL_ESTATE",
  EQUITY = "EQUITY",
  OTHER = "OTHER",
}

export interface InvestmentRange {
  min: number;
  max: number;
}

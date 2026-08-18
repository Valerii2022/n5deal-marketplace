import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { AssetType, AssetStatus } from "@/types";

export interface IAsset extends Document {
  sellerId: Types.ObjectId;
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

const AssetSchema = new Schema<IAsset>(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Seller ID is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    assetType: {
      type: String,
      enum: Object.values(AssetType),
      required: [true, "Asset type is required"],
    },
    industry: {
      type: String,
      required: [true, "Industry is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    askingPrice: {
      type: Number,
      required: [true, "Asking price is required"],
      min: [0, "Asking price must be positive"],
      index: true,
    },
    revenue: {
      type: Number,
      min: [0, "Revenue must be positive"],
    },
    ebitda: {
      type: Number,
    },
    status: {
      type: String,
      enum: Object.values(AssetStatus),
      required: [true, "Status is required"],
      default: AssetStatus.ACTIVE,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for common queries
AssetSchema.index({ status: 1, assetType: 1, createdAt: -1 });
AssetSchema.index({ status: 1, industry: 1, createdAt: -1 });

const Asset: Model<IAsset> =
  mongoose.models.Asset || mongoose.model<IAsset>("Asset", AssetSchema);

export default Asset;

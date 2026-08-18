import mongoose, { Schema, Document, Model } from "mongoose";
import { UserRole, UserStatus, InvestmentRange } from "@/types";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
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

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: [true, "Role is required"],
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      required: [true, "Status is required"],
      default: UserStatus.ACTIVE,
      index: true,
    },
    company: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    industries: {
      type: [String],
      default: [],
    },
    investmentRange: {
      min: {
        type: Number,
      },
      max: {
        type: Number,
      },
    },
    acquisitionTypes: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;

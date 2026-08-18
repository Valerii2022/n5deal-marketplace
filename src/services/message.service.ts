import connectDB from "@/lib/db";
import { Message, User, Asset } from "@/models";
import { UserRole, UserStatus, AssetStatus } from "@/types";
import { Types } from "mongoose";

export interface CreateMessageData {
  senderId: string;
  recipientId: string;
  assetId?: string;
  subject: string;
  body: string;
}

export interface SafeMessageResponse {
  id: string;
  sender: {
    id: string;
    name: string;
    company?: string;
  };
  recipient: {
    id: string;
    name: string;
    company?: string;
  };
  asset?: {
    id: string;
    title: string;
  } | null;
  subject: string;
  body: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageFilters {
  folder?: "inbox" | "sent" | "all";
  unread?: boolean;
}

export interface MessagePagination {
  page: number;
  limit: number;
}

/**
 * Validate recipient for messaging
 */
export async function validateRecipient(
  recipientId: string,
  senderId: string,
  senderRole: UserRole
): Promise<{ valid: boolean; error?: string; status?: number }> {
  await connectDB();

  // Check if trying to message self
  if (recipientId === senderId) {
    return { valid: false, error: "Cannot send message to yourself", status: 400 };
  }

  // Validate ObjectId
  if (!Types.ObjectId.isValid(recipientId)) {
    return { valid: false, error: "Invalid recipient ID", status: 400 };
  }

  // Find recipient
  const recipient = await User.findById(recipientId).lean();

  if (!recipient) {
    return { valid: false, error: "Recipient not found", status: 404 };
  }

  // Check if recipient is active
  if (recipient.status !== UserStatus.ACTIVE) {
    return { valid: false, error: "Recipient is not available", status: 403 };
  }

  // Check if recipient is MANAGER
  if (recipient.role === UserRole.MANAGER) {
    return { valid: false, error: "Messaging is only available between buyers and sellers", status: 403 };
  }

  // Check role compatibility
  if (senderRole === UserRole.BUYER && recipient.role !== UserRole.SELLER) {
    return { valid: false, error: "Messaging is only available between buyers and sellers", status: 403 };
  }

  if (senderRole === UserRole.SELLER && recipient.role !== UserRole.BUYER) {
    return { valid: false, error: "Messaging is only available between buyers and sellers", status: 403 };
  }

  return { valid: true };
}

/**
 * Validate asset reference for messaging
 */
export async function validateAssetReference(
  assetId: string,
  senderId: string,
  recipientId: string,
  senderRole: UserRole
): Promise<{ valid: boolean; error?: string; status?: number }> {
  await connectDB();

  // Validate ObjectId
  if (!Types.ObjectId.isValid(assetId)) {
    return { valid: false, error: "Invalid asset ID", status: 400 };
  }

  // Find asset
  const asset = await Asset.findById(assetId).lean();

  if (!asset) {
    return { valid: false, error: "Asset not found", status: 404 };
  }

  // Check if asset is active
  if (asset.status !== AssetStatus.ACTIVE) {
    return { valid: false, error: "Asset is not available", status: 403 };
  }

  // Validate asset ownership based on sender role
  if (senderRole === UserRole.BUYER) {
    // Buyer contacting seller about an asset
    // Asset must belong to the recipient (seller)
    if (asset.sellerId.toString() !== recipientId) {
      return { valid: false, error: "Invalid asset reference", status: 403 };
    }
  } else if (senderRole === UserRole.SELLER) {
    // Seller contacting buyer
    // Asset must belong to the sender (seller)
    if (asset.sellerId.toString() !== senderId) {
      return { valid: false, error: "Invalid asset reference", status: 403 };
    }
  }

  return { valid: true };
}

/**
 * Create a new message
 */
export async function createMessage(
  data: CreateMessageData
): Promise<SafeMessageResponse> {
  await connectDB();

  const message = await Message.create({
    senderId: data.senderId,
    recipientId: data.recipientId,
    assetId: data.assetId,
    subject: data.subject,
    body: data.body,
    read: false,
  });

  // Populate sender, recipient, and asset
  await message.populate([
    { path: "senderId", select: "name company" },
    { path: "recipientId", select: "name company" },
    { path: "assetId", select: "title" },
  ]);

  return transformToSafeMessage(message);
}

/**
 * List messages for a user
 */
export async function listMessages(
  userId: string,
  filters: MessageFilters,
  pagination: MessagePagination
) {
  await connectDB();

  // Build query
  const query: Record<string, unknown> = {};

  // Folder filter
  if (filters.folder === "inbox") {
    query.recipientId = userId;
  } else if (filters.folder === "sent") {
    query.senderId = userId;
  } else {
    // all - messages where user is sender OR recipient
    query.$or = [{ senderId: userId }, { recipientId: userId }];
  }

  // Unread filter (only for received messages)
  if (filters.unread === true) {
    query.recipientId = userId;
    query.read = false;
  }

  // Calculate pagination
  const skip = (pagination.page - 1) * pagination.limit;

  // Execute query
  const [messages, total] = await Promise.all([
    Message.find(query)
      .populate("senderId", "name company")
      .populate("recipientId", "name company")
      .populate("assetId", "title")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pagination.limit)
      .lean(),
    Message.countDocuments(query),
  ]);

  // Transform to safe messages
  const safeMessages = messages.map((msg) => transformToSafeMessage(msg));

  return {
    data: safeMessages,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit),
    },
  };
}

/**
 * Get a single message by ID
 */
export async function getMessageById(
  messageId: string,
  userId: string
): Promise<SafeMessageResponse | null> {
  await connectDB();

  if (!Types.ObjectId.isValid(messageId)) {
    return null;
  }

  const message = await Message.findById(messageId)
    .populate("senderId", "name company")
    .populate("recipientId", "name company")
    .populate("assetId", "title")
    .lean();

  if (!message) {
    return null;
  }

  // Check ownership - user must be sender or recipient
  const isSender = message.senderId._id.toString() === userId;
  const isRecipient = message.recipientId._id.toString() === userId;

  if (!isSender && !isRecipient) {
    return null;
  }

  return transformToSafeMessage(message);
}

/**
 * Mark a message as read
 */
export async function markMessageAsRead(
  messageId: string,
  userId: string
): Promise<{ success: boolean; message?: SafeMessageResponse; error?: string; status?: number }> {
  await connectDB();

  if (!Types.ObjectId.isValid(messageId)) {
    return { success: false, error: "Invalid message ID", status: 400 };
  }

  const message = await Message.findById(messageId);

  if (!message) {
    return { success: false, error: "Message not found", status: 404 };
  }

  // Only recipient can mark as read
  if (message.recipientId.toString() !== userId) {
    return { success: false, error: "Insufficient permissions", status: 403 };
  }

  // Mark as read
  message.read = true;
  await message.save();

  // Populate for response
  await message.populate([
    { path: "senderId", select: "name company" },
    { path: "recipientId", select: "name company" },
    { path: "assetId", select: "title" },
  ]);

  return {
    success: true,
    message: transformToSafeMessage(message),
  };
}

/**
 * Transform message to safe response format
 */
function transformToSafeMessage(message: any): SafeMessageResponse {
  return {
    id: message._id.toString(),
    sender: {
      id: message.senderId._id.toString(),
      name: message.senderId.name,
      company: message.senderId.company,
    },
    recipient: {
      id: message.recipientId._id.toString(),
      name: message.recipientId.name,
      company: message.recipientId.company,
    },
    asset: message.assetId
      ? {
          id: message.assetId._id.toString(),
          title: message.assetId.title,
        }
      : null,
    subject: message.subject,
    body: message.body,
    read: message.read,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  };
}

import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IMessage extends Document {
  senderId: Types.ObjectId;
  recipientId: Types.ObjectId;
  assetId?: Types.ObjectId;
  subject: string;
  body: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender ID is required"],
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recipient ID is required"],
    },
    assetId: {
      type: Schema.Types.ObjectId,
      ref: "Asset",
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    body: {
      type: String,
      required: [true, "Body is required"],
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for inbox queries
MessageSchema.index({ recipientId: 1, read: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1, createdAt: -1 });

const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default Message;

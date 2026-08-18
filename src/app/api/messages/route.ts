import { NextRequest, NextResponse } from "next/server";
import {
  requireRoles,
  handleAuthorizationError,
} from "@/lib/authorization";
import { UserRole } from "@/types";
import * as messageService from "@/services/message.service";

const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 10;
const DEFAULT_PAGE = 1;
const MAX_SUBJECT_LENGTH = 200;
const MAX_BODY_LENGTH = 5000;

/**
 * POST /api/messages
 * Send a new message
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireRoles([UserRole.BUYER, UserRole.SELLER]);

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Check for forbidden fields
    const forbiddenFields = [
      "senderId",
      "read",
      "createdAt",
      "updatedAt",
      "_id",
      "id",
    ];

    for (const field of forbiddenFields) {
      if (field in body) {
        return NextResponse.json(
          { error: `Field '${field}' cannot be set` },
          { status: 400 }
        );
      }
    }

    const { recipientId, assetId, subject, body: messageBody } = body;

    // Validate required fields
    if (!recipientId || typeof recipientId !== "string") {
      return NextResponse.json(
        { error: "Recipient ID is required" },
        { status: 400 }
      );
    }

    if (!subject || typeof subject !== "string" || subject.trim().length === 0) {
      return NextResponse.json(
        { error: "Subject is required" },
        { status: 400 }
      );
    }

    if (!messageBody || typeof messageBody !== "string" || messageBody.trim().length === 0) {
      return NextResponse.json(
        { error: "Message body is required" },
        { status: 400 }
      );
    }

    // Validate field lengths
    if (subject.trim().length > MAX_SUBJECT_LENGTH) {
      return NextResponse.json(
        { error: `Subject must not exceed ${MAX_SUBJECT_LENGTH} characters` },
        { status: 400 }
      );
    }

    if (messageBody.trim().length > MAX_BODY_LENGTH) {
      return NextResponse.json(
        { error: `Message body must not exceed ${MAX_BODY_LENGTH} characters` },
        { status: 400 }
      );
    }

    // Validate assetId if provided
    if (assetId !== undefined && typeof assetId !== "string") {
      return NextResponse.json(
        { error: "Asset ID must be a string" },
        { status: 400 }
      );
    }

    // Validate recipient
    const recipientValidation = await messageService.validateRecipient(
      recipientId,
      user.id,
      user.role
    );

    if (!recipientValidation.valid) {
      return NextResponse.json(
        { error: recipientValidation.error },
        { status: recipientValidation.status || 400 }
      );
    }

    // Validate asset reference if provided
    if (assetId) {
      const assetValidation = await messageService.validateAssetReference(
        assetId,
        user.id,
        recipientId,
        user.role
      );

      if (!assetValidation.valid) {
        return NextResponse.json(
          { error: assetValidation.error },
          { status: assetValidation.status || 400 }
        );
      }
    }

    // Create message
    const message = await messageService.createMessage({
      senderId: user.id,
      recipientId,
      assetId,
      subject: subject.trim(),
      body: messageBody.trim(),
    });

    return NextResponse.json({ data: message }, { status: 201 });
  } catch (error) {
    return handleAuthorizationError(error);
  }
}

/**
 * GET /api/messages
 * List messages for current user
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireRoles([UserRole.BUYER, UserRole.SELLER]);

    // Parse query parameters
    const { searchParams } = new URL(request.url);

    // Folder filter
    const folder = searchParams.get("folder") || "all";
    if (!["inbox", "sent", "all"].includes(folder)) {
      return NextResponse.json(
        { error: "Invalid folder. Must be: inbox, sent, or all" },
        { status: 400 }
      );
    }

    // Unread filter
    const unreadStr = searchParams.get("unread");
    let unread: boolean | undefined;
    if (unreadStr === "true") {
      unread = true;
    } else if (unreadStr === "false") {
      unread = false;
    } else if (unreadStr !== null) {
      return NextResponse.json(
        { error: "Invalid unread parameter. Must be true or false" },
        { status: 400 }
      );
    }

    // Pagination
    const pageStr = searchParams.get("page");
    const limitStr = searchParams.get("limit");

    let page = DEFAULT_PAGE;
    let limit = DEFAULT_LIMIT;

    if (pageStr) {
      page = parseInt(pageStr, 10);
      if (isNaN(page) || page < 1) {
        return NextResponse.json({ error: "Invalid page" }, { status: 400 });
      }
    }

    if (limitStr) {
      limit = parseInt(limitStr, 10);
      if (isNaN(limit) || limit < 1) {
        return NextResponse.json({ error: "Invalid limit" }, { status: 400 });
      }
      if (limit > MAX_LIMIT) {
        return NextResponse.json(
          { error: `Limit must be between 1 and ${MAX_LIMIT}` },
          { status: 400 }
        );
      }
    }

    // Get messages
    const result = await messageService.listMessages(
      user.id,
      {
        folder: folder as "inbox" | "sent" | "all",
        unread,
      },
      {
        page,
        limit,
      }
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleAuthorizationError(error);
  }
}

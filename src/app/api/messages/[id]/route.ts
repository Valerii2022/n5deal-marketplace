import { NextRequest, NextResponse } from "next/server";
import {
  requireRoles,
  handleAuthorizationError,
} from "@/lib/authorization";
import { UserRole } from "@/types";
import * as messageService from "@/services/message.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/messages/[id]
 * Get a single message by ID
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await requireRoles([UserRole.BUYER, UserRole.SELLER]);
    const { id } = await params;

    const message = await messageService.getMessageById(id, user.id);

    if (!message) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: message }, { status: 200 });
  } catch (error) {
    return handleAuthorizationError(error);
  }
}

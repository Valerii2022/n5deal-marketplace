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
 * PATCH /api/messages/[id]/read
 * Mark a message as read
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await requireRoles([UserRole.BUYER, UserRole.SELLER]);
    const { id } = await params;

    const result = await messageService.markMessageAsRead(id, user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status || 500 }
      );
    }

    return NextResponse.json({ data: result.message }, { status: 200 });
  } catch (error) {
    return handleAuthorizationError(error);
  }
}

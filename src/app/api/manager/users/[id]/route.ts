import { NextRequest, NextResponse } from "next/server";
import { requireRole, handleAuthorizationError } from "@/lib/authorization";
import { UserRole, UserStatus } from "@/types";
import * as managerService from "@/services/manager.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/manager/users/[id]
 * Update user status (suspend/activate)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const manager = await requireRole(UserRole.MANAGER);
    const { id } = await params;

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
    const allowedFields = ["status"];
    const providedFields = Object.keys(body);

    for (const field of providedFields) {
      if (!allowedFields.includes(field)) {
        return NextResponse.json(
          { error: `Field '${field}' cannot be modified` },
          { status: 400 }
        );
      }
    }

    const { status } = body;

    // Validate status
    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    if (!Object.values(UserStatus).includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Update user status
    const result = await managerService.updateUserStatus(
      manager.id,
      id,
      status
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.statusCode || 500 }
      );
    }

    return NextResponse.json({ data: result.user }, { status: 200 });
  } catch (error) {
    return handleAuthorizationError(error);
  }
}

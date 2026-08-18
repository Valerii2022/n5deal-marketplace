import { NextRequest, NextResponse } from "next/server";
import { requireRole, handleAuthorizationError } from "@/lib/authorization";
import { UserRole, AssetStatus } from "@/types";
import * as managerService from "@/services/manager.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/manager/assets/[id]
 * Update asset status (suspend/activate)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireRole(UserRole.MANAGER);
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

    if (!Object.values(AssetStatus).includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Update asset status
    const result = await managerService.updateAssetStatus(id, status);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.statusCode || 500 }
      );
    }

    return NextResponse.json({ data: result.asset }, { status: 200 });
  } catch (error) {
    return handleAuthorizationError(error);
  }
}

import { NextRequest, NextResponse } from "next/server";
import {
  requireAuth,
  requireRoles,
  handleAuthorizationError,
} from "@/lib/authorization";
import { UserRole, AssetType, AssetStatus } from "@/types";
import * as assetService from "@/services/asset.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/assets/[id]
 * Get a single asset by ID
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const asset = await assetService.getAssetById(id, user.role);

    if (!asset) {
      return NextResponse.json(
        { error: "Asset not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: asset }, { status: 200 });
  } catch (error) {
    return handleAuthorizationError(error);
  }
}

/**
 * PATCH /api/assets/[id]
 * Update an asset
 * - SELLER can update their own assets
 * - MANAGER can update any asset
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await requireRoles([UserRole.SELLER, UserRole.MANAGER]);
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

    const {
      title,
      description,
      assetType,
      industry,
      location,
      askingPrice,
      revenue,
      ebitda,
      status,
    } = body;

    // Validate fields if provided
    if (title !== undefined && (typeof title !== "string" || title.trim().length === 0)) {
      return NextResponse.json(
        { error: "Title must be a non-empty string" },
        { status: 400 }
      );
    }

    if (description !== undefined && (typeof description !== "string" || description.trim().length === 0)) {
      return NextResponse.json(
        { error: "Description must be a non-empty string" },
        { status: 400 }
      );
    }

    if (assetType !== undefined && !Object.values(AssetType).includes(assetType)) {
      return NextResponse.json(
        { error: "Invalid asset type" },
        { status: 400 }
      );
    }

    if (industry !== undefined && (typeof industry !== "string" || industry.trim().length === 0)) {
      return NextResponse.json(
        { error: "Industry must be a non-empty string" },
        { status: 400 }
      );
    }

    if (location !== undefined && (typeof location !== "string" || location.trim().length === 0)) {
      return NextResponse.json(
        { error: "Location must be a non-empty string" },
        { status: 400 }
      );
    }

    if (askingPrice !== undefined && (typeof askingPrice !== "number" || askingPrice <= 0)) {
      return NextResponse.json(
        { error: "Asking price must be a positive number" },
        { status: 400 }
      );
    }

    if (revenue !== undefined && (typeof revenue !== "number" || revenue < 0)) {
      return NextResponse.json(
        { error: "Revenue must be a non-negative number" },
        { status: 400 }
      );
    }

    if (ebitda !== undefined && typeof ebitda !== "number") {
      return NextResponse.json(
        { error: "EBITDA must be a number" },
        { status: 400 }
      );
    }

    if (status !== undefined && !Object.values(AssetStatus).includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Update asset
    const result = await assetService.updateAsset(
      id,
      {
        title: title?.trim(),
        description: description?.trim(),
        assetType,
        industry: industry?.trim(),
        location: location?.trim(),
        askingPrice,
        revenue,
        ebitda,
        status,
      },
      user.id,
      user.role
    );

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleAuthorizationError(error);
  }
}

/**
 * DELETE /api/assets/[id]
 * Soft delete an asset (set status to SUSPENDED)
 * - MANAGER can suspend any asset
 * - SELLER can suspend their own asset
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await requireRoles([UserRole.SELLER, UserRole.MANAGER]);
    const { id } = await params;

    const result = await assetService.deleteAsset(id, user.id, user.role);

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleAuthorizationError(error);
  }
}

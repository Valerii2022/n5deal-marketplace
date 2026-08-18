import { NextRequest, NextResponse } from "next/server";
import { requireRole, handleAuthorizationError } from "@/lib/authorization";
import { UserRole, AssetType, AssetStatus } from "@/types";
import * as managerService from "@/services/manager.service";

const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 10;
const DEFAULT_PAGE = 1;

/**
 * GET /api/manager/assets
 * List all assets for manager dashboard
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(UserRole.MANAGER);

    // Parse query parameters
    const { searchParams } = new URL(request.url);

    // Filters
    const search = searchParams.get("search") || undefined;
    const assetType = searchParams.get("assetType") || undefined;
    const industry = searchParams.get("industry") || undefined;
    const status = searchParams.get("status") || undefined;

    // Validate assetType if provided
    if (assetType && !Object.values(AssetType).includes(assetType as AssetType)) {
      return NextResponse.json(
        { error: "Invalid asset type" },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status && !Object.values(AssetStatus).includes(status as AssetStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
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

    // Get assets
    const result = await managerService.getManagerAssets(
      {
        search,
        assetType: assetType as AssetType | undefined,
        industry,
        status: status as AssetStatus | undefined,
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

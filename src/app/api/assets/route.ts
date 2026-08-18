import { NextRequest, NextResponse } from "next/server";
import {
  requireAuth,
  requireRole,
  handleAuthorizationError,
} from "@/lib/authorization";
import { UserRole, AssetType } from "@/types";
import * as assetService from "@/services/asset.service";

const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 10;
const DEFAULT_PAGE = 1;

/**
 * GET /api/assets
 * List assets with filters, search, and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Parse query parameters
    const { searchParams } = new URL(request.url);

    // Filters
    const search = searchParams.get("search") || undefined;
    const assetType = searchParams.get("assetType") || undefined;
    const industry = searchParams.get("industry") || undefined;
    const location = searchParams.get("location") || undefined;
    const minPriceStr = searchParams.get("minPrice");
    const maxPriceStr = searchParams.get("maxPrice");

    // Validate assetType if provided
    if (assetType && !Object.values(AssetType).includes(assetType as AssetType)) {
      return NextResponse.json(
        { error: "Invalid asset type" },
        { status: 400 }
      );
    }

    // Parse and validate price filters
    let minPrice: number | undefined;
    let maxPrice: number | undefined;

    if (minPriceStr) {
      minPrice = parseFloat(minPriceStr);
      if (isNaN(minPrice) || minPrice < 0) {
        return NextResponse.json(
          { error: "Invalid minPrice" },
          { status: 400 }
        );
      }
    }

    if (maxPriceStr) {
      maxPrice = parseFloat(maxPriceStr);
      if (isNaN(maxPrice) || maxPrice < 0) {
        return NextResponse.json(
          { error: "Invalid maxPrice" },
          { status: 400 }
        );
      }
    }

    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
      return NextResponse.json(
        { error: "minPrice cannot be greater than maxPrice" },
        { status: 400 }
      );
    }

    // Pagination
    const pageStr = searchParams.get("page");
    const limitStr = searchParams.get("limit");
    const sort = searchParams.get("sort") || undefined;

    let page = DEFAULT_PAGE;
    let limit = DEFAULT_LIMIT;

    if (pageStr) {
      page = parseInt(pageStr, 10);
      if (isNaN(page) || page < 1) {
        return NextResponse.json(
          { error: "Invalid page number" },
          { status: 400 }
        );
      }
    }

    if (limitStr) {
      limit = parseInt(limitStr, 10);
      if (isNaN(limit) || limit < 1) {
        return NextResponse.json(
          { error: "Invalid limit" },
          { status: 400 }
        );
      }
      if (limit > MAX_LIMIT) {
        limit = MAX_LIMIT;
      }
    }

    // Validate sort parameter
    if (sort && !["newest", "price_asc", "price_desc"].includes(sort)) {
      return NextResponse.json(
        { error: "Invalid sort parameter" },
        { status: 400 }
      );
    }

    // Call service
    const result = await assetService.listAssets(
      {
        search,
        assetType: assetType as AssetType | undefined,
        industry,
        location,
        minPrice,
        maxPrice,
      },
      {
        page,
        limit,
        sort: sort as "newest" | "price_asc" | "price_desc" | undefined,
      },
      user.role
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleAuthorizationError(error);
  }
}

/**
 * POST /api/assets
 * Create a new asset (SELLER only)
 */
export async function POST(request: NextRequest) {
  try {
    const seller = await requireRole(UserRole.SELLER);

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
    } = body;

    // Validate required fields
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (!description || typeof description !== "string" || description.trim().length === 0) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    if (!assetType || !Object.values(AssetType).includes(assetType)) {
      return NextResponse.json(
        { error: "Valid asset type is required" },
        { status: 400 }
      );
    }

    if (!industry || typeof industry !== "string" || industry.trim().length === 0) {
      return NextResponse.json(
        { error: "Industry is required" },
        { status: 400 }
      );
    }

    if (!location || typeof location !== "string" || location.trim().length === 0) {
      return NextResponse.json(
        { error: "Location is required" },
        { status: 400 }
      );
    }

    if (typeof askingPrice !== "number" || askingPrice <= 0) {
      return NextResponse.json(
        { error: "Asking price must be a positive number" },
        { status: 400 }
      );
    }

    // Validate optional fields
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

    // Create asset with authenticated seller's ID
    const asset = await assetService.createAsset({
      sellerId: seller.id,
      title: title.trim(),
      description: description.trim(),
      assetType,
      industry: industry.trim(),
      location: location.trim(),
      askingPrice,
      revenue,
      ebitda,
    });

    return NextResponse.json({ data: asset }, { status: 201 });
  } catch (error) {
    return handleAuthorizationError(error);
  }
}

import { NextRequest, NextResponse } from "next/server";
import { requireRole, handleAuthorizationError } from "@/lib/authorization";
import { UserRole } from "@/types";
import * as sellerService from "@/services/seller.service";

const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 10;
const DEFAULT_PAGE = 1;

/**
 * GET /api/sellers/buyers
 * List buyers for seller directory with search and filters
 */
export async function GET(request: NextRequest) {
  try {
    // Require SELLER role
    await requireRole(UserRole.SELLER);

    // Parse query parameters
    const { searchParams } = new URL(request.url);

    // Filters
    const search = searchParams.get("search") || undefined;
    const industry = searchParams.get("industry") || undefined;
    const location = searchParams.get("location") || undefined;
    const minInvestmentStr = searchParams.get("minInvestment");
    const maxInvestmentStr = searchParams.get("maxInvestment");
    const acquisitionType = searchParams.get("acquisitionType") || undefined;

    // Parse and validate investment filters
    let minInvestment: number | undefined;
    let maxInvestment: number | undefined;

    if (minInvestmentStr) {
      minInvestment = parseFloat(minInvestmentStr);
      if (isNaN(minInvestment) || minInvestment < 0) {
        return NextResponse.json(
          { error: "Invalid minInvestment" },
          { status: 400 }
        );
      }
    }

    if (maxInvestmentStr) {
      maxInvestment = parseFloat(maxInvestmentStr);
      if (isNaN(maxInvestment) || maxInvestment < 0) {
        return NextResponse.json(
          { error: "Invalid maxInvestment" },
          { status: 400 }
        );
      }
    }

    if (
      minInvestment !== undefined &&
      maxInvestment !== undefined &&
      minInvestment > maxInvestment
    ) {
      return NextResponse.json(
        { error: "minInvestment cannot be greater than maxInvestment" },
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

    // Call service
    const result = await sellerService.listBuyers(
      {
        search,
        industry,
        location,
        minInvestment,
        maxInvestment,
        acquisitionType,
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

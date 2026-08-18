import { NextRequest, NextResponse } from "next/server";
import { requireRole, handleAuthorizationError } from "@/lib/authorization";
import { UserRole, UserStatus } from "@/types";
import * as managerService from "@/services/manager.service";

const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 10;
const DEFAULT_PAGE = 1;

/**
 * GET /api/manager/users
 * List all users for manager dashboard
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(UserRole.MANAGER);

    // Parse query parameters
    const { searchParams } = new URL(request.url);

    // Filters
    const search = searchParams.get("search") || undefined;
    const role = searchParams.get("role") || undefined;
    const status = searchParams.get("status") || undefined;

    // Validate role if provided
    if (role && !Object.values(UserRole).includes(role as UserRole)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Validate status if provided
    if (status && !Object.values(UserStatus).includes(status as UserStatus)) {
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

    // Get users
    const result = await managerService.getManagerUsers(
      {
        search,
        role: role as UserRole | undefined,
        status: status as UserStatus | undefined,
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

import { NextRequest, NextResponse } from "next/server";
import { requireRole, handleAuthorizationError } from "@/lib/authorization";
import { UserRole } from "@/types";
import * as buyerService from "@/services/buyer.service";

/**
 * GET /api/buyers/me
 * Get current buyer's profile
 */
export async function GET() {
  try {
    const buyer = await requireRole(UserRole.BUYER);

    const profile = await buyerService.getBuyerProfile(buyer.id);

    if (!profile) {
      return NextResponse.json(
        { error: "Buyer profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: profile }, { status: 200 });
  } catch (error) {
    return handleAuthorizationError(error);
  }
}

/**
 * PATCH /api/buyers/me
 * Update current buyer's profile
 */
export async function PATCH(request: NextRequest) {
  try {
    const buyer = await requireRole(UserRole.BUYER);

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
      "_id",
      "id",
      "email",
      "passwordHash",
      "role",
      "status",
      "createdAt",
      "updatedAt",
    ];

    for (const field of forbiddenFields) {
      if (field in body) {
        return NextResponse.json(
          { error: `Field '${field}' cannot be modified` },
          { status: 400 }
        );
      }
    }

    const {
      name,
      company,
      location,
      bio,
      industries,
      investmentRange,
      acquisitionTypes,
    } = body;

    // Validate name if provided
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json(
          { error: "Name must be a non-empty string" },
          { status: 400 }
        );
      }
    }

    // Validate company if provided
    if (company !== undefined && typeof company !== "string") {
      return NextResponse.json(
        { error: "Company must be a string" },
        { status: 400 }
      );
    }

    // Validate location if provided
    if (location !== undefined && typeof location !== "string") {
      return NextResponse.json(
        { error: "Location must be a string" },
        { status: 400 }
      );
    }

    // Validate bio if provided
    if (bio !== undefined && typeof bio !== "string") {
      return NextResponse.json(
        { error: "Bio must be a string" },
        { status: 400 }
      );
    }

    // Validate industries if provided
    if (industries !== undefined) {
      if (!Array.isArray(industries)) {
        return NextResponse.json(
          { error: "Industries must be an array" },
          { status: 400 }
        );
      }

      if (!industries.every((item) => typeof item === "string")) {
        return NextResponse.json(
          { error: "All industries must be strings" },
          { status: 400 }
        );
      }
    }

    // Validate investmentRange if provided
    if (investmentRange !== undefined) {
      if (
        typeof investmentRange !== "object" ||
        investmentRange === null ||
        Array.isArray(investmentRange)
      ) {
        return NextResponse.json(
          { error: "Investment range must be an object" },
          { status: 400 }
        );
      }

      const { min, max } = investmentRange;

      if (min !== undefined) {
        if (typeof min !== "number" || min < 0) {
          return NextResponse.json(
            { error: "Investment range min must be a non-negative number" },
            { status: 400 }
          );
        }
      }

      if (max !== undefined) {
        if (typeof max !== "number" || max < 0) {
          return NextResponse.json(
            { error: "Investment range max must be a non-negative number" },
            { status: 400 }
          );
        }
      }

      if (
        min !== undefined &&
        max !== undefined &&
        min > max
      ) {
        return NextResponse.json(
          { error: "Investment range min cannot be greater than max" },
          { status: 400 }
        );
      }
    }

    // Validate acquisitionTypes if provided
    if (acquisitionTypes !== undefined) {
      if (!Array.isArray(acquisitionTypes)) {
        return NextResponse.json(
          { error: "Acquisition types must be an array" },
          { status: 400 }
        );
      }

      if (!acquisitionTypes.every((item) => typeof item === "string")) {
        return NextResponse.json(
          { error: "All acquisition types must be strings" },
          { status: 400 }
        );
      }
    }

    // Update profile
    const updatedProfile = await buyerService.updateBuyerProfile(buyer.id, {
      name,
      company,
      location,
      bio,
      industries,
      investmentRange,
      acquisitionTypes,
    });

    if (!updatedProfile) {
      return NextResponse.json(
        { error: "Buyer profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updatedProfile }, { status: 200 });
  } catch (error) {
    return handleAuthorizationError(error);
  }
}

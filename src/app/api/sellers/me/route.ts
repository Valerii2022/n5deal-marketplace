import { NextRequest, NextResponse } from "next/server";
import { requireRole, handleAuthorizationError } from "@/lib/authorization";
import { UserRole } from "@/types";
import * as sellerService from "@/services/seller.service";

/**
 * GET /api/sellers/me
 * Get current seller's profile
 */
export async function GET() {
  try {
    const seller = await requireRole(UserRole.SELLER);

    const profile = await sellerService.getSellerProfile(seller.id);

    if (!profile) {
      return NextResponse.json(
        { error: "Seller profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: profile }, { status: 200 });
  } catch (error) {
    return handleAuthorizationError(error);
  }
}

/**
 * PATCH /api/sellers/me
 * Update current seller's profile
 */
export async function PATCH(request: NextRequest) {
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

    const { name, company, location, bio, industries } = body;

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

    // Update profile
    const updatedProfile = await sellerService.updateSellerProfile(seller.id, {
      name,
      company,
      location,
      bio,
      industries,
    });

    if (!updatedProfile) {
      return NextResponse.json(
        { error: "Seller profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updatedProfile }, { status: 200 });
  } catch (error) {
    return handleAuthorizationError(error);
  }
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { UserRole } from "@/types";

/**
 * Authorization error class for consistent error handling
 */
export class AuthorizationError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = "AuthorizationError";
  }
}

/**
 * Authenticated user type returned by authorization helpers
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: string;
}

/**
 * Require authentication for an API route.
 * Returns the authenticated user or throws AuthorizationError.
 *
 * @throws {AuthorizationError} 401 if not authenticated
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new AuthorizationError("Authentication required", 401);
  }

  return user;
}

/**
 * Require a specific role for an API route.
 * Returns the authenticated user or throws AuthorizationError.
 *
 * @param role - The required role
 * @throws {AuthorizationError} 401 if not authenticated, 403 if wrong role
 */
export async function requireRole(role: UserRole): Promise<AuthenticatedUser> {
  const user = await requireAuth();

  if (user.role !== role) {
    throw new AuthorizationError(
      "Insufficient permissions",
      403
    );
  }

  return user;
}

/**
 * Require one of multiple roles for an API route.
 * Returns the authenticated user or throws AuthorizationError.
 *
 * @param roles - Array of acceptable roles
 * @throws {AuthorizationError} 401 if not authenticated, 403 if wrong role
 */
export async function requireRoles(
  roles: UserRole[]
): Promise<AuthenticatedUser> {
  const user = await requireAuth();

  if (!roles.includes(user.role)) {
    throw new AuthorizationError(
      "Insufficient permissions",
      403
    );
  }

  return user;
}

/**
 * Handle authorization errors in API routes.
 * Converts AuthorizationError to appropriate NextResponse.
 *
 * Usage:
 * ```
 * try {
 *   const user = await requireRole(UserRole.SELLER);
 *   // ... route logic
 * } catch (error) {
 *   return handleAuthorizationError(error);
 * }
 * ```
 */
export function handleAuthorizationError(error: unknown): NextResponse {
  if (error instanceof AuthorizationError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }

  // Log unexpected errors but don't expose details to client
  console.error("Unexpected error in API route:", error);
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}

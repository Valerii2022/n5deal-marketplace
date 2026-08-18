import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { UserRole, UserStatus } from "@/types";
import connectDB from "@/lib/db";
import { User } from "@/models";

const SESSION_DURATION = 7 * 24 * 60 * 60; // 7 days in seconds
const COOKIE_NAME = "n5deal_session";

function getAuthSecret(): Uint8Array {
  if (!process.env.AUTH_SECRET) {
    throw new Error(
      "Please define the AUTH_SECRET environment variable inside .env.local"
    );
  }
  return new TextEncoder().encode(process.env.AUTH_SECRET);
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface SessionPayload extends SessionUser {
  sub: string;
  exp: number;
  iat: number;
}

/**
 * Create a JWT session token for a user
 */
export async function createSessionToken(user: {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
}): Promise<string> {
  const token = await new SignJWT({
    sub: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getAuthSecret());

  return token;
}

/**
 * Verify a JWT session token
 */
export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    return payload as unknown as SessionPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Get the current authenticated user from the session cookie.
 * Verifies the JWT and checks that the user still exists and is ACTIVE in the database.
 */
export async function getCurrentUser(): Promise<{
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = await verifySessionToken(token);
  if (!payload) {
    return null;
  }

  // Verify user still exists and is active in database
  await connectDB();
  const user = await User.findById(payload.sub);

  if (!user || user.status !== UserStatus.ACTIVE) {
    return null;
  }

  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
  };
}

/**
 * Set the session cookie
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION,
  });
}

/**
 * Clear the session cookie
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

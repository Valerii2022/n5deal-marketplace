import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/models";
import { verifyPassword } from "@/lib/password";
import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { UserStatus } from "@/types";

export async function POST(request: NextRequest) {
  try {
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

    const { email, password } = body;

    // Validate input
    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Connect to database
    await connectDB();

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });

    // Generic error message to prevent email enumeration
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check if user is suspended
    if (user.status === UserStatus.SUSPENDED) {
      return NextResponse.json(
        { error: "Account is suspended" },
        { status: 403 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create session token
    const token = await createSessionToken({
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // Set session cookie
    await setSessionCookie(token);

    // Return safe user information
    return NextResponse.json(
      {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

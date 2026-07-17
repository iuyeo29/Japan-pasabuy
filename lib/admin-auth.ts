import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

/** Returns a 403 NextResponse if the caller isn't an admin, or null if they are. */
export async function requireAdmin() {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
  if (!userId || role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }
  return null;
}

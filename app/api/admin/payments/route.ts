import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { listPendingPayments } from "@/lib/orders";

// Middleware already blocks this route for non-admins, but route-level
// checks are kept too as defense in depth (middleware alone has had
// bypass vulnerabilities historically — see CVE-2025-29927).
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const payments = await listPendingPayments();
  return NextResponse.json({ payments });
}

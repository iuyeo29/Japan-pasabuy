import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/orders";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const itemsRaw = form.get("items");
    const proofFile = form.get("proofFile");

    if (typeof itemsRaw !== "string" || !(proofFile instanceof File)) {
      return NextResponse.json(
        { error: "Missing cart items or proof of payment file." },
        { status: 400 }
      );
    }

    const items = JSON.parse(itemsRaw) as { slug: string; quantity: number }[];

    const order = await createOrder({
      items,
      guestName: String(form.get("guestName") || ""),
      guestEmail: String(form.get("guestEmail") || ""),
      guestPhone: String(form.get("guestPhone") || ""),
      guestAddress: String(form.get("guestAddress") || ""),
      method: String(form.get("method")) as "GCASH" | "MAYA" | "BANK_TRANSFER",
      referenceNumber: String(form.get("referenceNumber") || ""),
      amountPaid: Number(form.get("amountPaid") || 0),
      paidAt: String(form.get("paidAt") || new Date().toISOString()),
      proofFile,
      uploadedIp: req.headers.get("x-forwarded-for") ?? undefined,
    });

    return NextResponse.json({ orderNumber: order.orderNumber });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

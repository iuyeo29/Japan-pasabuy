import { prisma } from "./prisma";
import { uploadPaymentProof, supabaseAdmin, PAYMENT_PROOFS_BUCKET } from "./supabase-admin";

export interface CartLineInput {
  slug: string;
  quantity: number;
}

export interface CreateOrderInput {
  items: CartLineInput[];
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestAddress: string;
  method: "GCASH" | "MAYA" | "BANK_TRANSFER";
  referenceNumber: string;
  amountPaid: number;
  paidAt: string;
  proofFile: File;
  uploadedIp?: string;
}

function generateOrderNumber() {
  const year = new Date().getFullYear();
  const rand = Math.floor(10000 + Math.random() * 89999);
  return `JP-${year}-${rand}`;
}

/**
 * Creates an order end to end:
 * 1. Re-prices every line server-side from the DB (never trusts client totals)
 * 2. Uploads the proof-of-payment file to Supabase Storage
 * 3. Writes Order + OrderItems + Payment + the first two status events,
 *    all inside one transaction so nothing is left half-created.
 */
export async function createOrder(input: CreateOrderInput) {
  if (input.items.length === 0) {
    throw new Error("Cart is empty.");
  }

  const products = await prisma.product.findMany({
    where: { slug: { in: input.items.map((i) => i.slug) } },
  });

  if (products.length !== input.items.length) {
    throw new Error("One or more products in the cart no longer exist.");
  }

  const soldOut = products.find((p) => p.availability === "SOLD_OUT");
  if (soldOut) {
    throw new Error(`${soldOut.name} is sold out and can't be ordered.`);
  }

  const orderNumber = generateOrderNumber();
  const proofPath = await uploadPaymentProof(orderNumber, input.proofFile);

  const lineItems = input.items.map((item) => {
    const product = products.find((p) => p.slug === item.slug)!;
    return {
      productId: product.id,
      quantity: item.quantity,
      unitPricePHP: product.finalPricePHP,
    };
  });

  const subtotal = lineItems.reduce(
    (sum, l) => sum + Number(l.unitPricePHP) * l.quantity,
    0
  );

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber,
        guestName: input.guestName,
        guestEmail: input.guestEmail,
        guestPhone: input.guestPhone,
        guestAddress: input.guestAddress,
        currentStatus: "PENDING_PAYMENT_VERIFICATION",
        subtotal,
        totalAmount: subtotal,
        items: { create: lineItems },
        statusEvents: {
          create: [
            { status: "ORDER_SUBMITTED" },
            { status: "PENDING_PAYMENT_VERIFICATION" },
          ],
        },
        payments: {
          create: {
            method: input.method,
            referenceNumber: input.referenceNumber,
            amountPaid: input.amountPaid,
            paidAt: new Date(input.paidAt),
            proofFileUrl: proofPath,
            uploadedIp: input.uploadedIp,
            status: "SUBMITTED",
          },
        },
      },
    });
    return created;
  });

  return order;
}

export async function getOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: {
      statusEvents: { orderBy: { createdAt: "asc" } },
      items: { include: { product: true } },
      payments: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function listPendingPayments() {
  const payments = await prisma.payment.findMany({
    where: { status: "SUBMITTED" },
    include: { order: true },
    orderBy: { createdAt: "asc" },
  });

  // Mint a short-lived signed URL for each private proof-of-payment file
  // so the admin dashboard can display/download it.
  return Promise.all(
    payments.map(async (p) => {
      const { data } = await supabaseAdmin.storage
        .from(PAYMENT_PROOFS_BUCKET)
        .createSignedUrl(p.proofFileUrl, 60 * 10); // 10 minutes
      return { ...p, signedProofUrl: data?.signedUrl ?? null };
    })
  );
}

export async function decidePayment(
  paymentId: string,
  action: "approve" | "reject",
  note?: string
) {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new Error("Payment not found.");

  await prisma.$transaction(async (tx) => {
    if (action === "approve") {
      await tx.payment.update({
        where: { id: paymentId },
        data: { status: "APPROVED", reviewedAt: new Date() },
      });
      await tx.order.update({
        where: { id: payment.orderId },
        data: { currentStatus: "PAYMENT_VERIFIED" },
      });
      await tx.orderStatusEvent.create({
        data: { orderId: payment.orderId, status: "PAYMENT_VERIFIED" },
      });
      // TODO: send "Payment Verified" notification to the customer once
      // a notification channel (email/SMS) is wired up.
    } else {
      await tx.payment.update({
        where: { id: paymentId },
        data: { status: "REJECTED", reviewedAt: new Date(), rejectionNote: note },
      });
      await tx.order.update({
        where: { id: payment.orderId },
        data: { currentStatus: "PAYMENT_REJECTED" },
      });
      await tx.orderStatusEvent.create({
        data: {
          orderId: payment.orderId,
          status: "PAYMENT_REJECTED",
          note,
        },
      });
      // TODO: notify the customer they can re-upload a new payment for
      // the same order (POST /api/orders/[orderNumber]/payments).
    }
  });
}

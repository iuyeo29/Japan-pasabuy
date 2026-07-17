"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, CheckCircle2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";

type Method = "GCASH" | "MAYA" | "BANK_TRANSFER";

const accounts: Record<Method, { label: string; name: string; number: string; qr: string }> = {
  GCASH: {
    label: "GCash",
    name: "Japan Pasabuy PH",
    number: "0917 123 4567",
    qr: "https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=500",
  },
  MAYA: {
    label: "Maya",
    name: "Japan Pasabuy PH",
    number: "0917 123 4567",
    qr: "https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=500",
  },
  BANK_TRANSFER: {
    label: "Bank Transfer",
    name: "Japan Pasabuy PH / BPI",
    number: "1234-5678-90",
    qr: "https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=500",
  },
};

const MAX_FILE_MB = 10;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/heic", "image/webp", "application/pdf"];

export default function CheckoutPage() {
  const { lines, subtotal, clear } = useCart();
  const router = useRouter();

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestAddress, setGuestAddress] = useState("");

  const [method, setMethod] = useState<Method>("GCASH");
  const [refNumber, setRefNumber] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [paidAt, setPaidAt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return (
      lines.length > 0 &&
      !!file &&
      !fileError &&
      guestName.trim().length > 0 &&
      guestEmail.trim().length > 0 &&
      guestPhone.trim().length > 0 &&
      guestAddress.trim().length > 0 &&
      refNumber.trim().length > 0 &&
      amountPaid.trim().length > 0 &&
      !!paidAt
    );
  }, [lines.length, file, fileError, guestName, guestEmail, guestPhone, guestAddress, refNumber, amountPaid, paidAt]);

  function handleFile(f: File | undefined) {
    if (!f) return;
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setFileError("Unsupported file type. Use JPG, PNG, HEIC, WEBP, or PDF.");
      setFile(null);
      return;
    }
    if (f.size > MAX_FILE_MB * 1024 * 1024) {
      setFileError(`File is too large. Maximum size is ${MAX_FILE_MB} MB.`);
      setFile(null);
      return;
    }
    setFileError(null);
    setFile(f);
  }

  async function handleSubmit() {
    if (!canSubmit || !file) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const form = new FormData();
      form.set(
        "items",
        JSON.stringify(lines.map((l) => ({ slug: l.product.slug, quantity: l.quantity })))
      );
      form.set("guestName", guestName);
      form.set("guestEmail", guestEmail);
      form.set("guestPhone", guestPhone);
      form.set("guestAddress", guestAddress);
      form.set("method", method);
      form.set("referenceNumber", refNumber);
      form.set("amountPaid", amountPaid);
      form.set("paidAt", new Date(paidAt).toISOString());
      form.set("proofFile", file);

      const res = await fetch("/api/orders", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong submitting your order.");
      }

      clear();
      router.push(`/orders/${data.orderNumber}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl italic">Nothing to check out</h1>
        <p className="mt-3 text-mute">Add items to your cart first.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-3xl italic md:text-4xl">Checkout</h1>
      <p className="mt-2 text-sm text-mute">
        Payment is required before your order is placed. Complete payment
        outside the site, then upload proof below.
      </p>

      <div className="mt-8 rounded-sm border border-line p-6">
        <div className="eyebrow text-mute">Order Total</div>
        <div className="mt-1 font-mono text-2xl">₱{subtotal.toLocaleString()}</div>
      </div>

      {/* Contact & delivery */}
      <section className="mt-10">
        <div className="eyebrow text-stamp">Contact & Delivery</div>
        <h2 className="mt-1 font-display text-xl">Where should this go?</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Full Name">
            <input value={guestName} onChange={(e) => setGuestName(e.target.value)} className="input" />
          </Field>
          <Field label="Email">
            <input
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              type="email"
              className="input"
            />
          </Field>
          <Field label="Phone">
            <input value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} className="input" />
          </Field>
          <Field label="Delivery Address" full>
            <input
              value={guestAddress}
              onChange={(e) => setGuestAddress(e.target.value)}
              className="input"
            />
          </Field>
        </div>
      </section>

      {/* Step 1: Payment method */}
      <section className="mt-10">
        <div className="eyebrow text-stamp">Step 1</div>
        <h2 className="mt-1 font-display text-xl">Choose a payment method</h2>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {(Object.keys(accounts) as Method[]).map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`rounded-sm border px-4 py-3 text-sm transition-colors ${
                method === m ? "border-ink bg-ink text-paper" : "border-line hover:border-ink"
              }`}
            >
              {accounts[m].label}
            </button>
          ))}
        </div>

        <div className="mt-5 flex gap-5 rounded-sm border border-line p-5">
          <img
            src={accounts[method].qr}
            alt={`${accounts[method].label} QR code`}
            className="h-28 w-28 rounded-sm object-cover"
          />
          <div className="space-y-1 text-sm">
            <div className="eyebrow text-mute">Send payment to</div>
            <div className="font-medium">{accounts[method].name}</div>
            <div className="font-mono">{accounts[method].number}</div>
            <div className="pt-2 text-xs text-mute">
              Pay the exact order total, then come back and submit your proof
              of payment below.
            </div>
          </div>
        </div>
      </section>

      {/* Step 2: Proof of payment */}
      <section className="mt-10">
        <div className="eyebrow text-stamp">Step 2</div>
        <h2 className="mt-1 font-display text-xl">Upload proof of payment</h2>

        <label className="mt-4 flex cursor-pointer flex-col items-center gap-2 rounded-sm border border-dashed border-line px-6 py-10 text-center hover:border-ink">
          <UploadCloud size={28} className="text-mute" />
          <span className="text-sm">
            {file ? file.name : "Click to upload — JPG, PNG, HEIC, WEBP, or PDF, max 10MB"}
          </span>
          <input
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </label>
        {fileError && <p className="mt-2 text-sm text-stamp">{fileError}</p>}
        {file && !fileError && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-stamp">
            <CheckCircle2 size={16} /> File ready to submit
          </p>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label="Reference Number">
            <input
              value={refNumber}
              onChange={(e) => setRefNumber(e.target.value)}
              placeholder="e.g. 0923847561"
              className="input"
            />
          </Field>
          <Field label="Amount Paid (₱)">
            <input
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              type="number"
              min="0"
              placeholder={subtotal.toString()}
              className="input"
            />
          </Field>
          <Field label="Payment Date & Time" full>
            <input
              value={paidAt}
              onChange={(e) => setPaidAt(e.target.value)}
              type="datetime-local"
              className="input"
            />
          </Field>
        </div>
      </section>

      {submitError && (
        <p className="mt-6 rounded-sm bg-stamp-light px-4 py-3 text-sm text-stamp">{submitError}</p>
      )}

      <button
        disabled={!canSubmit || submitting}
        onClick={handleSubmit}
        className="mt-6 w-full rounded-sm bg-ink py-3.5 text-sm font-medium text-paper transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-30"
      >
        {submitting ? "Submitting..." : "Submit Order"}
      </button>
      <p className="mt-3 text-center text-xs text-mute">
        Your order status will show as "Pending Payment Verification" until
        an admin confirms your payment.
      </p>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid #e4e1d8;
          border-radius: 2px;
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          background: #fafaf8;
        }
        .input:focus {
          outline: none;
          border-color: #111111;
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="eyebrow mb-1.5 block text-mute">{label}</label>
      {children}
    </div>
  );
}

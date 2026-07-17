"use client";

import { useEffect, useState } from "react";
import { ZoomIn, Download, CheckCircle2, XCircle, X } from "lucide-react";

interface PendingPayment {
  id: string;
  orderId: string;
  method: string;
  referenceNumber: string;
  amountPaid: string | number;
  paidAt: string;
  signedProofUrl: string | null;
  order: { orderNumber: string; totalAmount: string | number; guestName: string | null };
}

export default function PaymentVerificationPage() {
  const [queue, setQueue] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [zoomed, setZoomed] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/payments");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load payments.");
      setQueue(data.payments);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load payments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function decide(id: string, action: "approve" | "reject", rejectNote?: string) {
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/payments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note: rejectNote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed.");
      setQueue((q) => q.filter((p) => p.id !== id));
      setRejecting(null);
      setNote("");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Action failed.");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="eyebrow text-stamp">Admin</div>
      <h1 className="mt-1 font-display text-3xl italic">Payment Verification</h1>
      <p className="mt-2 text-sm text-mute">
        {loading ? "Loading…" : `${queue.length} payments awaiting review`}
      </p>

      {loadError && (
        <p className="mt-6 rounded-sm bg-stamp-light p-4 text-sm text-stamp">{loadError}</p>
      )}
      {actionError && (
        <p className="mt-6 rounded-sm bg-stamp-light p-4 text-sm text-stamp">{actionError}</p>
      )}

      <div className="mt-10 space-y-4">
        {queue.map((p) => {
          const amountPaid = Number(p.amountPaid);
          const orderTotal = Number(p.order.totalAmount);
          const mismatch = amountPaid !== orderTotal;
          return (
            <div
              key={p.id}
              className="grid gap-6 rounded-sm border border-line p-6 md:grid-cols-[140px_1fr_auto]"
            >
              <button
                className="group relative h-32 w-32 overflow-hidden rounded-sm bg-cloud"
                onClick={() => p.signedProofUrl && setZoomed(p.signedProofUrl)}
              >
                {p.signedProofUrl ? (
                  <img src={p.signedProofUrl} alt="Proof of payment" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center text-xs text-mute">
                    No preview
                  </span>
                )}
                <span className="absolute inset-0 flex items-center justify-center bg-ink/0 text-paper opacity-0 transition-opacity group-hover:bg-ink/40 group-hover:opacity-100">
                  <ZoomIn size={20} />
                </span>
              </button>

              <div className="space-y-1 text-sm">
                <div className="font-display text-lg not-italic">
                  {p.order.guestName ?? "Guest"}
                </div>
                <div className="text-mute">
                  Order {p.order.orderNumber} · {p.method}
                </div>
                <div className="font-mono text-xs text-mute">Ref: {p.referenceNumber}</div>
                <div className="mt-2 flex gap-6 font-mono text-sm">
                  <span>
                    Paid: <strong>₱{amountPaid.toLocaleString()}</strong>
                  </span>
                  <span>
                    Order Total: <strong>₱{orderTotal.toLocaleString()}</strong>
                  </span>
                  {mismatch && (
                    <span className="rounded-sm bg-stamp-light px-2 py-0.5 text-xs text-stamp">
                      Mismatch
                    </span>
                  )}
                </div>
                {p.signedProofUrl && (
                  <a
                    href={p.signedProofUrl}
                    download
                    className="mt-2 inline-flex items-center gap-1.5 text-xs text-mute hover:text-ink"
                  >
                    <Download size={14} /> Download receipt
                  </a>
                )}
              </div>

              <div className="flex flex-col justify-center gap-2 md:items-end">
                <button
                  onClick={() => decide(p.id, "approve")}
                  className="flex items-center gap-1.5 rounded-sm bg-ink px-4 py-2 text-xs font-medium text-paper"
                >
                  <CheckCircle2 size={14} /> Approve
                </button>
                <button
                  onClick={() => setRejecting(p.id)}
                  className="flex items-center gap-1.5 rounded-sm border border-line px-4 py-2 text-xs text-mute hover:border-stamp hover:text-stamp"
                >
                  <XCircle size={14} /> Reject
                </button>
              </div>

              {rejecting === p.id && (
                <div className="md:col-span-3">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Reason for rejection (shown to customer)..."
                    className="w-full rounded-sm border border-line p-3 text-sm"
                    rows={2}
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => decide(p.id, "reject", note)}
                      disabled={!note.trim()}
                      className="rounded-sm bg-stamp px-4 py-2 text-xs font-medium text-paper disabled:opacity-30"
                    >
                      Confirm Rejection
                    </button>
                    <button
                      onClick={() => setRejecting(null)}
                      className="rounded-sm border border-line px-4 py-2 text-xs text-mute"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {!loading && !loadError && queue.length === 0 && (
          <p className="rounded-sm border border-line p-8 text-center text-mute">
            All caught up — no payments waiting for review.
          </p>
        )}
      </div>

      {zoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-6"
          onClick={() => setZoomed(null)}
        >
          <button className="absolute right-6 top-6 text-paper" onClick={() => setZoomed(null)}>
            <X size={28} />
          </button>
          <img src={zoomed} alt="Proof of payment zoomed" className="max-h-full max-w-full rounded-sm" />
        </div>
      )}
    </div>
  );
}

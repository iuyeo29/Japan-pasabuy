import { notFound } from "next/navigation";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { getOrderByNumber } from "@/lib/orders";
import { orderStatuses, statusLabels } from "@/lib/data";

export default async function OrderTrackingPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await getOrderByNumber(params.id);
  if (!order) notFound();

  const currentIndex = orderStatuses.indexOf(
    order.currentStatus as (typeof orderStatuses)[number]
  );
  const rejected = order.currentStatus === "PAYMENT_REJECTED";
  const latestPayment = order.payments[0];

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="text-center">
        <div className="hanko mx-auto h-16 w-16 animate-stamp text-stamp">
          <CheckCircle2 size={22} />
        </div>
        <h1 className="mt-6 font-display text-3xl italic">Order Received</h1>
        <p className="mt-2 text-mute">
          Order <span className="font-mono">{order.orderNumber}</span>
        </p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-mute">
          {rejected
            ? "There's an issue with your payment — see the note below."
            : "We've received your order and proof of payment. You'll be notified as soon as it's verified."}
        </p>
      </div>

      {rejected && latestPayment?.rejectionNote && (
        <div className="mx-auto mt-8 max-w-md rounded-sm bg-stamp-light p-4 text-center text-sm text-stamp">
          <strong>Payment rejected:</strong> {latestPayment.rejectionNote}
          <div className="mt-2 text-xs">
            You can submit a new proof of payment for this same order — contact
            us to re-upload.
          </div>
        </div>
      )}

      <div className="mt-10 rounded-sm border border-line p-6">
        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <div>
            <div className="eyebrow text-mute">Items</div>
            <div className="mt-1 font-mono">{order.items.length}</div>
          </div>
          <div>
            <div className="eyebrow text-mute">Total</div>
            <div className="mt-1 font-mono">₱{Number(order.totalAmount).toLocaleString()}</div>
          </div>
          <div>
            <div className="eyebrow text-mute">Payment Method</div>
            <div className="mt-1 font-mono">{latestPayment?.method ?? "—"}</div>
          </div>
          <div>
            <div className="eyebrow text-mute">Placed</div>
            <div className="mt-1 font-mono">
              {new Date(order.createdAt).toLocaleDateString("en-PH", {
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>
        </div>
      </div>

      {!rejected && (
        <ol className="mt-10 space-y-0">
          {orderStatuses.map((status, i) => {
            const done = i < currentIndex;
            const active = i === currentIndex;
            return (
              <li key={status} className="relative flex gap-4 pb-8 last:pb-0">
                {i < orderStatuses.length - 1 && (
                  <span
                    className={`absolute left-[11px] top-6 h-full w-px ${
                      done ? "bg-stamp" : "bg-line"
                    }`}
                  />
                )}
                <span className="z-10 mt-0.5">
                  {done ? (
                    <CheckCircle2 size={22} className="text-stamp" />
                  ) : active ? (
                    <Clock size={22} className="text-stamp" />
                  ) : (
                    <Circle size={22} className="text-line" />
                  )}
                </span>
                <span
                  className={`text-sm ${
                    active ? "font-medium text-ink" : done ? "text-ink" : "text-mute"
                  }`}
                >
                  {statusLabels[status]}
                  {active && (
                    <span className="ml-2 rounded-sm bg-stamp-light px-2 py-0.5 text-xs text-stamp">
                      Current
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

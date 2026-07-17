import { Availability } from "@/lib/data";

const labels: Record<Availability, string> = {
  AVAILABLE: "Available",
  LIMITED_STOCK: "Limited Stock",
  PREORDER: "Preorder",
  SOLD_OUT: "Sold Out",
};

const styles: Record<Availability, string> = {
  AVAILABLE: "text-stamp",
  LIMITED_STOCK: "text-stamp",
  PREORDER: "text-mute",
  SOLD_OUT: "text-mute opacity-50",
};

export function AvailabilityBadge({ status }: { status: Availability }) {
  return (
    <span className={`eyebrow inline-flex items-center gap-1.5 ${styles[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {labels[status]}
    </span>
  );
}

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="hanko h-11 w-11 shrink-0 animate-stamp text-stamp">
      <span className="eyebrow text-[9px] leading-none">{children}</span>
    </span>
  );
}

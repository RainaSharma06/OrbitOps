import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const isError =
    normalized.includes("fail") || normalized.includes("reject") || normalized.includes("cancel");
  const isPending =
    normalized.includes("wait") || normalized.includes("pending") || normalized.includes("change");
  const isSuccess =
    normalized.includes("complete") ||
    normalized.includes("approve") ||
    normalized.includes("generated") ||
    normalized.includes("active") ||
    normalized.includes("qualified");

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-subtle)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-strong)]">
      <span
        className={cn(
          "size-1.5 rounded-full",
          isError
            ? "bg-red-500"
            : isPending
              ? "bg-amber-400"
              : isSuccess
                ? "bg-emerald-400"
                : "bg-neutral-400"
        )}
      />
      {status.replaceAll("_", " ")}
    </span>
  );
}

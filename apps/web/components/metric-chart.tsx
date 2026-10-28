import type { ChartPoint } from "@/lib/types";
import { Card } from "@/components/ui/card";

export function MetricChart({
  title,
  data,
  suffix = "",
  description,
}: {
  title: string;
  data: ChartPoint[];
  suffix?: string;
  description?: string;
}) {
  const max = Math.max(1, ...data.map((item) => item.value));

  return (
    <Card className="p-5 transition-all duration-200 hover:border-[var(--border-strong)]">
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-strong">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
      </div>
      <div className="space-y-3.5">
        {data.length === 0 ? (
          <p className="text-sm text-muted">No activity recorded yet.</p>
        ) : (
          data.map((item) => (
            <div key={item.label} className="grid grid-cols-[100px_1fr_auto] items-center gap-3 text-xs">
              <span className="truncate text-muted">{item.label}</span>
              <div className="h-1.5 overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface-subtle)]">
                <div
                  className="h-full rounded-full bg-[var(--text-strong)] transition-all duration-300"
                  style={{ width: `${Math.max(4, (item.value / max) * 100)}%` }}
                />
              </div>
              <span className="tabular font-mono font-semibold text-strong">
                {item.value}
                {suffix}
              </span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

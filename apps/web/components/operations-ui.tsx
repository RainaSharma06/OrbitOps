import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ChartPoint } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  detail,
  trend,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  detail?: string;
  trend?: number;
  icon: LucideIcon;
  tone?: string;
}) {
  const Trend = trend === undefined ? Minus : trend >= 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className="p-4 sm:p-5 transition-all duration-200 hover:border-[var(--border-strong)]">
      <div className="flex items-start justify-between">
        <span className="grid size-9 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--text-strong)] shadow-2xs">
          <Icon size={16} />
        </span>
        {trend !== undefined && (
          <span className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface-subtle)] px-2 py-0.5 font-mono text-[11px] font-medium text-[var(--text-strong)]">
            <Trend size={11} className={trend >= 0 ? "text-emerald-500" : "text-red-500"} />
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="tabular mt-3 text-2xl font-bold tracking-tight text-strong sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs font-medium text-muted">{label}</p>
      {detail && <p className="mt-2 font-mono text-[10px] text-muted">{detail}</p>}
    </Card>
  );
}

export function TrendChart({
  title,
  description,
  data,
  color,
  suffix = "",
}: {
  title: string;
  description?: string;
  data: ChartPoint[];
  color?: string;
  suffix?: string;
}) {
  const values = data.map((item) => item.value),
    max = Math.max(...values, 1),
    min = Math.min(...values, 0),
    range = Math.max(max - min, 1);
  const points = data
    .map(
      (item, index) =>
        `${data.length === 1 ? 50 : (index / (data.length - 1)) * 100},${92 - ((item.value - min) / range) * 72}`
    )
    .join(" ");
  const last = data.at(-1)?.value || 0;
  const gradientId = `trend-${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
  const strokeColor = color || "var(--text-strong)";

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:border-[var(--border-strong)]">
      <div className="flex items-start justify-between p-5 pb-2">
        <div>
          <h2 className="text-sm font-semibold text-strong">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
        </div>
        <p className="tabular font-mono text-xl font-bold text-strong">
          {last.toLocaleString()}
          {suffix}
        </p>
      </div>
      <div className="h-40 px-3 pb-3">
        <svg
          role="img"
          aria-label={`${title} trend`}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="h-full w-full overflow-visible"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.18" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`M ${points} L 100,100 L 0,100 Z`} fill={`url(#${gradientId})`} />
          <polyline
            points={points}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="flex justify-between border-t border-[var(--border)] px-5 py-2.5 font-mono text-[10px] text-muted">
        {data.slice(0, 6).map((item) => (
          <span key={item.label}>{item.label}</span>
        ))}
      </div>
    </Card>
  );
}

export function SectionHeading({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-3 mt-8 flex items-center justify-between">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted font-mono">{title}</h2>
      {action}
    </div>
  );
}

"use client";

import {
  Activity,
  Bot,
  BrainCircuit,
  Building2,
  ChevronLeft,
  ChevronRight,
  FileChartColumn,
  GitBranch,
  LayoutDashboard,
  MessagesSquare,
  ScrollText,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { DashboardSummary, User } from "@/lib/types";
import { cn } from "@/lib/utils";

export const navigation = [
  ["Dashboard", "/", LayoutDashboard, "main"],
  ["Leads", "/leads", UserRound, "main"],
  ["Workflows", "/workflows", GitBranch, "main"],
  ["Approvals", "/approvals", ShieldCheck, "main"],
  ["Communications", "/communications", MessagesSquare, "main"],
  ["Reports", "/reports", FileChartColumn, "main"],
  ["Agent monitor", "/agents", Bot, "ai"],
  ["AI Operations", "/ai-ops", BrainCircuit, "ai"],
  ["Audit logs", "/audit", ScrollText, "admin"],
  ["Users", "/users", Users, "admin"],
  ["Settings", "/settings", Settings, "admin"],
] as const;

export function Sidebar({
  collapsed,
  onCollapse,
  me,
  summary,
}: {
  collapsed: boolean;
  onCollapse: () => void;
  me: User | null;
  summary: DashboardSummary | null;
}) {
  const pathname = usePathname();
  const visible = navigation.filter(
    ([label, , , group]) =>
      group !== "admin" || me?.role === "admin" || (label === "Audit logs" && me?.role === "manager")
  );

  return (
    <aside
      aria-label="Workspace navigation"
      className={cn(
        "fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-[var(--border)] bg-[var(--sidebar)] text-[var(--text)] transition-[width] duration-200 lg:flex",
        collapsed ? "w-[76px]" : "w-[248px]"
      )}
    >
      {/* Brand header */}
      <div className="flex h-16 items-center gap-3 border-b border-[var(--border)] px-4">
        <Link href="/" aria-label="OrbitOps home" className="flex min-w-0 items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--brand)] text-[var(--brand-contrast)] shadow-sm">
            <Sparkles size={17} />
          </span>
          {!collapsed && (
            <span className="truncate">
              <b className="block text-sm font-semibold tracking-tight text-strong">OrbitOps</b>
              <small className="block text-[10px] font-medium uppercase tracking-[.14em] text-muted">
                Command center
              </small>
            </span>
          )}
        </Link>
        <button
          onClick={onCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "ml-auto grid size-7 shrink-0 place-items-center rounded-lg border border-[var(--border)] text-muted hover:bg-[var(--surface-subtle)] hover:text-strong transition",
            collapsed && "absolute -right-3 top-[74px] border border-[var(--border)] bg-[var(--surface)] shadow-md"
          )}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </div>

      {/* Workspace pill */}
      {!collapsed && (
        <div className="mx-3 mt-3 flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5 shadow-xs">
          <span className="grid size-7 place-items-center rounded-lg bg-[var(--surface-subtle)] text-strong border border-[var(--border)]">
            <Building2 size={13} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold text-strong">OrbitOps Workspace</span>
            <span className="block text-[10px] text-muted">Production · Enterprise</span>
          </span>
        </div>
      )}

      {/* Nav items */}
      <nav className="mt-4 flex-1 space-y-1 overflow-y-auto px-3">
        {visible.map(([label, href, Icon, group], index) => {
          const active = href === "/" ? pathname === href : pathname.startsWith(href);
          const prev = visible[index - 1]?.[3];

          return (
            <div key={href}>
              {group !== prev && !collapsed && (
                <p className="mb-1.5 mt-5 px-2 font-mono text-[10px] font-semibold uppercase tracking-[.16em] text-muted first:mt-1">
                  {group === "main" ? "Workspace" : group === "ai" ? "AI Pipeline" : "Admin"}
                </p>
              )}
              <Link
                title={collapsed ? label : undefined}
                href={href as never}
                className={cn(
                  "group relative flex min-h-9 items-center gap-3 rounded-xl px-3 text-[13px] font-medium transition-all duration-150",
                  active
                    ? "bg-[var(--surface-subtle)] text-strong font-semibold border border-[var(--border)] shadow-xs"
                    : "text-muted hover:bg-[var(--surface-subtle)] hover:text-strong",
                  collapsed && "justify-center px-0"
                )}
              >
                <Icon size={16} className={cn(active ? "text-strong" : "text-muted group-hover:text-strong")} />
                {!collapsed && <span className="flex-1">{label}</span>}
                {!collapsed && label === "Approvals" && Boolean(summary?.pending_approvals) && (
                  <span className="ml-auto rounded-full border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5 font-mono text-[10px] font-bold text-strong">
                    {summary?.pending_approvals}
                  </span>
                )}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* System health footer */}
      {!collapsed && (
        <div className="mx-3 mb-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-xs">
          <div className="flex items-center gap-2 text-[11px] font-medium text-strong">
            <Activity size={13} className="text-muted" /> Systems Online
            <span className="ml-auto size-2 rounded-full bg-emerald-500 shadow-xs" />
          </div>
          <p className="mt-1 text-[10px] text-muted">
            {summary
              ? `${summary.active_runs} active runs · ${summary.success_rate}% success`
              : "Synchronizing status…"}
          </p>
        </div>
      )}
    </aside>
  );
}

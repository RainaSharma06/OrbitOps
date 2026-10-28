"use client";

import { Bell, ChevronDown, Command, Menu, Search, TriangleAlert, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { navigation, Sidebar } from "@/components/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { api } from "@/lib/api";
import type { DashboardSummary, User } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(),
    router = useRouter();
  const [mobile, setMobile] = useState(false),
    [collapsed, setCollapsed] = useState(false),
    [searchOpen, setSearchOpen] = useState(false),
    [profileOpen, setProfileOpen] = useState(false),
    [me, setMe] = useState<User | null>(null),
    [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    setCollapsed(localStorage.getItem("orbitops-sidebar") === "collapsed");
    if (pathname !== "/login")
      void Promise.all([api<User>("/auth/me"), api<DashboardSummary>("/dashboard/summary")])
        .then(([user, data]) => {
          setMe(user);
          setSummary(data);
        })
        .catch(() => {});
  }, [pathname]);

  useEffect(() => {
    function key(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((value) => !value);
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setProfileOpen(false);
        setMobile(false);
      }
    }
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, []);

  const visible = useMemo(
    () =>
      navigation.filter(
        ([label, , , group]) =>
          group !== "admin" || me?.role === "admin" || (label === "Audit logs" && me?.role === "manager")
      ),
    [me]
  );

  if (pathname === "/login") return <main className="min-h-screen">{children}</main>;

  function toggleCollapse() {
    setCollapsed((value) => {
      localStorage.setItem("orbitops-sidebar", value ? "expanded" : "collapsed");
      return !value;
    });
  }

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/login");
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Sidebar collapsed={collapsed} onCollapse={toggleCollapse} me={me} summary={summary} />

      {/* Main sticky topbar */}
      <header
        className={cn(
          "sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)]/80 px-4 backdrop-blur-xl transition-[margin] duration-200 lg:px-6",
          collapsed ? "lg:ml-[76px]" : "lg:ml-[248px]"
        )}
      >
        <button
          aria-label={mobile ? "Close navigation" : "Open navigation"}
          onClick={() => setMobile(!mobile)}
          className="grid size-9 place-items-center rounded-xl border border-[var(--border)] text-muted hover:bg-[var(--surface-subtle)] hover:text-strong lg:hidden"
        >
          {mobile ? <X size={18} /> : <Menu size={18} />}
        </button>

        {/* Global Search trigger */}
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden h-9 w-full max-w-[360px] items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] px-3 text-left text-xs text-muted hover:border-[var(--border-strong)] transition md:flex"
        >
          <Search size={14} />
          <span className="flex-1">Search leads, workflows, reports…</span>
          <kbd className="flex items-center gap-0.5 rounded-md border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5 font-mono text-[10px]">
            <Command size={10} />K
          </kbd>
        </button>

        {/* Right action area */}
        <div className="ml-auto flex items-center gap-2">
          {Boolean(summary?.failed_workflows) && (
            <button
              aria-label="Workflow alerts"
              className="relative hidden h-9 items-center gap-2 rounded-xl border border-[var(--border)] px-3 text-xs text-muted hover:bg-[var(--surface-subtle)] sm:flex"
            >
              <TriangleAlert size={14} className="text-amber-500" />
              <span>{summary?.failed_workflows} alerts</span>
            </button>
          )}

          <ThemeToggle />

          <button
            aria-label="Notifications"
            className="relative grid size-9 place-items-center rounded-xl border border-[var(--border)] text-muted hover:bg-[var(--surface-subtle)] hover:text-strong transition"
          >
            <Bell size={15} />
            {Boolean(summary?.pending_approvals) && (
              <i className="absolute right-2 top-2 size-1.5 rounded-full bg-neutral-900 dark:bg-white" />
            )}
          </button>

          {/* User profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex h-9 items-center gap-2 rounded-xl border border-[var(--border)] p-1 pr-2 hover:bg-[var(--surface-subtle)] transition"
            >
              <span className="grid size-7 place-items-center rounded-lg bg-[var(--brand)] text-[var(--brand-contrast)] font-mono text-xs font-bold">
                {me?.full_name?.split(" ").map((p) => p[0]).join("").slice(0, 2) || "AD"}
              </span>
              <span className="hidden text-left xl:block">
                <b className="block max-w-28 truncate text-xs font-semibold text-strong">
                  {me?.full_name || "Admin"}
                </b>
              </span>
              <ChevronDown size={13} className="text-muted" />
            </button>

            {profileOpen && (
              <div className="app-surface absolute right-0 top-11 w-56 rounded-2xl border border-[var(--border)] p-1.5 shadow-xl">
                <div className="border-b border-[var(--border)] px-3 py-2">
                  <p className="truncate text-xs font-semibold text-strong">{me?.email || "admin@example.com"}</p>
                  <p className="mt-0.5 text-[10px] text-muted">OrbitOps Enterprise</p>
                </div>
                <Link
                  href="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="mt-1 block rounded-xl px-3 py-2 text-xs font-medium hover:bg-[var(--surface-subtle)]"
                >
                  Workspace settings
                </Link>
                <button
                  onClick={signOut}
                  className="w-full rounded-xl px-3 py-2 text-left text-xs font-medium text-red-500 hover:bg-[var(--surface-subtle)]"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile nav drawer */}
      {mobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation overlay"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobile(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-[84%] max-w-[300px] overflow-y-auto bg-[var(--surface)] p-4 text-[var(--text)] border-r border-[var(--border)] shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <b className="text-sm font-semibold text-strong">OrbitOps</b>
              <button
                aria-label="Close navigation"
                onClick={() => setMobile(false)}
                className="grid size-9 place-items-center rounded-xl border border-[var(--border)]"
              >
                <X size={17} />
              </button>
            </div>
            <nav aria-label="Mobile navigation" className="space-y-1">
              {visible.map(([label, href, Icon]) => (
                <Link
                  key={href}
                  href={href as never}
                  onClick={() => setMobile(false)}
                  className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium hover:bg-[var(--surface-subtle)]"
                >
                  <Icon size={17} className="text-muted" />
                  {label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Global Command palette */}
      {searchOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Global search"
          className="fixed inset-0 z-60 flex items-start justify-center bg-black/60 px-4 pt-[14vh] backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setSearchOpen(false);
          }}
        >
          <div className="app-surface w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--border)] shadow-2xl">
            <label className="flex items-center gap-3 border-b border-[var(--border)] px-4">
              <Search size={18} className="text-muted" />
              <input
                autoFocus
                aria-label="Search workspace"
                placeholder="Type to search workflows, leads, or actions…"
                className="h-14 flex-1 bg-transparent text-sm text-strong outline-none"
              />
              <kbd className="rounded-md border border-[var(--border)] px-1.5 py-0.5 font-mono text-[10px] text-muted">
                ESC
              </kbd>
            </label>
            <div className="p-2">
              <p className="px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[.14em] text-muted">
                Navigation
              </p>
              {visible.slice(0, 8).map(([label, href, Icon]) => (
                <button
                  key={href}
                  onClick={() => {
                    setSearchOpen(false);
                    router.push(href);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-muted hover:bg-[var(--surface-subtle)] hover:text-strong transition"
                >
                  <Icon size={16} />
                  <span>{label}</span>
                  <span className="ml-auto font-mono text-[10px] text-muted">Jump →</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <main
        className={cn(
          "min-h-[calc(100vh-4rem)] p-4 transition-[margin] duration-200 sm:p-6 xl:p-8",
          collapsed ? "lg:ml-[76px]" : "lg:ml-[248px]"
        )}
      >
        {children}
      </main>
    </div>
  );
}

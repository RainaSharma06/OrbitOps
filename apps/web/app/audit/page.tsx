"use client";

import { Filter } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { EmptyState, ErrorState, LoadingState } from "@/components/page-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { AuditLog, User } from "@/lib/types";

export default function AuditPage() {
  const [items, setItems] = useState<AuditLog[]>([]),
    [users, setUsers] = useState<User[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [action, setAction] = useState(""),
    [resource, setResource] = useState(""),
    [actor, setActor] = useState(""),
    [from, setFrom] = useState(""),
    [to, setTo] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (action) params.set("action", action);
      if (resource) params.set("resource_type", resource);
      if (actor) params.set("actor_id", actor);
      if (from) params.set("date_from", new Date(`${from}T00:00:00Z`).toISOString());
      if (to) params.set("date_to", new Date(`${to}T23:59:59Z`).toISOString());
      const me = await api<User>("/auth/me");
      const data = await api<AuditLog[]>(`/audit-logs?${params}`);
      setItems(data);
      if (me.role === "admin") setUsers(await api<User[]>("/users"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load audit log");
    } finally {
      setLoading(false);
    }
  }, [action, resource, actor, from, to]);

  useEffect(() => {
    void load();
  }, [load]);

  const actions = [...new Set(items.map((item) => item.action))];
  const status = (actionName: string) =>
    actionName.includes("error") ? "failed" : actionName.includes("rejected") ? "rejected" : "success";

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader eyebrow="Governance" title="Immutable audit logs" />
      <Card className="mb-5 p-4">
        <div className="mb-3 flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-muted">
          <Filter size={15} /> Filters
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <select
            aria-label="Filter by action"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-strong outline-none transition focus:border-[var(--brand)]"
          >
            <option value="">All actions</option>
            {actions.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          <select
            aria-label="Filter by entity"
            value={resource}
            onChange={(e) => setResource(e.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-strong outline-none transition focus:border-[var(--brand)]"
          >
            <option value="">All entities</option>
            {["user", "lead", "workflow_run", "approval", "report", "tenant"].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          <select
            aria-label="Filter by user"
            value={actor}
            onChange={(e) => setActor(e.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-strong outline-none transition focus:border-[var(--brand)]"
          >
            <option value="">All users</option>
            {users.map((user) => (
              <option value={user.id} key={user.id}>
                {user.full_name}
              </option>
            ))}
          </select>
          <input
            aria-label="From date"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-strong outline-none transition focus:border-[var(--brand)]"
          />
          <input
            aria-label="To date"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-strong outline-none transition focus:border-[var(--brand)]"
          />
        </div>
      </Card>

      {error && <ErrorState message={error} retry={load} />}

      {loading ? (
        <LoadingState />
      ) : items.length === 0 ? (
        <EmptyState
          title="No audit events"
          detail="No immutable events match the selected filters."
        />
      ) : (
        <div className="table-shell overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr>
                <th className="p-4">Time</th>
                <th>User</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Status</th>
                <th>IP / Device</th>
                <th className="pr-4">Details</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="align-top hover:bg-[var(--surface-subtle)] transition">
                  <td className="p-4 font-mono text-xs text-muted">
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                  <td className="text-xs font-medium text-strong">
                    {users.find((user) => user.id === item.actor_id)?.full_name ||
                      item.actor_id?.slice(0, 8) ||
                      "System"}
                  </td>
                  <td className="font-semibold text-strong">{item.action}</td>
                  <td className="font-mono text-xs text-muted">
                    {item.resource_type}
                    <p className="text-[10px] text-muted">{item.resource_id?.slice(0, 8)}</p>
                  </td>
                  <td>
                    <StatusBadge status={status(item.action)} />
                  </td>
                  <td className="font-mono text-xs text-muted">{item.ip_address || "Internal"}</td>
                  <td className="max-w-xs pr-4 font-mono text-xs text-muted">
                    {Object.keys(item.details).length ? JSON.stringify(item.details) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

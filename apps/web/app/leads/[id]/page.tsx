"use client";

import { ArrowLeft, CheckCircle2, Circle, Clock3, Mail, MessageCircle, RotateCcw, Send, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ErrorState, LoadingState } from "@/components/page-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { Communication, Lead, TimelineItem, User, Workflow, WorkflowEvent } from "@/lib/types";

const steps = [
  ["sales", "Sales Agent"],
  ["research", "Research Agent"],
  ["email", "Email Draft Agent"],
  ["approval", "Approval Gate"],
  ["report", "Report Agent"],
] as const;

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [lead, setLead] = useState<Lead | null>(null);
  const [runs, setRuns] = useState<Workflow[]>([]);
  const [messages, setMessages] = useState<Communication[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [me, setMe] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [item, history, communication, activity, user] = await Promise.all([
        api<Lead>(`/leads/${id}`),
        api<Workflow[]>(`/workflows?lead_id=${id}`),
        api<Communication[]>(`/communications?lead_id=${id}`),
        api<TimelineItem[]>(`/leads/${id}/timeline`),
        api<User>("/auth/me"),
      ]);
      setLead(item);
      setRuns(history);
      setMessages(communication);
      setTimeline(activity);
      setMe(user);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load lead");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function retry(runId: string) {
    await api(`/workflows/${runId}/retry`, { method: "POST" });
    setNotice("Workflow retry started.");
    await load();
  }

  async function messageAction(message: Communication, action: "approve" | "send" | "retry") {
    await api(`/communications/${message.id}/${action}`, { method: "POST" });
    setNotice(`Message ${action === "retry" ? "retry queued" : `${action}ed`}.`);
    await load();
  }

  async function draftWhatsApp() {
    await api("/communications", {
      method: "POST",
      body: JSON.stringify({
        lead_id: id,
        channel: "whatsapp",
        provider: "mock",
        body: `Hi ${lead?.name.split(" ")[0]}, following up from ${lead?.company}. Reply STOP to opt out.`,
      }),
    });
    setNotice("WhatsApp draft created. Review it before sending.");
    await load();
  }

  if (error) return <ErrorState message={error} retry={load} />;
  if (loading || !lead) return <LoadingState />;

  const run = runs[0];
  const events = (run?.state_snapshot.events || []) as WorkflowEvent[];
  const canManage = me?.role === "admin" || me?.role === "manager";

  function stepState(agent: string) {
    const event = events.find((item) => item.agent === agent);
    if (event) return { status: "completed", event };
    if (agent === "approval" && run?.status === "waiting_approval")
      return { status: "waiting for approval", event: null };
    if (agent === "approval" && run?.status === "completed") return { status: "completed", event: null };
    if (run?.status === "failed" && run.current_agent === agent) return { status: "failed", event: null };
    return { status: "pending", event: null };
  }

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        href="/leads"
        className="mb-5 inline-flex items-center gap-2 text-xs font-mono text-muted hover:text-strong"
      >
        <ArrowLeft size={14} /> Back to leads
      </Link>
      <PageHeader eyebrow={lead.company} title={lead.name} />

      {notice && (
        <p
          role="status"
          className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-3 text-sm text-strong"
        >
          {notice}
        </p>
      )}

      <section className="grid gap-4 md:grid-cols-4">
        <Card className="p-5">
          <p className="eyebrow">Lead score</p>
          <p className="mt-2 font-mono text-3xl font-bold text-strong">{lead.score ?? "—"}</p>
        </Card>
        <Card className="p-5">
          <p className="eyebrow">Priority</p>
          <div className="mt-3">
            <StatusBadge status={lead.priority} />
          </div>
        </Card>
        <Card className="p-5">
          <p className="eyebrow">Qualification</p>
          <div className="mt-3">
            <StatusBadge status={lead.qualification_status || "new"} />
          </div>
        </Card>
        <Card className="p-5">
          <p className="eyebrow">Latest run</p>
          <div className="mt-3">
            <StatusBadge status={run?.status || "not started"} />
          </div>
        </Card>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <Card className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-semibold text-strong">Agent workflow timeline</h2>
            {run?.status === "failed" && (
              <Button size="sm" onClick={() => retry(run.id)}>
                <RotateCcw size={14} /> Retry failed step
              </Button>
            )}
          </div>
          <div className="space-y-1">
            {steps.map(([agent, label]) => {
              const item = stepState(agent);
              const Icon =
                item.status === "completed"
                  ? CheckCircle2
                  : item.status === "failed"
                    ? XCircle
                    : item.status.includes("waiting")
                      ? Clock3
                      : Circle;
              const message =
                item.event?.message || (item.status === "failed" ? run?.error : "No output yet");

              return (
                <div
                  key={agent}
                  className="grid grid-cols-[32px_1fr_auto] gap-3 border-b border-[var(--border)] py-4 last:border-0"
                >
                  <Icon
                    className={
                      item.status === "completed"
                        ? "text-emerald-500"
                        : item.status === "failed"
                          ? "text-red-500"
                          : item.status.includes("waiting")
                            ? "text-amber-400"
                            : "text-muted"
                    }
                    size={20}
                  />
                  <div>
                    <p className="font-medium text-strong">{label}</p>
                    <p className="mt-1 text-xs text-muted leading-relaxed">{message}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={item.status} />
                    {item.event && (
                      <time className="mt-2 block font-mono text-[10px] text-muted">
                        {new Date(item.event.at).toLocaleDateString()}
                      </time>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="font-semibold text-strong">Research summary</h2>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              {run?.state_snapshot.company_summary || "Research has not run yet."}
            </p>
          </Card>
          <Card className="p-5">
            <h2 className="font-semibold text-strong">Email draft preview</h2>
            <p className="mt-3 text-xs font-semibold text-strong">
              {run?.state_snapshot.email_subject || "No subject yet"}
            </p>
            <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-muted">
              {run?.state_snapshot.email_body || "The email agent has not produced a draft."}
            </p>
          </Card>
          <Card className="p-5">
            <h2 className="font-semibold text-strong">Recommended action</h2>
            <p className="mt-3 text-xs font-mono font-medium text-strong">
              {lead.recommended_action || "Run agents to calculate a recommendation."}
            </p>
          </Card>
        </div>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Delivery control</p>
              <h2 className="mt-1 font-semibold text-strong">Email & WhatsApp tracking</h2>
            </div>
            {canManage && (
              <Button size="sm" variant="outline" onClick={draftWhatsApp}>
                <MessageCircle size={14} /> Draft WhatsApp
              </Button>
            )}
          </div>
          <div className="space-y-3">
            {messages.length === 0 ? (
              <p className="text-xs text-muted">No communication drafts yet.</p>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-semibold capitalize text-strong">
                      {message.channel === "email" ? <Mail size={15} /> : <MessageCircle size={15} />}{" "}
                      {message.channel}
                    </div>
                    <StatusBadge status={message.status} />
                  </div>
                  {message.subject && (
                    <p className="mt-2.5 text-xs font-semibold text-strong">{message.subject}</p>
                  )}
                  <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-xs text-muted leading-relaxed">
                    {message.body}
                  </p>
                  <p className="mt-3 font-mono text-[10px] text-muted">
                    {message.provider} · {new Date(message.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <p className="eyebrow">Audit log</p>
          <h2 className="mt-1 font-semibold text-strong">Activity timeline</h2>
          <div className="mt-5 space-y-0">
            {timeline.length === 0 ? (
              <p className="text-xs text-muted">No lead activity yet.</p>
            ) : (
              timeline.map((item, index) => (
                <div key={item.id} className="grid grid-cols-[20px_1fr_auto] gap-3">
                  <div className="flex flex-col items-center">
                    <span className="mt-1 size-2 rounded-full bg-[var(--text-strong)]" />
                    {index < timeline.length - 1 && (
                      <span className="min-h-10 w-px flex-1 bg-[var(--border)]" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-xs font-semibold text-strong">{item.label}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-muted">
                      {String(item.details.message || item.details.intent || item.kind)}
                    </p>
                  </div>
                  <time className="font-mono text-[10px] text-muted">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </time>
                </div>
              ))
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}

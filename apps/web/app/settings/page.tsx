"use client";

import { KeyRound, Save, ShieldCheck } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { ErrorState, LoadingState } from "@/components/page-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { TenantSettings } from "@/lib/types";

const field =
  "mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2.5 text-sm text-strong outline-none transition focus:border-[var(--brand)]";

export default function SettingsPage() {
  const [data, setData] = useState<TenantSettings | null>(null),
    [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await api("/settings"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const updated = await api<TenantSettings>("/settings", {
        method: "PUT",
        body: JSON.stringify({
          company_name: form.get("company_name"),
          llm_provider: form.get("llm_provider"),
          api_key: form.get("api_key") || null,
          whatsapp_enabled: form.get("whatsapp_enabled") === "on",
          email_enabled: form.get("email_enabled") === "on",
          n8n_webhook_url: form.get("n8n_webhook_url") || null,
          report_brand_name: form.get("report_brand_name"),
        }),
      });
      setData(updated);
      setNotice("Workspace settings saved and audited.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader eyebrow="Workspace administration" title="Settings" />
      {notice && (
        <p
          role="status"
          className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-3 text-sm text-strong"
        >
          {notice}
        </p>
      )}
      {error && <ErrorState message={error} retry={load} />}
      {loading || !data ? (
        <LoadingState />
      ) : (
        <form onSubmit={save}>
          <div className="grid gap-5 lg:grid-cols-2">
            <Card className="p-6">
              <h2 className="flex items-center gap-2 font-semibold text-strong">
                <ShieldCheck size={18} />
                Tenant & branding
              </h2>
              <label className="mt-5 block text-xs font-medium text-muted">
                Company name
                <input name="company_name" required defaultValue={data.company_name} className={field} />
              </label>
              <label className="mt-4 block text-xs font-medium text-muted">
                Report brand name
                <input
                  name="report_brand_name"
                  required
                  defaultValue={data.report_brand_name}
                  className={field}
                />
              </label>
              <label className="mt-4 block text-xs font-medium text-muted">
                n8n webhook URL
                <input
                  name="n8n_webhook_url"
                  type="url"
                  defaultValue={data.n8n_webhook_url || ""}
                  className={field}
                  placeholder="https://automation.example/webhook/…"
                />
              </label>
            </Card>

            <Card className="p-6">
              <h2 className="flex items-center gap-2 font-semibold text-strong">
                <KeyRound size={18} />
                AI & integrations
              </h2>
              <label className="mt-5 block text-xs font-medium text-muted">
                LLM provider
                <select name="llm_provider" defaultValue={data.llm_provider} className={field}>
                  <option value="mock">Mock (safe mode)</option>
                  <option value="openai">OpenAI</option>
                  <option value="gemini">Google Gemini</option>
                  <option value="claude">Anthropic Claude</option>
                </select>
              </label>
              <label className="mt-4 block text-xs font-medium text-muted">
                Provider API key
                <input
                  name="api_key"
                  type="password"
                  className={field}
                  placeholder={data.api_key_configured ? "Configured · enter to replace" : "Not configured"}
                />
                <span className="mt-1 block font-mono text-[10px] text-muted">
                  Secrets are write-only and encrypted.
                </span>
              </label>
              <label className="mt-5 flex min-h-12 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-3 cursor-pointer">
                <input
                  name="email_enabled"
                  type="checkbox"
                  defaultChecked={data.email_enabled}
                  className="rounded"
                />
                <span>
                  <b className="block text-xs font-semibold text-strong">Email delivery channel</b>
                  <small className="font-mono text-[10px] text-muted">
                    Human approval required before delivery
                  </small>
                </span>
              </label>
              <label className="mt-3 flex min-h-12 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-3 cursor-pointer">
                <input
                  name="whatsapp_enabled"
                  type="checkbox"
                  defaultChecked={data.whatsapp_enabled}
                  className="rounded"
                />
                <span>
                  <b className="block text-xs font-semibold text-strong">WhatsApp delivery channel</b>
                  <small className="font-mono text-[10px] text-muted">
                    Human approval required before delivery
                  </small>
                </span>
              </label>
            </Card>
          </div>
          <div className="mt-5 flex justify-end">
            <Button disabled={saving}>
              <Save size={15} />
              {saving ? "Saving…" : "Save settings"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

"use client";

import { FormEvent, useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspace: form.get("workspace"),
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({ detail: "Login request failed." }));
        throw new Error(body.detail ?? "Login failed");
      }
      const target = new URLSearchParams(window.location.search).get("next");
      window.location.assign(target?.startsWith("/") ? target : "/");
    } catch (value) {
      setError(value instanceof Error ? value.message : "Login failed");
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-black p-5 text-white selection:bg-white selection:text-black">
      {/* Background radial accent */}
      <div
        className="pointer-events-none fixed inset-0 opacity-40"
        style={{
          background: "radial-gradient(circle at 50% 20%, rgba(255, 255, 255, 0.08) 0%, transparent 60%)",
        }}
      />

      <div className="relative w-full max-w-[420px] rounded-3xl border border-neutral-800 bg-neutral-950/90 p-8 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-white text-black shadow-sm">
            <Sparkles size={17} />
          </span>
          <div>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
              OrbitOps AI
            </span>
            <p className="text-xs text-neutral-500">Autonomous workflow platform</p>
          </div>
        </div>

        <h1 className="mt-6 text-2xl font-bold tracking-tight text-white">Sign in</h1>
        <p className="mt-1 text-xs text-neutral-400">
          Enter your credentials to access your tenant-scoped command center.
        </p>

        <div className="mt-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-3.5 text-xs text-neutral-300">
          <div className="flex items-center gap-2 font-medium text-white">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            <span>Interactive Demo Ready</span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-neutral-400">
            Click <strong>Sign in</strong> with the prefilled credentials to explore the entire UI in offline mode.
          </p>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300">Workspace</label>
            <input
              name="workspace"
              defaultValue="default"
              required
              className="mt-1.5 w-full rounded-xl border border-neutral-800 bg-neutral-900/90 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-white focus:ring-1 focus:ring-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300">Email address</label>
            <input
              name="email"
              type="email"
              autoComplete="email"
              defaultValue="admin@example.com"
              required
              className="mt-1.5 w-full rounded-xl border border-neutral-800 bg-neutral-900/90 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-white focus:ring-1 focus:ring-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300">Password</label>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              defaultValue="admin123456"
              required
              minLength={8}
              className="mt-1.5 w-full rounded-xl border border-neutral-800 bg-neutral-900/90 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-white focus:ring-1 focus:ring-white"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full rounded-xl bg-white py-3 text-sm font-semibold text-black hover:bg-neutral-200"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}

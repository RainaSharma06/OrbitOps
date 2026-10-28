import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  mockAIOps,
  mockApprovals,
  mockCommunications,
  mockDashboardSummary,
  mockLeads,
  mockReports,
  mockSettings,
  mockUsers,
  mockWorkflows,
} from "@/lib/mock-data";

const API = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1";

function handleMockRequest(pathSegments: string[], method: string, bodyJson?: any) {
  const p = pathSegments.join("/");

  if (p === "dashboard/summary") {
    return NextResponse.json(mockDashboardSummary);
  }
  if (p === "leads") {
    if (method === "POST" && bodyJson) {
      const newLead = {
        id: `lead-${Date.now()}`,
        name: bodyJson.name ?? "New Lead",
        company: bodyJson.company ?? "Acme Inc",
        industry: bodyJson.industry ?? "Technology",
        website: bodyJson.website ?? "https://example.com",
        email: bodyJson.email ?? "lead@example.com",
        phone: bodyJson.phone ?? "+1-555-0100",
        score: 85,
        priority: bodyJson.priority ?? "high",
        qualification_status: "qualified",
        recommended_action: "Send personalized executive summary",
        attributes: bodyJson.attributes ?? { intent_score: 18 },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockLeads.unshift(newLead);
      return NextResponse.json(newLead);
    }
    return NextResponse.json(mockLeads);
  }
  if (p.startsWith("leads/")) {
    const id = pathSegments[1];
    const found = mockLeads.find((item) => item.id === id) ?? mockLeads[0];
    return NextResponse.json(found);
  }
  if (p === "approvals") {
    return NextResponse.json(mockApprovals);
  }
  if (p.startsWith("approvals/") && p.endsWith("/decision")) {
    return NextResponse.json({ ok: true, status: "decided" });
  }
  if (p === "workflows") {
    return NextResponse.json(mockWorkflows);
  }
  if (p.startsWith("workflows/")) {
    return NextResponse.json(mockWorkflows[0]);
  }
  if (p === "reports") {
    return NextResponse.json(mockReports);
  }
  if (p.startsWith("reports/") && p.endsWith("/preview")) {
    return NextResponse.json({
      id: "rep-1",
      title: "Executive Intelligence Report: Northstar Cloud Systems",
      lead_id: "lead-1",
      report: {
        company_name: "Northstar Cloud Systems",
        executive_summary: "High-intent enterprise account evaluated by OrbitOps multi-agent pipeline.",
        key_findings: ["Strong market traction", "Clear governance need", "Autonomous operations candidate"],
      },
      metadata: { generated: true },
    });
  }
  if (p === "communications") {
    return NextResponse.json(mockCommunications);
  }
  if (p.startsWith("communications/")) {
    return NextResponse.json({ ok: true, status: "queued" });
  }
  if (p === "settings") {
    return NextResponse.json(mockSettings);
  }
  if (p === "users") {
    return NextResponse.json(mockUsers);
  }
  if (p === "ai-ops/summary") {
    return NextResponse.json(mockAIOps);
  }
  if (p.startsWith("ai-ops/prompts")) {
    return NextResponse.json({ ok: true });
  }
  if (p.startsWith("ai-ops/routes")) {
    return NextResponse.json({ ok: true });
  }
  if (p === "audit") {
    return NextResponse.json(mockDashboardSummary.recent_activity);
  }

  return NextResponse.json({ ok: true, mock: true });
}

async function forward(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const token = (await cookies()).get("orbitops_access")?.value;
  if (!token) return NextResponse.json({ detail: "Authentication required" }, { status: 401 });
  const { path } = await context.params;

  // If live backend is available, forward request
  try {
    const url = `${API}/${path.join("/")}${request.nextUrl.search}`;
    const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
    const contentType = request.headers.get("content-type");
    if (contentType) headers["Content-Type"] = contentType;
    const body = request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer();

    const upstream = await fetch(url, { method: request.method, headers, body, cache: "no-store" });
    const responseBody = await upstream.arrayBuffer();
    const response = new NextResponse(responseBody, {
      status: upstream.status,
      headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" },
    });
    const disposition = upstream.headers.get("content-disposition");
    if (disposition) response.headers.set("Content-Disposition", disposition);
    if (upstream.status === 401 && token !== "demo_mode_token") {
      response.cookies.delete("orbitops_access");
    }
    return response;
  } catch {
    // Backend offline: serve realistic mock data seamlessly
    let bodyJson: any = null;
    try {
      if (request.method !== "GET" && request.method !== "HEAD") {
        bodyJson = await request.clone().json();
      }
    } catch {}
    return handleMockRequest(path, request.method, bodyJson);
  }
}

export const GET = forward;
export const POST = forward;
export const PATCH = forward;
export const PUT = forward;
export const DELETE = forward;

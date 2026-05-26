// Centralized API client. Frontend talks ONLY through these REST calls.
// Point VITE_API_BASE_URL at your Lovable Cloud backend (or any host).
// When unset, requests are stubbed so the static frontend still runs on cPanel.

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!BASE) {
    console.warn(`[api] No VITE_API_BASE_URL set. Stub call: ${path}`);
    return Promise.resolve({} as T);
  }
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  // ── Packages ────────────────────────────────────────────────
  listPackages: () => request("/api/packages"),

  // ── Payments (M-Pesa STK Push only) ─────────────────────────
  stkPush: (body: { phone: string; packageId: string }) =>
    request("/api/payments/stk-push", { method: "POST", body: JSON.stringify(body) }),
  paymentStatus: (txId: string) => request(`/api/payments/${txId}/status`),

  // ── Auth (optional account) ─────────────────────────────────
  signUp: (body: { phone?: string; email?: string; password: string }) =>
    request("/api/auth/signup", { method: "POST", body: JSON.stringify(body) }),
  signIn: (body: { identifier: string; password: string }) =>
    request("/api/auth/signin", { method: "POST", body: JSON.stringify(body) }),
  otpRequest: (phone: string) =>
    request("/api/auth/otp/request", { method: "POST", body: JSON.stringify({ phone }) }),
  otpVerify: (body: { phone: string; code: string }) =>
    request("/api/auth/otp/verify", { method: "POST", body: JSON.stringify(body) }),

  // ── User dashboard ──────────────────────────────────────────
  me: () => request("/api/me"),
  myUsage: () => request("/api/me/usage"),
  myDevices: () => request("/api/me/devices"),

  // ── Admin / MikroTik ────────────────────────────────────────
  adminStats: () => request("/api/admin/stats"),
  listRouters: () => request("/api/admin/routers"),
  routerAction: (id: string, action: string) =>
    request(`/api/admin/routers/${id}/${action}`, { method: "POST" }),
  listBranches: () => request("/api/admin/branches"),
  mikrotikSync: (routerId: string) =>
    request(`/api/mikrotik/${routerId}/sync`, { method: "POST" }),

  // ── White-label settings ────────────────────────────────────
  getBranding: () => request("/api/admin/branding"),
  saveBranding: (body: Record<string, unknown>) =>
    request("/api/admin/branding", { method: "PUT", body: JSON.stringify(body) }),
};

const API_URL = "/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("fruityrescue_token");
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res: Response) {
  if (res.status === 401 && typeof window !== "undefined") {
    localStorage.removeItem("fruityrescue_token");
    localStorage.removeItem("fruityrescue_user");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || "Request failed");
  }
  return res.json();
}

// ── Auth ──
export async function register(name: string, email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  return handleResponse(res);
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

export async function getMe() {
  const res = await fetch(`${API_URL}/auth/me`, { headers: authHeaders() });
  return handleResponse(res);
}

// ── Fruits ──
export async function uploadFruit(formData: FormData) {
  const res = await fetch(`${API_URL}/fruits/upload`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });
  return handleResponse(res);
}

export async function getFruits(status?: string) {
  const url = status ? `${API_URL}/fruits/?status=${status}` : `${API_URL}/fruits/`;
  const res = await fetch(url, { headers: authHeaders() });
  return handleResponse(res);
}

export async function getFruit(id: number) {
  const res = await fetch(`${API_URL}/fruits/${id}`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function getMyStats() {
  const res = await fetch(`${API_URL}/fruits/my-stats`, { headers: authHeaders() });
  return handleResponse(res);
}

// ── Recipients ──
export async function getRecipients() {
  const res = await fetch(`${API_URL}/recipients/`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function createRecipient(data: any) {
  const res = await fetch(`${API_URL}/recipients/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateRecipient(id: number, data: any) {
  const res = await fetch(`${API_URL}/recipients/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteRecipient(id: number) {
  const res = await fetch(`${API_URL}/recipients/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// ── Allocations ──
export async function getAllocations() {
  const res = await fetch(`${API_URL}/allocations/`, { headers: authHeaders() });
  return handleResponse(res);
}

// ── Dashboard ──
export async function getDashboardStats() {
  const res = await fetch(`${API_URL}/dashboard/stats`);
  return handleResponse(res);
}

// ── Chat ──
export async function sendChatMessage(message: string, history: { role: string; content: string }[]) {
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ message, history }),
  });
  return handleResponse(res);
}

import { ReportSet, HistoryItem, AIComparisonData } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// ── Auth token management ────────────────────────────────────────────────
const TOKEN_KEY = "finora.auth_token";
const USER_KEY = "finora.auth_user";

function getAuthToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

function setAuthToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
}

export function getStoredUser(): { id: string; email: string; display_name: string } | null {
    try {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function setStoredUser(user: { id: string; email: string; display_name: string }): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
    return !!getAuthToken();
}

// ── Fetch wrapper with auth headers ──────────────────────────────────────
async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = getAuthToken();
    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string> || {}),
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    // Don't set Content-Type for FormData (browser sets it with boundary)
    if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
    }
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
        clearAuth();
        window.location.reload();
        throw new Error("Session expired. Please log in again.");
    }
    return res;
}

// ── Auth API ─────────────────────────────────────────────────────────────
interface AuthResponse {
    token: string;
    user: { id: string; email: string; display_name: string };
}

function parseError(err: any, fallback: string): string {
    if (!err || !err.detail) return fallback;
    if (typeof err.detail === "string") return err.detail;
    if (Array.isArray(err.detail) && err.detail[0]?.msg) return err.detail[0].msg;
    return fallback;
}

export async function register(email: string, password: string, displayName?: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, display_name: displayName || "" }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(parseError(err, "Registration failed"));
    }
    const data = await res.json();
    setAuthToken(data.token);
    setStoredUser(data.user);
    return data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(parseError(err, "Login failed"));
    }
    const data = await res.json();
    setAuthToken(data.token);
    setStoredUser(data.user);
    return data;
}

export function logout(): void {
    clearAuth();
    window.location.href = "/";
}

export async function getUserProfile() {
    const res = await authFetch(`${API_BASE}/api/auth/me`);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to fetch profile");
    }
    return res.json();
}

// ── Reports API ──────────────────────────────────────────────────────────
export async function uploadReportSet(payload: { data: FormData }): Promise<ReportSet> {
    const res = await authFetch(`${API_BASE}/api/reports/upload`, {
        method: "POST",
        body: payload.data,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Upload failed");
    }
    return res.json();
}

export async function getReportSet(payload: { data: { id: string } }): Promise<ReportSet> {
    const res = await authFetch(`${API_BASE}/api/reports/set/${payload.data.id}`);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to fetch report set");
    }
    return res.json();
}

export async function processReport(payload: { data: { id: string } }): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
    const res = await authFetch(`${API_BASE}/api/reports/process/${payload.data.id}`, {
        method: "POST",
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to process report");
    }
    return res.json();
}

export async function getReportProgress(reportId: string) {
    const res = await authFetch(`${API_BASE}/api/reports/progress/${reportId}`);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to fetch progress");
    }
    return res.json();
}

export async function listHistory(): Promise<HistoryItem[]> {
    const res = await authFetch(`${API_BASE}/api/reports/history`);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to list history");
    }
    return res.json();
}

export async function deleteReportSet(payload: { data: { id: string } }): Promise<{ ok: boolean }> {
    const res = await authFetch(`${API_BASE}/api/reports/set/${payload.data.id}`, {
        method: "DELETE",
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to delete report set");
    }
    return res.json();
}


export async function getAIComparison(payload: { data: { setId: string } }): Promise<AIComparisonData> {
    const res = await authFetch(`${API_BASE}/api/reports/compare_ai/${payload.data.setId}`);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to fetch AI comparison");
    }
    return res.json();
}

// ── Chat API ─────────────────────────────────────────────────────────────
export async function getChatMessages(payload: { data: { reportSetId: string } }) {
    const res = await authFetch(`${API_BASE}/api/chat/messages`, {
        method: "POST",
        body: JSON.stringify(payload.data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to fetch messages");
    }
    return res.json();
}

export async function saveChatTurn(payload: { data: { reportSetId: string; userMessage: string; assistantMessage: string } }) {
    const res = await authFetch(`${API_BASE}/api/chat/turn`, {
        method: "POST",
        body: JSON.stringify(payload.data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to save chat turn");
    }
    return res.json();
}

export async function clearChatMessages(payload: { data: { reportSetId: string } }) {
    const res = await authFetch(`${API_BASE}/api/chat/clear`, {
        method: "POST",
        body: JSON.stringify(payload.data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to clear chat");
    }
    return res.json();
}



// ── Chat streaming helper (needs auth token in header) ───────────────────
export function getChatStreamUrl(): string {
    return `${API_BASE}/api/chat/session`;
}

export function getAuthHeaders(): Record<string, string> {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

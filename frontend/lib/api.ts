/**
 * api.ts — typed fetch wrappers for the CheckIn backend.
 *
 * All functions throw on non-2xx responses so callers can handle errors
 * with try/catch.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL || '/api'

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("checkin_token");
}

export function setToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("checkin_token", token);
  }
}

export function removeToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("checkin_token");
  }
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    headers: { ...headers, ...init?.headers },
    ...init,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EntryOut {
  id: number
  user_id: number
  entry_date: string  // ISO date "YYYY-MM-DD"
  entry_time: string  // "HH:MM:SS"
  note: string | null
  created_at: string
}

export interface PreviewResponse {
  week_days_used: number
  weekly_limit: number
  exceeds_limit: boolean
}

export interface ConfirmResponse extends PreviewResponse {
  entry: EntryOut
}

export interface WeekStats {
  days_used: number
  limit: number
  week_start: string
  week_end: string
}

export interface MonthStats {
  days_this_month: number
  days_last_month: number
  goal: number | null
}

export interface StreakStats {
  current_streak_days: number
  longest_streak_days: number
}

export interface Settings {
  weekly_limit: number
  monthly_goal: number | null
  name: string
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface OtpResponse {
  message: string
  mock_otp: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export async function requestSignup(data: { name: string; phone_number: string; email: string; password: string }) {
  const res = await fetch(`${BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.detail || 'Failed to sign up')
  }
  return res.json()
}

export async function verifySignup(phone_number: string, code: string) {
  const res = await fetch(`${BASE}/auth/verify-signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone_number, code }),
  })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.detail || 'Invalid verification code')
  }
  return res.json()
}

export async function loginUser(identifier: string, password: string) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.detail || 'Invalid credentials')
  }
  return res.json()
}



// ---------------------------------------------------------------------------
// Entries
// ---------------------------------------------------------------------------

export function previewCheckin(note?: string): Promise<PreviewResponse> {
  return req<PreviewResponse>('/entries/preview', {
    method: 'POST',
    body: JSON.stringify({ note: note ?? null }),
  })
}

export function confirmCheckin(note?: string): Promise<ConfirmResponse> {
  return req<ConfirmResponse>('/entries/confirm', {
    method: 'POST',
    body: JSON.stringify({ note: note ?? null }),
  })
}

export function getEntries(month: string): Promise<EntryOut[]> {
  return req<EntryOut[]>(`/entries?month=${month}`)
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

export function getWeekStats(): Promise<WeekStats> {
  return req<WeekStats>('/stats/week')
}

export function getMonthStats(): Promise<MonthStats> {
  return req<MonthStats>('/stats/month')
}

export function getStreakStats(): Promise<StreakStats> {
  return req<StreakStats>('/stats/streak')
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export function getSettings(): Promise<Settings> {
  return req<Settings>('/settings')
}

export function updateSettings(patch: Partial<Omit<Settings, 'monthly_goal'>> & { monthly_goal?: number | null }): Promise<Settings> {
  return req<Settings>('/settings', {
    method: 'PUT',
    body: JSON.stringify(patch),
  })
}

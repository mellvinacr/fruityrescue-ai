export function saveToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("fruityrescue_token", token);
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("fruityrescue_token");
}

export function clearToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("fruityrescue_token");
    localStorage.removeItem("fruityrescue_user");
  }
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export function saveUser(user: any) {
  if (typeof window !== "undefined") {
    localStorage.setItem("fruityrescue_user", JSON.stringify(user));
  }
}

export function getUser(): any | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("fruityrescue_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isAdmin(): boolean {
  return getUser()?.role === "admin";
}

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN ?? "";
const BASE = `${API_ORIGIN}/api`;
async function request(path, options) {
    const token = typeof window !== "undefined" ? localStorage.getItem("user_session") : null;
    const headers = new Headers(options?.headers);
    if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }
    const res = await fetch(`${BASE}${path}`, {
        credentials: "include",
        ...options,
        headers,
    });
    return res.json();
}
export const api = {
    get: (path) => request(path),
    post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
    patch: (path, body) => request(path, { method: "PATCH", body: JSON.stringify(body) }),
};

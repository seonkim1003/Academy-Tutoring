const API_ORIGIN = import.meta.env.VITE_API_ORIGIN ?? "";
const BASE = `${API_ORIGIN}/api`;
async function request(path, options) {
    const res = await fetch(`${BASE}${path}`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        ...options,
    });
    return res.json();
}
export const api = {
    get: (path) => request(path),
    post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
    patch: (path, body) => request(path, { method: "PATCH", body: JSON.stringify(body) }),
};

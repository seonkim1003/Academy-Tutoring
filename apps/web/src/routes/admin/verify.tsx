import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";

export function AdminVerify() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setError("Missing login token.");
      return;
    }
    api.get<void>(`/admin/verify?token=${token}`).then((res) => {
      if (res.success) {
        navigate("/admin/dashboard", { replace: true });
      } else {
        setError(res.error ?? "Invalid or expired link.");
      }
    });
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <p className="text-red-600 font-medium mb-2">{error}</p>
          <a href="/admin/login" className="text-sm text-blue-600 underline">
            Request a new login link
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500 text-sm">Logging you in…</p>
    </div>
  );
}

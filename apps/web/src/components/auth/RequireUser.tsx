import { Navigate, useLocation } from "react-router-dom";
import { useMe } from "./useMe";

type Props = {
  children: React.ReactNode;
  allowPendingClaim?: boolean;
};

export function RequireUser({ children, allowPendingClaim = false }: Props) {
  const { data, isLoading, isError } = useMe();
  const loc = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Navigate
        to={`/login?next=${encodeURIComponent(loc.pathname + loc.search)}`}
        replace
      />
    );
  }

  if (data.pendingClaim && !allowPendingClaim) {
    return <Navigate to="/onboarding/claim" replace />;
  }

  return <>{children}</>;
}

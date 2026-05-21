import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../lib/api";

type State = "loading" | "success" | "error";

export function MatchAccept() {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<State>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) {
      setState("error");
      setErrorMsg("Missing token.");
      return;
    }
    api.post(`/actions/${token}/match-accept`, {}).then((res) => {
      if (res.success) {
        setState("success");
      } else {
        setState("error");
        setErrorMsg(res.error ?? "Something went wrong.");
      }
    }).catch(() => {
      setState("error");
      setErrorMsg("Something went wrong. Please try again.");
    });
  }, [token]);

  if (state === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Confirming your response…</p>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Match accepted!</h1>
          <p className="text-gray-500 text-sm">
            Thanks for confirming. The student has been notified and leadership
            will follow up with next steps. Check your email for details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Link invalid or expired</h1>
        <p className="text-gray-500 text-sm">{errorMsg}</p>
        <p className="text-gray-400 text-xs mt-3">
          If you think this is a mistake, reply to the email you received or
          contact leadership directly.
        </p>
      </div>
    </div>
  );
}

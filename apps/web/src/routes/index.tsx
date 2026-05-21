import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { useMe } from "../components/auth/useMe";

export function Landing() {
  const { data: me, isLoading } = useMe();
  const signedIn = !!me;

  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Peer Tutoring at Academy
      </h1>
      <p className="text-lg text-gray-600 mb-10 max-w-xl mx-auto">
        Connect with a fellow student who can help you succeed — or sign up to
        share your knowledge with others.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {isLoading ? null : signedIn ? (
          <Link to="/dashboard">
            <Button size="lg" className="w-full sm:w-auto">
              Go to your dashboard
            </Button>
          </Link>
        ) : (
          <Link to="/login">
            <Button size="lg" className="w-full sm:w-auto">
              Sign in with Google to get started
            </Button>
          </Link>
        )}
      </div>

      <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
        {[
          {
            title: "Quick to start",
            body: "Sign in with your Google account and pick whether you want a tutor or want to tutor.",
          },
          {
            title: "Smart matching",
            body: "We match you with a tutor based on subject and shared availability — so scheduling is already handled.",
          },
          {
            title: "Track your progress",
            body: "Your dashboard shows your matches and lets you update your subjects, availability, and requests anytime.",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-xl border border-gray-200 bg-white p-5"
          >
            <h3 className="font-semibold text-gray-900 mb-1">{card.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{card.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

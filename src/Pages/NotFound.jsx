import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <p className="text-6xl">🏥</p>
      <h1 className="text-2xl font-semibold text-gray-800">Page not found</h1>
      <p className="text-sm text-gray-500">The page you’re looking for doesn’t exist.</p>
      <Link to="/" className="mt-2 rounded-lg bg-primary px-5 py-2 text-sm text-white">
        Go home
      </Link>
    </div>
  );
}

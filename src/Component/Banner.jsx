import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

export default function Banner() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  return (
    <div className="my-16 flex flex-col items-center justify-between gap-6 rounded-2xl bg-primary px-8 py-12 text-white md:flex-row md:px-14">
      <div>
        <h2 className="text-2xl font-semibold md:text-3xl">Book your appointment today</h2>
        <p className="mt-2 text-white/80">
          Create an account and manage your visits, prescriptions and invoices.
        </p>
      </div>
      <button
        onClick={() => navigate(isAuthenticated ? "/doctors" : "/login")}
        className="rounded-full bg-white px-8 py-3 text-sm font-medium text-primary transition hover:opacity-90"
      >
        {isAuthenticated ? "Browse doctors" : "Create account"}
      </button>
    </div>
  );
}

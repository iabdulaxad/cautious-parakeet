import { Link } from "react-router-dom";
import { useApp } from "../Context/AppContext";

// Reusable doctor card used in the home page, listing and related sections.
export default function DoctorCard({ doctor }) {
  const { formatMoney } = useApp();
  const initial = (doctor.name || doctor.specialization || "D").charAt(0).toUpperCase();

  return (
    <Link
      to={`/appointment/${doctor.guid}`}
      className="group overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1"
    >
      <div className="flex h-44 items-center justify-center bg-blue-50">
        {doctor.photo_url ? (
          <img src={doctor.photo_url} alt={doctor.name} className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 text-3xl font-semibold text-primary">
            {initial}
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="mb-1 flex items-center gap-2 text-xs text-green-500">
          <span className="h-2 w-2 rounded-full bg-green-500" /> Available
        </div>
        <p className="font-medium text-gray-800">{doctor.name || "Doctor"}</p>
        <p className="text-sm text-gray-500">{doctor.specialization}</p>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-amber-500">
            ★ {Number(doctor.average_rating || 0).toFixed(1)}{" "}
            <span className="text-gray-400">({doctor.review_count || 0})</span>
          </span>
          <span className="font-medium text-gray-700">{formatMoney(doctor.consultation_fee)}</span>
        </div>
      </div>
    </Link>
  );
}

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/methods";
import { useApp } from "../Context/AppContext";
import { useQuery } from "../hooks/useApi";
import DoctorCard from "../Component/DoctorCard";
import { Loading, ErrorState, EmptyState, Input } from "../ui";

export default function Doctors() {
  const { speciality } = useParams();
  const navigate = useNavigate();
  const { specialities } = useApp();
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");

  // debounce the name search
  useEffect(() => {
    const t = setTimeout(() => setQuery(name.trim()), 400);
    return () => clearTimeout(t);
  }, [name]);

  const { data, loading, error, reload } = useQuery(
    () => api.getDoctors({ specialization: speciality || "", name: query, page: 1, limit: 50 }),
    [speciality, query]
  );
  const doctors = data?.doctors || [];

  const SpecBtn = ({ active, label, onClick }) => (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-left text-sm ${
        active ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="py-8">
      <h1 className="text-2xl font-semibold text-gray-800">Browse doctors</h1>
      <p className="text-sm text-gray-500">
        {speciality ? `Speciality: ${speciality}` : "All specialities"}
      </p>

      <div className="mt-6 flex flex-col gap-6 md:flex-row">
        <aside className="md:w-56">
          <Input placeholder="Search by name" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="mt-4 flex flex-col gap-1">
            <SpecBtn active={!speciality} label="All specialities" onClick={() => navigate("/doctors")} />
            {specialities.map((s) => (
              <SpecBtn
                key={s.speciality}
                active={speciality === s.speciality}
                label={s.speciality}
                onClick={() => navigate(`/doctors/${encodeURIComponent(s.speciality)}`)}
              />
            ))}
          </div>
        </aside>

        <div className="flex-1">
          {loading ? (
            <Loading />
          ) : error ? (
            <ErrorState error={error} onRetry={reload} />
          ) : doctors.length === 0 ? (
            <EmptyState title="No doctors found" hint="Try a different speciality or search term." icon="🔍" />
          ) : (
            <div className="grid grid-cols-auto gap-5">
              {doctors.map((d) => (
                <DoctorCard key={d.guid} doctor={d} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

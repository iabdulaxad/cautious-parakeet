import { useNavigate } from "react-router-dom";
import api from "../api/methods";
import { useQuery } from "../hooks/useApi";
import DoctorCard from "./DoctorCard";
import { Loading, EmptyState } from "../ui";

export default function TopDoctor() {
  const navigate = useNavigate();
  const { data, loading } = useQuery(() => api.getDoctors({ page: 1, limit: 8 }), []);
  const doctors = data?.doctors || [];

  return (
    <div className="py-14 text-center">
      <h2 className="text-2xl font-semibold text-gray-800">Top doctors to book</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
        Trusted specialists ready to help you.
      </p>

      {loading ? (
        <Loading />
      ) : doctors.length === 0 ? (
        <EmptyState title="No doctors yet" hint="Doctors will appear here once added." />
      ) : (
        <div className="mt-8 grid grid-cols-auto gap-5">
          {doctors.map((d) => (
            <DoctorCard key={d.guid} doctor={d} />
          ))}
        </div>
      )}

      <button
        onClick={() => navigate("/doctors")}
        className="mt-10 rounded-full bg-gray-100 px-8 py-3 text-sm text-gray-600 hover:bg-gray-200"
      >
        View all doctors
      </button>
    </div>
  );
}

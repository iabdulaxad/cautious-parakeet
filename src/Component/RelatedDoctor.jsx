import api from "../api/methods";
import { useQuery } from "../hooks/useApi";
import DoctorCard from "./DoctorCard";

// Shows other doctors in the same speciality (excluding the current one).
export default function RelatedDoctor({ speciality, excludeId }) {
  const { data } = useQuery(
    () => api.getDoctors({ specialization: speciality || "", limit: 8 }),
    [speciality],
    { enabled: !!speciality }
  );
  const list = (data?.doctors || []).filter((d) => d.guid !== excludeId).slice(0, 4);
  if (list.length === 0) return null;

  return (
    <div className="py-12">
      <h3 className="mb-6 text-xl font-semibold text-gray-800">Related doctors</h3>
      <div className="grid grid-cols-auto gap-5">
        {list.map((d) => (
          <DoctorCard key={d.guid} doctor={d} />
        ))}
      </div>
    </div>
  );
}

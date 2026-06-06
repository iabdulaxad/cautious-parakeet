import { Link } from "react-router-dom";
import { useApp } from "../Context/AppContext";

export default function SpecialityMenu() {
  const { specialities } = useApp();
  return (
    <div id="speciality" className="py-14 text-center">
      <h2 className="text-2xl font-semibold text-gray-800">Find by speciality</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
        Pick a speciality and browse the doctors available right now.
      </p>
      <div className="mt-8 flex justify-start gap-6 overflow-x-auto pb-2 sm:justify-center">
        {specialities.map((s) => (
          <Link
            key={s.speciality}
            to={`/doctors/${encodeURIComponent(s.speciality)}`}
            className="flex flex-col items-center gap-2 text-xs text-gray-600 transition hover:-translate-y-1"
          >
            <img src={s.image} alt={s.speciality} className="h-16 w-16" />
            <span className="whitespace-nowrap">{s.speciality}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

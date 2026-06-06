import { Link } from "react-router-dom";

export default function Header() {
  return (
    <div className="mt-6 flex flex-col gap-6 rounded-2xl bg-primary px-6 py-12 text-white md:flex-row md:items-center md:px-12">
      <div className="flex-1">
        <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
          Book appointments with trusted doctors
        </h1>
        <p className="mt-4 max-w-md text-white/80">
          Browse our specialists, see real available slots, and book your visit in
          seconds. Manage prescriptions, invoices and medical records in one place.
        </p>
        <Link
          to="/doctors"
          className="mt-6 inline-block rounded-full bg-white px-6 py-3 text-sm font-medium text-primary transition hover:opacity-90"
        >
          Find a doctor →
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-center text-[120px] md:text-[160px]">
        🩺
      </div>
    </div>
  );
}

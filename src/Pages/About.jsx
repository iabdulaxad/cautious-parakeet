export default function About() {
  const features = [
    { title: "Easy booking", text: "Find a doctor by speciality and book a real open slot in seconds." },
    { title: "Your records", text: "Access your medical history, prescriptions and invoices anytime." },
    { title: "Trusted doctors", text: "Browse verified specialists with ratings and reviews." },
  ];
  return (
    <div className="py-12">
      <h1 className="text-2xl font-semibold text-gray-800">
        About <span className="text-primary">Hospital Management</span>
      </h1>
      <p className="mt-4 max-w-3xl leading-relaxed text-gray-600">
        Hospital Management is a clinic management system that connects patients with
        trusted doctors. Book appointments, get diagnoses and prescriptions, and keep
        every record in one place — while the clinic manages schedules, billing and
        analytics behind the scenes.
      </p>
      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800">{f.title}</h3>
            <p className="mt-2 text-sm text-gray-500">{f.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Contact() {
  return (
    <div className="py-12">
      <h1 className="text-2xl font-semibold text-gray-800">Contact us</h1>
      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800">Our clinic</h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Tashkent, Uzbekistan
            <br />
            Mon–Sat, 09:00–18:00
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Phone: +998 90 123 45 67
            <br />
            Email: support@hospital.uz
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800">Careers</h3>
          <p className="mt-2 text-sm text-gray-500">
            Interested in joining our team of doctors and staff? Reach out to us at
            careers@hospital.uz.
          </p>
        </div>
      </div>
    </div>
  );
}

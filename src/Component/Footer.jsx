import { NavLink } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-100 pt-10 text-sm text-gray-600">
      <div className="grid gap-10 sm:grid-cols-[2fr_1fr_1fr]">
        <div>
          <p className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-800">
            <span className="text-2xl">🏥</span> Hospital Management
          </p>
          <p className="max-w-md leading-relaxed text-gray-500">
            Book appointments with trusted doctors, manage medical records,
            prescriptions and billing — all in one place.
          </p>
        </div>
        <div>
          <p className="mb-3 font-semibold text-gray-800">Company</p>
          <ul className="flex flex-col gap-2 text-gray-500">
            <li><NavLink to="/" className="hover:text-primary">Home</NavLink></li>
            <li><NavLink to="/doctors" className="hover:text-primary">Doctors</NavLink></li>
            <li><NavLink to="/about" className="hover:text-primary">About us</NavLink></li>
            <li><NavLink to="/contact" className="hover:text-primary">Contact</NavLink></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 font-semibold text-gray-800">Get in touch</p>
          <ul className="flex flex-col gap-2 text-gray-500">
            <li>+998 90 123 45 67</li>
            <li>support@hospital.uz</li>
            <li>Tashkent, Uzbekistan</li>
          </ul>
        </div>
      </div>
      <hr className="my-6 border-gray-100" />
      <p className="pb-6 text-center text-gray-400">
        © {new Date().getFullYear()} Hospital Management — All rights reserved.
      </p>
    </footer>
  );
}

import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { roleHome, isStaff, ROLES } from "../utils/roles";
import { Button } from "../ui";

const linkClass = ({ isActive }) =>
  `py-1 ${isActive ? "text-primary font-medium" : "text-gray-600 hover:text-primary"}`;

const patientMenu = [
  { to: "/my-appointments", label: "My Appointments" },
  { to: "/my-prescriptions", label: "My Prescriptions" },
  { to: "/my-invoices", label: "My Invoices" },
  { to: "/medical-history", label: "Medical History" },
  { to: "/profile", label: "My Profile" },
];

export default function Navbar() {
  const { isAuthenticated, user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDrop, setShowDrop] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropRef.current && !dropRef.current.contains(event.target)) {
        setShowDrop(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-200 bg-white/95 py-4 backdrop-blur">
      <NavLink to="/" className="flex items-center gap-2 text-lg font-semibold text-gray-800">
        <span className="text-2xl">🏥</span> Hospital Management
      </NavLink>

      <ul className="hidden items-center gap-6 text-sm md:flex">
        <NavLink to="/" className={linkClass}>Home</NavLink>
        <NavLink to="/doctors" className={linkClass}>All Doctors</NavLink>
        <NavLink to="/about" className={linkClass}>About</NavLink>
        <NavLink to="/contact" className={linkClass}>Contact</NavLink>
      </ul>

      <div className="flex items-center gap-3">
        {!isAuthenticated && (
          <Button onClick={() => navigate("/login")}>Create account</Button>
        )}

        {isAuthenticated && isStaff(role) && (
          <>
            <Button variant="secondary" onClick={() => navigate(roleHome(role))}>
              {role} Dashboard
            </Button>
            <Button variant="ghost" onClick={onLogout}>Logout</Button>
          </>
        )}

        {isAuthenticated && role === ROLES.PATIENT && (
          <div className="relative" ref={dropRef}>
            <button
              onClick={() => setShowDrop((s) => !s)}
              className="flex items-center gap-2"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-medium text-primary">
                {(user?.name || user?.login || "?").charAt(0).toUpperCase()}
              </span>
              <span className="hidden text-sm text-gray-600 sm:block">{user?.name || user?.login}</span>
            </button>
            {showDrop && (
              <div className="absolute right-0 top-11 w-48 rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
                {patientMenu.map((m) => (
                  <NavLink
                    key={m.to}
                    to={m.to}
                    onClick={() => setShowDrop(false)}
                    className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    {m.label}
                  </NavLink>
                ))}
                <button
                  onClick={onLogout}
                  className="block w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}

        <button className="text-2xl md:hidden" onClick={() => setMenuOpen((s) => !s)}>
          ☰
        </button>
      </div>

      {menuOpen && (
        <div className="absolute left-0 right-0 top-full flex flex-col gap-1 border-b border-gray-200 bg-white p-4 md:hidden">
          {[
            { to: "/", label: "Home" },
            { to: "/doctors", label: "All Doctors" },
            { to: "/about", label: "About" },
            { to: "/contact", label: "Contact" },
          ].map((m) => (
            <NavLink
              key={m.to}
              to={m.to}
              onClick={() => setMenuOpen(false)}
              className="rounded px-2 py-2 text-gray-600 hover:bg-gray-50"
            >
              {m.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

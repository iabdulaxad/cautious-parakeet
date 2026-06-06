import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { cn } from "../utils/format";

const NAV = {
  Doctor: [
    { to: "/doctor", label: "Dashboard", icon: "🏠", end: true },
    { to: "/doctor/appointments", label: "Appointments", icon: "📅" },
    { to: "/doctor/schedule", label: "My Schedule", icon: "🗓️" },
    { to: "/doctor/patients", label: "Patients", icon: "👥" },
  ],
  Receptionist: [
    { to: "/reception", label: "Dashboard", icon: "🏠", end: true },
    { to: "/reception/appointments", label: "Appointments", icon: "📅" },
    { to: "/reception/walk-in", label: "Walk-in Booking", icon: "🚶" },
    { to: "/reception/register", label: "Register Patient", icon: "➕" },
    { to: "/reception/patients", label: "Patients", icon: "👥" },
    { to: "/reception/invoices", label: "Invoices", icon: "🧾" },
  ],
  SuperAdmin: [
    { to: "/admin", label: "Dashboard", icon: "🏠", end: true },
    { to: "/admin/staff", label: "Staff", icon: "🧑‍⚕️" },
    { to: "/admin/reports", label: "Reports", icon: "📊" },
    { to: "/admin/profit-loss", label: "Profit & Loss", icon: "💰" },
    { to: "/admin/expenses", label: "Expenses", icon: "📉" },
  ],
};

export default function DashboardLayout() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const items = NAV[role] || [];

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-white shadow-sm transition-transform md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <NavLink to="/" className="flex items-center gap-2 border-b border-gray-100 px-5 py-4 text-lg font-semibold text-gray-800">
          <span className="text-2xl">🏥</span> Hospital
        </NavLink>
        <nav className="flex-1 space-y-1 p-3">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm",
                  isActive ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"
                )
              }
            >
              <span>{it.icon}</span> {it.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-gray-100 p-4">
          <p className="truncate text-sm font-medium text-gray-700">{user?.name || user?.login}</p>
          <p className="mb-3 text-xs text-gray-400">{role}</p>
          <button onClick={onLogout} className="text-sm text-red-500 hover:underline">
            Logout
          </button>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 md:hidden">
          <button className="text-2xl" onClick={() => setOpen(true)}>☰</button>
          <span className="font-semibold text-gray-700">Hospital Management</span>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

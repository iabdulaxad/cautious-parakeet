import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import { ROLES } from "./utils/roles";

// Public / patient
import Home from "./Pages/Home";
import Doctors from "./Pages/Doctors";
import DoctorDetail from "./Pages/DoctorDetail";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
import Login from "./Pages/Login";
import NotFound from "./Pages/NotFound";
import MyAppointments from "./Pages/patient/MyAppointments";
import MyPrescriptions from "./Pages/patient/MyPrescriptions";
import MyInvoices from "./Pages/patient/MyInvoices";
import MedicalHistory from "./Pages/patient/MedicalHistory";
import Profile from "./Pages/patient/Profile";

// Doctor portal
import DoctorDashboard from "./Pages/doctor/Dashboard";
import DoctorAppointments from "./Pages/doctor/Appointments";
import DoctorSchedule from "./Pages/doctor/Schedule";
import DoctorPatients from "./Pages/doctor/Patients";

// Reception portal
import ReceptionDashboard from "./Pages/reception/Dashboard";
import ReceptionAppointments from "./Pages/reception/Appointments";
import WalkIn from "./Pages/reception/WalkIn";
import ReceptionRegister from "./Pages/reception/RegisterPatient";
import ReceptionPatients from "./Pages/reception/Patients";
import ReceptionInvoices from "./Pages/reception/Invoices";

// Admin portal
import AdminDashboard from "./Pages/admin/Dashboard";
import AdminStaff from "./Pages/admin/Staff";
import AdminReports from "./Pages/admin/Reports";
import AdminProfitLoss from "./Pages/admin/ProfitLoss";
import AdminExpenses from "./Pages/admin/Expenses";

const patient = (el) => <ProtectedRoute roles={[ROLES.PATIENT]}>{el}</ProtectedRoute>;

function App() {
  return (
    <Routes>
      {/* Public + patient (top navbar layout) */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/doctors/:speciality" element={<Doctors />} />
        <Route path="/appointment/:doctorId" element={<DoctorDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/my-appointments" element={patient(<MyAppointments />)} />
        <Route path="/my-prescriptions" element={patient(<MyPrescriptions />)} />
        <Route path="/my-invoices" element={patient(<MyInvoices />)} />
        <Route path="/medical-history" element={patient(<MedicalHistory />)} />
        <Route path="/profile" element={patient(<Profile />)} />
      </Route>

      {/* Doctor portal */}
      <Route
        element={
          <ProtectedRoute roles={[ROLES.DOCTOR]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/doctor/appointments" element={<DoctorAppointments />} />
        <Route path="/doctor/schedule" element={<DoctorSchedule />} />
        <Route path="/doctor/patients" element={<DoctorPatients />} />
      </Route>

      {/* Receptionist portal */}
      <Route
        element={
          <ProtectedRoute roles={[ROLES.RECEPTIONIST]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/reception" element={<ReceptionDashboard />} />
        <Route path="/reception/appointments" element={<ReceptionAppointments />} />
        <Route path="/reception/walk-in" element={<WalkIn />} />
        <Route path="/reception/register" element={<ReceptionRegister />} />
        <Route path="/reception/patients" element={<ReceptionPatients />} />
        <Route path="/reception/invoices" element={<ReceptionInvoices />} />
      </Route>

      {/* Admin portal */}
      <Route
        element={
          <ProtectedRoute roles={[ROLES.SUPER_ADMIN]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/staff" element={<AdminStaff />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/profit-loss" element={<AdminProfitLoss />} />
        <Route path="/admin/expenses" element={<AdminExpenses />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;

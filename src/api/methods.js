import { invoke } from "./client";

// Thin, typed wrappers around every backend method. Each returns the unwrapped
// `data` payload. Object_data is sent flat — handlers that use `unwrap` accept
// both flat and nested forms.
const api = {
  // --- Auth ---
  login: (login, password) => invoke("login", { login, password }),
  refresh: (refresh_token) => invoke("refresh_token", { refresh_token }),

  // --- Registration ---
  registerPatient: (data) => invoke("register_patient", data),
  registerDoctor: (data) => invoke("register_doctor", data),
  registerReceptionist: (data) => invoke("register_receptionist", data),

  // --- Doctors (public) ---
  getDoctors: (params = {}) => invoke("get_doctors", params),
  getDoctorProfile: (doctors_id) => invoke("get_doctor_profile", { doctors_id }),
  getDoctorSchedule: (doctors_id) => invoke("get_doctor_schedule", { doctors_id }),
  getDoctorReviews: (doctors_id) => invoke("get_doctor_reviews", { doctors_id }),
  getAvailableSlots: (doctors_id, days = 7, date = "") =>
    invoke("get_available_slots", { doctors_id, days, date }),

  // --- Scheduling ---
  upsertSchedule: (data) => invoke("upsert_schedule", data),
  deleteSchedule: (schedule_id) => invoke("delete_schedule", { schedule_id }),

  // --- Patients ---
  searchPatients: (query, page = 1, limit = 20) =>
    invoke("search_patients", { query, page, limit }),

  // --- Appointments ---
  bookAppointment: (data) => invoke("book_appointment", data),
  bookWalkIn: (data) => invoke("book_walk_in", data),
  getAppointments: (params = {}) => invoke("get_appointments", params),
  updateAppointmentStatus: (appointments_id, status, cancellation_reason = "") =>
    invoke("update_appointment_status", {
      appointments_id,
      status,
      cancellation_reason,
    }),

  // --- Medical records ---
  createMedicalRecord: (data) => invoke("create_medical_record", data),
  getPatientMedicalHistory: (patients_id) =>
    invoke("get_patient_medical_history", { patients_id }),
  createPrescription: (data) => invoke("create_prescription", data),
  addLabResult: (data) => invoke("add_lab_result", data),

  // --- Billing ---
  createInvoice: (data) => invoke("create_invoice", data),
  getPatientInvoices: (patients_id) =>
    invoke("get_patient_invoices", { patients_id }),
  payInvoice: (invoices_id, status = "paid") =>
    invoke("pay_invoice", { invoices_id, status }),

  // --- Reviews ---
  createReview: (data) => invoke("create_review", data),

  // --- Profile & self-service ---
  getMe: () => invoke("get_me", {}),
  updateProfile: (data) => invoke("update_profile", data),
  changePassword: (old_password, new_password) =>
    invoke("change_password", { old_password, new_password }),
  getMyAppointments: (params = {}) => invoke("get_my_appointments", params),
  getMyPrescriptions: () => invoke("get_my_prescriptions", {}),
  getMyInvoices: () => invoke("get_my_invoices", {}),
  cancelMyAppointment: (appointments_id, cancellation_reason) =>
    invoke("cancel_my_appointment", { appointments_id, cancellation_reason }),

  // --- Doctor dashboard ---
  getDoctorDashboard: () => invoke("get_doctor_dashboard", {}),

  // --- Admin dashboard & reports ---
  getDashboardCounts: () => invoke("get_dashboard_counts", {}),
  listDoctorsAdmin: (params = {}) => invoke("list_doctors_admin", params),
  listStaff: () => invoke("list_staff", {}),
  setUserActive: (users_id, is_active) =>
    invoke("set_user_active", { users_id, is_active }),
  appointmentsReport: (range = {}) => invoke("appointments_report", range),
  revenueReport: (range = {}) => invoke("revenue_report", range),
  doctorsReport: (range = {}) => invoke("doctors_report", range),
  patientsReport: (range = {}) => invoke("patients_report", range),
  billingReport: (range = {}) => invoke("billing_report", range),
  prescriptionsReport: (range = {}) => invoke("prescriptions_report", range),
  occupancyReport: (range = {}) => invoke("occupancy_report", range),
  reviewsReport: (range = {}) => invoke("reviews_report", range),
  getProfitLoss: (range = {}) => invoke("get_profit_loss", range),
  createExpense: (data) => invoke("create_expense", data),
  listExpenses: (range = {}) => invoke("list_expenses", range),
  deleteExpense: (expense_id) => invoke("delete_expense", { expense_id }),

  // --- Health ---
  healthCheck: () => invoke("health_check", {}),
};

export default api;

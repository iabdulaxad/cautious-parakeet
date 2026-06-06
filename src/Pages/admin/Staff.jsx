import { useState } from "react";
import api from "../../api/methods";
import { useQuery, useMutation } from "../../hooks/useApi";
import {
  Button,
  Input,
  Textarea,
  Badge,
  PageHeader,
  EmptyState,
  Loading,
  ErrorState,
  DataTable,
  Modal,
} from "../../ui";
import { formatMoney, prettyStatus } from "../../utils/format";
import { toast } from "react-toastify";

const blankDoctor = {
  login: "",
  password: "",
  first_name: "",
  last_name: "",
  phone: "",
  email: "",
  specialization: "",
  consultation_fee: "",
  experience_years: "",
  monthly_salary: "",
  languages: "",
  bio: "",
};

const blankReceptionist = {
  login: "",
  password: "",
  name: "",
  phone: "",
  email: "",
};

export default function AdminStaff() {
  const [tab, setTab] = useState("staff");
  const [doctorOpen, setDoctorOpen] = useState(false);
  const [receptionistOpen, setReceptionistOpen] = useState(false);
  const [doctorForm, setDoctorForm] = useState(blankDoctor);
  const [receptionistForm, setReceptionistForm] = useState(blankReceptionist);

  const staffQuery = useQuery(() => api.listStaff(), []);
  const doctorsQuery = useQuery(() => api.listDoctorsAdmin(), []);

  const reloadAll = () => {
    staffQuery.reload();
    doctorsQuery.reload();
  };

  const setActive = useMutation(
    (usersId, isActive) => api.setUserActive(usersId, isActive),
    {
      successMessage: "User updated",
      onSuccess: () => staffQuery.reload(),
    }
  );

  const registerDoctor = useMutation((payload) => api.registerDoctor(payload), {
    successMessage: "Doctor registered",
    onSuccess: () => {
      setDoctorOpen(false);
      setDoctorForm(blankDoctor);
      reloadAll();
    },
  });

  const registerReceptionist = useMutation(
    (payload) => api.registerReceptionist(payload),
    {
      successMessage: "Receptionist registered",
      onSuccess: () => {
        setReceptionistOpen(false);
        setReceptionistForm(blankReceptionist);
        staffQuery.reload();
      },
    }
  );

  const submitDoctor = (e) => {
    e.preventDefault();
    if (!doctorForm.login || !doctorForm.password || !doctorForm.specialization) {
      toast.error("Login, password and specialization are required");
      return;
    }
    registerDoctor
      .run({
        login: doctorForm.login,
        password: doctorForm.password,
        first_name: doctorForm.first_name,
        last_name: doctorForm.last_name,
        phone: doctorForm.phone,
        email: doctorForm.email,
        specialization: doctorForm.specialization,
        consultation_fee: Number(doctorForm.consultation_fee) || 0,
        experience_years: Number(doctorForm.experience_years) || 0,
        monthly_salary: Number(doctorForm.monthly_salary) || 0,
        languages: doctorForm.languages,
        bio: doctorForm.bio,
      })
      .catch(() => {});
  };

  const submitReceptionist = (e) => {
    e.preventDefault();
    if (
      !receptionistForm.login ||
      !receptionistForm.password ||
      !receptionistForm.name
    ) {
      toast.error("Login, password and name are required");
      return;
    }
    registerReceptionist
      .run({
        login: receptionistForm.login,
        password: receptionistForm.password,
        name: receptionistForm.name,
        phone: receptionistForm.phone,
        email: receptionistForm.email,
      })
      .catch(() => {});
  };

  const staff = staffQuery.data?.staff || [];
  const doctors = doctorsQuery.data?.doctors || [];

  const staffColumns = [
    { key: "name", header: "Name", render: (u) => u.name || "—" },
    { key: "login", header: "Login", render: (u) => u.login || "—" },
    { key: "phone", header: "Phone", render: (u) => u.phone || "—" },
    { key: "role_id", header: "Role ID", render: (u) => u.role_id || "—" },
    {
      key: "is_active",
      header: "Status",
      render: (u) => (
        <Badge status={u.is_active ? "completed" : "cancelled"}>
          {u.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (u) => (
        <Button
          variant={u.is_active ? "danger" : "primary"}
          loading={setActive.loading}
          onClick={() => setActive.run(u.guid, !u.is_active).catch(() => {})}
        >
          {u.is_active ? "Disable" : "Enable"}
        </Button>
      ),
    },
  ];

  const doctorColumns = [
    { key: "name", header: "Name", render: (d) => d.name || "—" },
    {
      key: "specialization",
      header: "Specialization",
      render: (d) => prettyStatus(d.specialization) || "—",
    },
    {
      key: "consultation_fee",
      header: "Consultation fee",
      render: (d) => formatMoney(d.consultation_fee),
    },
    {
      key: "average_rating",
      header: "Rating",
      render: (d) => `${Number(d.average_rating || 0).toFixed(1)} ⭐`,
    },
    {
      key: "is_active",
      header: "Status",
      render: (d) => (
        <Badge status={d.is_active ? "completed" : "cancelled"}>
          {d.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Staff"
        subtitle="Manage internal accounts and onboard new staff"
        actions={
          <>
            <Button onClick={() => setDoctorOpen(true)}>🩺 Register doctor</Button>
            <Button variant="secondary" onClick={() => setReceptionistOpen(true)}>
              🎫 Register receptionist
            </Button>
          </>
        }
      />

      <div className="mb-5 flex gap-2 border-b border-gray-100">
        {[
          { id: "staff", label: "Staff accounts" },
          { id: "doctors", label: "Doctors (all)" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={
              "border-b-2 px-3 py-2 text-sm font-medium transition " +
              (tab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700")
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "staff" &&
        (staffQuery.loading ? (
          <Loading />
        ) : staffQuery.error ? (
          <ErrorState error={staffQuery.error} onRetry={staffQuery.reload} />
        ) : (
          <DataTable
            columns={staffColumns}
            rows={staff}
            empty={
              <EmptyState
                title="No staff yet"
                hint="Register a doctor or receptionist to get started."
                icon="👥"
              />
            }
          />
        ))}

      {tab === "doctors" &&
        (doctorsQuery.loading ? (
          <Loading />
        ) : doctorsQuery.error ? (
          <ErrorState error={doctorsQuery.error} onRetry={doctorsQuery.reload} />
        ) : (
          <DataTable
            columns={doctorColumns}
            rows={doctors}
            empty={
              <EmptyState
                title="No doctors yet"
                hint="Registered doctors (including inactive) appear here."
                icon="🩺"
              />
            }
          />
        ))}

      {/* Register doctor modal */}
      <Modal
        open={doctorOpen}
        onClose={() => setDoctorOpen(false)}
        title="Register doctor"
        width="max-w-2xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDoctorOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="register-doctor-form"
              loading={registerDoctor.loading}
            >
              Register
            </Button>
          </>
        }
      >
        <form
          id="register-doctor-form"
          onSubmit={submitDoctor}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          <Input
            label="Login"
            required
            value={doctorForm.login}
            onChange={(e) =>
              setDoctorForm({ ...doctorForm, login: e.target.value })
            }
          />
          <Input
            label="Password"
            type="password"
            required
            value={doctorForm.password}
            onChange={(e) =>
              setDoctorForm({ ...doctorForm, password: e.target.value })
            }
          />
          <Input
            label="First name"
            value={doctorForm.first_name}
            onChange={(e) =>
              setDoctorForm({ ...doctorForm, first_name: e.target.value })
            }
          />
          <Input
            label="Last name"
            value={doctorForm.last_name}
            onChange={(e) =>
              setDoctorForm({ ...doctorForm, last_name: e.target.value })
            }
          />
          <Input
            label="Phone"
            value={doctorForm.phone}
            onChange={(e) =>
              setDoctorForm({ ...doctorForm, phone: e.target.value })
            }
          />
          <Input
            label="Email"
            type="email"
            value={doctorForm.email}
            onChange={(e) =>
              setDoctorForm({ ...doctorForm, email: e.target.value })
            }
          />
          <Input
            label="Specialization"
            required
            value={doctorForm.specialization}
            onChange={(e) =>
              setDoctorForm({ ...doctorForm, specialization: e.target.value })
            }
          />
          <Input
            label="Consultation fee"
            type="number"
            min="0"
            value={doctorForm.consultation_fee}
            onChange={(e) =>
              setDoctorForm({ ...doctorForm, consultation_fee: e.target.value })
            }
          />
          <Input
            label="Experience (years)"
            type="number"
            min="0"
            value={doctorForm.experience_years}
            onChange={(e) =>
              setDoctorForm({ ...doctorForm, experience_years: e.target.value })
            }
          />
          <Input
            label="Monthly salary"
            type="number"
            min="0"
            value={doctorForm.monthly_salary}
            onChange={(e) =>
              setDoctorForm({ ...doctorForm, monthly_salary: e.target.value })
            }
          />
          <Input
            label="Languages"
            placeholder="e.g. English, Uzbek"
            value={doctorForm.languages}
            onChange={(e) =>
              setDoctorForm({ ...doctorForm, languages: e.target.value })
            }
          />
          <div className="sm:col-span-2">
            <Textarea
              label="Bio"
              value={doctorForm.bio}
              onChange={(e) =>
                setDoctorForm({ ...doctorForm, bio: e.target.value })
              }
            />
          </div>
        </form>
      </Modal>

      {/* Register receptionist modal */}
      <Modal
        open={receptionistOpen}
        onClose={() => setReceptionistOpen(false)}
        title="Register receptionist"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setReceptionistOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="register-receptionist-form"
              loading={registerReceptionist.loading}
            >
              Register
            </Button>
          </>
        }
      >
        <form
          id="register-receptionist-form"
          onSubmit={submitReceptionist}
          className="grid grid-cols-1 gap-3"
        >
          <Input
            label="Login"
            required
            value={receptionistForm.login}
            onChange={(e) =>
              setReceptionistForm({ ...receptionistForm, login: e.target.value })
            }
          />
          <Input
            label="Password"
            type="password"
            required
            value={receptionistForm.password}
            onChange={(e) =>
              setReceptionistForm({
                ...receptionistForm,
                password: e.target.value,
              })
            }
          />
          <Input
            label="Name"
            required
            value={receptionistForm.name}
            onChange={(e) =>
              setReceptionistForm({ ...receptionistForm, name: e.target.value })
            }
          />
          <Input
            label="Phone"
            value={receptionistForm.phone}
            onChange={(e) =>
              setReceptionistForm({ ...receptionistForm, phone: e.target.value })
            }
          />
          <Input
            label="Email"
            type="email"
            value={receptionistForm.email}
            onChange={(e) =>
              setReceptionistForm({ ...receptionistForm, email: e.target.value })
            }
          />
        </form>
      </Modal>
    </div>
  );
}

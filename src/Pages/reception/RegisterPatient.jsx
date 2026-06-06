import { useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/methods";
import {
  Button,
  Input,
  Select,
  Textarea,
  Card,
  PageHeader,
} from "../../ui";

const BLOOD_TYPES = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];

const EMPTY = {
  login: "",
  password: "",
  first_name: "",
  last_name: "",
  phone: "",
  email: "",
  date_of_birth: "",
  gender: "",
  blood_type: "",
  allergies: "",
  chronic_conditions: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  emergency_contact_relation: "",
  address: "",
};

export default function ReceptionRegister() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(null);

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const next = {};
    if (!form.login.trim()) next.login = "Login is required";
    if (!form.password) next.password = "Password is required";
    if (!form.first_name.trim()) next.first_name = "First name is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await api.registerPatient(form);
      toast.success("Patient registered");
      setCreated(res?.patients_id || "");
    } catch (err) {
      toast.error(err?.message || "Failed to register patient");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setForm(EMPTY);
    setErrors({});
    setCreated(null);
  };

  if (created !== null) {
    return (
      <div>
        <PageHeader title="Register Patient" subtitle="Registration complete" />
        <Card className="mx-auto max-w-lg text-center">
          <p className="mb-2 text-4xl">✅</p>
          <h2 className="mb-1 text-lg font-semibold text-gray-800">
            Patient registered
          </h2>
          <p className="mb-4 text-sm text-gray-500">
            Share this patient ID with the receptionist for bookings and billing.
          </p>
          <code className="mb-5 inline-block break-all rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
            {created || "—"}
          </code>
          <div className="flex justify-center gap-2">
            <Button onClick={reset}>Register another</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Register Patient"
        subtitle="Create a new patient account and profile"
      />

      <form onSubmit={submit} className="space-y-5">
        <Card>
          <h2 className="mb-4 font-semibold text-gray-800">Account</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Login"
              required
              value={form.login}
              onChange={set("login")}
              error={errors.login}
            />
            <Input
              label="Password"
              type="password"
              required
              value={form.password}
              onChange={set("password")}
              error={errors.password}
            />
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-semibold text-gray-800">Personal details</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="First name"
              required
              value={form.first_name}
              onChange={set("first_name")}
              error={errors.first_name}
            />
            <Input
              label="Last name"
              value={form.last_name}
              onChange={set("last_name")}
            />
            <Input
              label="Phone"
              value={form.phone}
              onChange={set("phone")}
              placeholder="998901234567"
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={set("email")}
            />
            <Input
              label="Date of birth"
              type="date"
              value={form.date_of_birth}
              onChange={set("date_of_birth")}
            />
            <Select label="Gender" value={form.gender} onChange={set("gender")}>
              <option value="">Select…</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </Select>
            <Select
              label="Blood type"
              value={form.blood_type}
              onChange={set("blood_type")}
            >
              <option value="">Select…</option>
              {BLOOD_TYPES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </Select>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-semibold text-gray-800">Medical</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Textarea
              label="Allergies"
              value={form.allergies}
              onChange={set("allergies")}
            />
            <Textarea
              label="Chronic conditions"
              value={form.chronic_conditions}
              onChange={set("chronic_conditions")}
            />
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-semibold text-gray-800">
            Emergency contact & address
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Contact name"
              value={form.emergency_contact_name}
              onChange={set("emergency_contact_name")}
            />
            <Input
              label="Contact phone"
              value={form.emergency_contact_phone}
              onChange={set("emergency_contact_phone")}
            />
            <Input
              label="Relation"
              value={form.emergency_contact_relation}
              onChange={set("emergency_contact_relation")}
              placeholder="e.g. Spouse"
            />
            <Input
              label="Address"
              value={form.address}
              onChange={set("address")}
            />
          </div>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={reset}>
            Reset
          </Button>
          <Button type="submit" loading={submitting}>
            Register patient
          </Button>
        </div>
      </form>
    </div>
  );
}

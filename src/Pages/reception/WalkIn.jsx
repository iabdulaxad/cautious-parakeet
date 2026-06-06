import { useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/methods";
import { useQuery } from "../../hooks/useApi";
import {
  Button,
  Input,
  Select,
  Card,
  PageHeader,
  Loading,
  ErrorState,
} from "../../ui";

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function WalkIn() {
  const {
    data: doctorsData,
    loading: doctorsLoading,
    error: doctorsError,
    reload: reloadDoctors,
  } = useQuery(() => api.getDoctors({ limit: 100 }), []);

  const doctors = doctorsData?.doctors || [];

  const [form, setForm] = useState({
    doctors_id: "",
    patients_id: "",
    appointment_date: todayStr(),
    start_time: "",
    end_time: "",
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Inline patient search
  const [patientQuery, setPatientQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(null);

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const runSearch = async () => {
    const q = patientQuery.trim();
    if (!q) {
      toast.error("Enter a name, phone or patient id to search");
      return;
    }
    setSearching(true);
    try {
      const res = await api.searchPatients(q);
      setResults(res?.patients || []);
    } catch (err) {
      toast.error(err?.message || "Patient search failed");
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const pickPatient = (row) => {
    const id = row?.patient?.guid || "";
    setForm((f) => ({ ...f, patients_id: id }));
    toast.success(`Selected patient ${row?.name || id}`);
    setResults(null);
    setPatientQuery("");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.doctors_id) return toast.error("Select a doctor");
    if (!form.patients_id) return toast.error("Select a patient");
    if (!form.appointment_date || !form.start_time || !form.end_time) {
      return toast.error("Date, start and end time are required");
    }
    setSubmitting(true);
    try {
      await api.bookWalkIn({
        doctors_id: form.doctors_id,
        patients_id: form.patients_id,
        appointment_date: form.appointment_date,
        start_time: form.start_time,
        end_time: form.end_time,
        reason: form.reason,
      });
      toast.success("Walk-in appointment booked");
      setForm((f) => ({
        ...f,
        patients_id: "",
        start_time: "",
        end_time: "",
        reason: "",
      }));
    } catch (err) {
      // A 409 (slot taken) surfaces here with its backend message.
      toast.error(err?.message || "Failed to book walk-in");
    } finally {
      setSubmitting(false);
    }
  };

  if (doctorsLoading) return <Loading />;
  if (doctorsError)
    return <ErrorState error={doctorsError} onRetry={reloadDoctors} />;

  return (
    <div>
      <PageHeader
        title="Walk-in Booking"
        subtitle="Book an on-the-spot appointment for a patient"
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Inline patient search */}
        <Card className="lg:col-span-1">
          <h2 className="mb-3 font-semibold text-gray-800">Find patient</h2>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Name, phone or patient id"
                value={patientQuery}
                onChange={(e) => setPatientQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runSearch()}
              />
            </div>
            <div className="flex items-start">
              <Button loading={searching} onClick={runSearch}>
                Search
              </Button>
            </div>
          </div>

          {results && results.length === 0 && (
            <p className="mt-3 text-sm text-gray-400">No patients found.</p>
          )}
          {results && results.length > 0 && (
            <ul className="mt-3 divide-y divide-gray-100">
              {results.map((row) => (
                <li
                  key={row.patient?.guid}
                  className="flex items-center justify-between py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-700">
                      {row.name || "—"}
                    </p>
                    <p className="truncate text-xs text-gray-400">
                      {row.patient?.phone || row.patient?.guid}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    className="px-2 py-1"
                    onClick={() => pickPatient(row)}
                  >
                    Use
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Booking form */}
        <Card className="lg:col-span-2">
          <form onSubmit={submit} className="space-y-4">
            <Select
              label="Doctor"
              required
              value={form.doctors_id}
              onChange={set("doctors_id")}
            >
              <option value="">Select a doctor…</option>
              {doctors.map((d) => (
                <option key={d.guid} value={d.guid}>
                  {d.name || "Unnamed"}
                  {d.specialization ? ` — ${d.specialization}` : ""}
                </option>
              ))}
            </Select>

            <Input
              label="Patient ID"
              required
              value={form.patients_id}
              onChange={set("patients_id")}
              placeholder="Pick from search, or paste a patient guid"
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input
                label="Date"
                type="date"
                required
                value={form.appointment_date}
                onChange={set("appointment_date")}
              />
              <Input
                label="Start time"
                type="time"
                required
                value={form.start_time}
                onChange={set("start_time")}
              />
              <Input
                label="End time"
                type="time"
                required
                value={form.end_time}
                onChange={set("end_time")}
              />
            </div>

            <Input
              label="Reason"
              value={form.reason}
              onChange={set("reason")}
              placeholder="e.g. Fever and headache"
            />

            <div className="flex justify-end">
              <Button type="submit" loading={submitting}>
                Book walk-in
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

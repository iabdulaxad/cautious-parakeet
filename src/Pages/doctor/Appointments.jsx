import { useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/methods";
import { useQuery } from "../../hooks/useApi";
import {
  Button,
  Input,
  Select,
  Textarea,
  Badge,
  PageHeader,
  Loading,
  ErrorState,
  DataTable,
  Modal,
  Pagination,
} from "../../ui";
import { formatDate } from "../../utils/format";

const STATUSES = [
  "scheduled",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "no_show",
];

const LIMIT = 20;

export default function DoctorAppointments() {
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);

  const { data, loading, error, reload } = useQuery(
    () =>
      api.getAppointments({
        status,
        appointment_date: date,
        page,
        limit: LIMIT,
      }),
    [status, date, page]
  );

  // Cancel modal state.
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelBusy, setCancelBusy] = useState(false);

  // Medical-record modal state.
  const [recordTarget, setRecordTarget] = useState(null);
  const [recordForm, setRecordForm] = useState({
    diagnosis: "",
    symptoms: "",
    examination_notes: "",
  });
  const [recordBusy, setRecordBusy] = useState(false);

  const rows = data?.appointments || [];

  async function setStatusFor(appt, next) {
    try {
      await api.updateAppointmentStatus(appt.guid, next);
      toast.success(`Marked ${next.replace(/_/g, " ")}`);
      reload();
    } catch (err) {
      toast.error(err?.message || "Failed to update status");
    }
  }

  async function submitCancel() {
    if (!cancelReason.trim()) {
      toast.error("A cancellation reason is required");
      return;
    }
    setCancelBusy(true);
    try {
      await api.updateAppointmentStatus(
        cancelTarget.guid,
        "cancelled",
        cancelReason.trim()
      );
      toast.success("Appointment cancelled");
      setCancelTarget(null);
      setCancelReason("");
      reload();
    } catch (err) {
      toast.error(err?.message || "Failed to cancel appointment");
    } finally {
      setCancelBusy(false);
    }
  }

  function openRecord(appt) {
    setRecordTarget(appt);
    setRecordForm({ diagnosis: "", symptoms: "", examination_notes: "" });
  }

  async function submitRecord() {
    if (!recordForm.diagnosis.trim()) {
      toast.error("Diagnosis is required");
      return;
    }
    setRecordBusy(true);
    try {
      await api.createMedicalRecord({
        appointments_id: recordTarget.guid,
        patients_id: recordTarget.patients_id,
        diagnosis: recordForm.diagnosis.trim(),
        symptoms: recordForm.symptoms.trim(),
        examination_notes: recordForm.examination_notes.trim(),
      });
      toast.success("Medical record created");
      setRecordTarget(null);
      reload();
    } catch (err) {
      toast.error(err?.message || "Failed to create medical record");
    } finally {
      setRecordBusy(false);
    }
  }

  const columns = [
    {
      key: "appointment_date",
      header: "Date",
      render: (a) => formatDate(a.appointment_date),
    },
    {
      key: "time",
      header: "Time",
      render: (a) => `${a.start_time || "—"}–${a.end_time || "—"}`,
    },
    { key: "patients_id", header: "Patient" },
    { key: "reason", header: "Reason", render: (a) => a.reason || "—" },
    {
      key: "status",
      header: "Status",
      render: (a) => <Badge status={a.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      render: (a) => {
        const done = a.status === "completed" || a.status === "cancelled";
        return (
          <div className="flex flex-wrap gap-1.5">
            {a.status !== "confirmed" && !done && (
              <Button
                variant="secondary"
                className="px-2 py-1 text-xs"
                onClick={() => setStatusFor(a, "confirmed")}
              >
                Confirm
              </Button>
            )}
            {a.status !== "in_progress" && !done && (
              <Button
                variant="secondary"
                className="px-2 py-1 text-xs"
                onClick={() => setStatusFor(a, "in_progress")}
              >
                Start
              </Button>
            )}
            {!done && (
              <Button
                variant="secondary"
                className="px-2 py-1 text-xs"
                onClick={() => setStatusFor(a, "completed")}
              >
                Complete
              </Button>
            )}
            {!done && (
              <Button
                variant="secondary"
                className="px-2 py-1 text-xs"
                onClick={() => setStatusFor(a, "no_show")}
              >
                No-show
              </Button>
            )}
            {!done && (
              <Button
                variant="danger"
                className="px-2 py-1 text-xs"
                onClick={() => {
                  setCancelTarget(a);
                  setCancelReason("");
                }}
              >
                Cancel
              </Button>
            )}
            {a.status !== "cancelled" && (
              <Button
                variant="primary"
                className="px-2 py-1 text-xs"
                onClick={() => openRecord(a)}
              >
                Record
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  function changeFilter(setter, value) {
    setter(value);
    setPage(1);
  }

  return (
    <div>
      <PageHeader
        title="Appointments"
        subtitle="Manage your appointments and clinical records"
      />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:max-w-xl">
        <Select
          label="Status"
          value={status}
          onChange={(e) => changeFilter(setStatus, e.target.value)}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </Select>
        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => changeFilter(setDate, e.target.value)}
        />
      </div>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <>
          <DataTable columns={columns} rows={rows} />
          <Pagination
            page={page}
            hasNext={rows.length === LIMIT}
            onPage={setPage}
          />
        </>
      )}

      {/* Cancel modal */}
      <Modal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancel appointment"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCancelTarget(null)}>
              Close
            </Button>
            <Button variant="danger" loading={cancelBusy} onClick={submitCancel}>
              Cancel appointment
            </Button>
          </>
        }
      >
        <Textarea
          label="Cancellation reason"
          required
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="Why is this appointment being cancelled?"
        />
      </Modal>

      {/* Medical record modal */}
      <Modal
        open={!!recordTarget}
        onClose={() => setRecordTarget(null)}
        title="Create medical record"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRecordTarget(null)}>
              Cancel
            </Button>
            <Button variant="primary" loading={recordBusy} onClick={submitRecord}>
              Save record
            </Button>
          </>
        }
      >
        <p className="mb-3 text-xs text-gray-400">
          Saving a record marks the appointment as completed.
        </p>
        <div className="space-y-3">
          <Textarea
            label="Diagnosis"
            required
            value={recordForm.diagnosis}
            onChange={(e) =>
              setRecordForm((f) => ({ ...f, diagnosis: e.target.value }))
            }
          />
          <Textarea
            label="Symptoms"
            value={recordForm.symptoms}
            onChange={(e) =>
              setRecordForm((f) => ({ ...f, symptoms: e.target.value }))
            }
          />
          <Textarea
            label="Examination notes"
            value={recordForm.examination_notes}
            onChange={(e) =>
              setRecordForm((f) => ({
                ...f,
                examination_notes: e.target.value,
              }))
            }
          />
        </div>
      </Modal>
    </div>
  );
}

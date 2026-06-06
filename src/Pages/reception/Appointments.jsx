import { useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/methods";
import { useQuery } from "../../hooks/useApi";
import {
  Badge,
  Button,
  Input,
  Select,
  Textarea,
  PageHeader,
  EmptyState,
  Loading,
  ErrorState,
  DataTable,
  Modal,
  Pagination,
} from "../../ui";
import { formatDate } from "../../utils/format";

const STATUS_OPTIONS = [
  "scheduled",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "no_show",
];

export default function ReceptionAppointments() {
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);

  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [busy, setBusy] = useState(false);

  const { data, loading, error, reload } = useQuery(
    () =>
      api.getAppointments({
        status: status || undefined,
        appointment_date: date || undefined,
        page,
        limit: 20,
      }),
    [status, date, page]
  );

  const appointments = data?.appointments || [];
  const count = data?.count ?? 0;
  const hasNext = page * 20 < count;

  const changeStatus = async (id, newStatus, reason = "") => {
    setBusy(true);
    try {
      await api.updateAppointmentStatus(id, newStatus, reason);
      toast.success(`Appointment marked ${newStatus.replace(/_/g, " ")}`);
      await reload();
    } catch (err) {
      toast.error(err?.message || "Failed to update appointment");
    } finally {
      setBusy(false);
    }
  };

  const submitCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error("A cancellation reason is required");
      return;
    }
    await changeStatus(cancelTarget.guid, "cancelled", cancelReason.trim());
    setCancelTarget(null);
    setCancelReason("");
  };

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
    { key: "doctors_id", header: "Doctor" },
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
      render: (a) => (
        <div className="flex flex-wrap gap-1">
          <Button
            variant="secondary"
            className="px-2 py-1"
            disabled={busy || a.status === "confirmed"}
            onClick={() => changeStatus(a.guid, "confirmed")}
          >
            Confirm
          </Button>
          <Button
            variant="secondary"
            className="px-2 py-1"
            disabled={busy}
            onClick={() => changeStatus(a.guid, "no_show")}
          >
            No-show
          </Button>
          <Button
            variant="danger"
            className="px-2 py-1"
            disabled={busy}
            onClick={() => {
              setCancelTarget(a);
              setCancelReason("");
            }}
          >
            Cancel
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Appointments"
        subtitle="Manage bookings across all doctors"
      />

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Select
          label="Status"
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </Select>
        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => {
            setPage(1);
            setDate(e.target.value);
          }}
        />
        <div className="flex items-end">
          <Button
            variant="secondary"
            onClick={() => {
              setStatus("");
              setDate("");
              setPage(1);
            }}
          >
            Clear filters
          </Button>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={appointments}
            empty={
              <EmptyState
                title="No appointments found"
                hint="Try adjusting the filters above."
                icon="🗓️"
              />
            }
          />
          {count > 0 && (
            <Pagination page={page} hasNext={hasNext} onPage={setPage} />
          )}
        </>
      )}

      <Modal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancel appointment"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCancelTarget(null)}>
              Keep
            </Button>
            <Button variant="danger" loading={busy} onClick={submitCancel}>
              Cancel appointment
            </Button>
          </>
        }
      >
        <p className="mb-3 text-sm text-gray-500">
          Please provide a reason for cancelling this appointment.
        </p>
        <Textarea
          label="Cancellation reason"
          required
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="e.g. Patient requested reschedule"
        />
      </Modal>
    </div>
  );
}

import { useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/methods";
import { useQuery } from "../../hooks/useApi";
import { useAuth } from "../../Context/AuthContext";
import {
  Button,
  Input,
  Select,
  Badge,
  PageHeader,
  Loading,
  ErrorState,
  DataTable,
  Modal,
} from "../../ui";
import { weekdayName } from "../../utils/format";

const DAYS = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 7, label: "Sunday" },
];

const EMPTY_FORM = {
  day_of_week: 1,
  start_time: "09:00",
  end_time: "17:00",
  slot_duration: 30,
};

export default function DoctorSchedule() {
  const { profile } = useAuth();
  const doctorId = profile?.guid;

  const { data, loading, error, reload } = useQuery(
    () => api.getDoctorSchedule(doctorId),
    [doctorId],
    { enabled: !!doctorId }
  );

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  // Wait for the signed-in doctor profile to resolve before we can scope.
  if (!doctorId) return <Loading />;

  const rows = data?.schedules || [];

  async function removeSchedule(scheduleId) {
    setDeletingId(scheduleId);
    try {
      await api.deleteSchedule(scheduleId);
      toast.success("Schedule removed");
      reload();
    } catch (err) {
      toast.error(err?.message || "Failed to remove schedule");
    } finally {
      setDeletingId("");
    }
  }

  async function submitAdd() {
    if (!form.start_time || !form.end_time) {
      toast.error("Start and end time are required");
      return;
    }
    if (form.start_time >= form.end_time) {
      toast.error("Start time must be before end time");
      return;
    }
    if (Number(form.slot_duration) <= 0) {
      toast.error("Slot duration must be greater than 0");
      return;
    }
    setSaving(true);
    try {
      await api.upsertSchedule({
        doctors_id: doctorId,
        day_of_week: Number(form.day_of_week),
        start_time: form.start_time,
        end_time: form.end_time,
        slot_duration: Number(form.slot_duration),
        is_active: true,
      });
      toast.success("Schedule added");
      setShowAdd(false);
      setForm(EMPTY_FORM);
      reload();
    } catch (err) {
      toast.error(err?.message || "Failed to add schedule");
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    {
      key: "day_of_week",
      header: "Day",
      render: (s) => weekdayName(s.day_of_week),
    },
    {
      key: "time",
      header: "Hours",
      render: (s) => `${s.start_time}–${s.end_time}`,
    },
    {
      key: "slot_duration",
      header: "Slot",
      render: (s) => `${s.slot_duration} min`,
    },
    {
      key: "is_active",
      header: "Active",
      render: (s) => (
        <Badge status={s.is_active ? "confirmed" : "no_show"}>
          {s.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (s) => (
        <Button
          variant="danger"
          className="px-2 py-1 text-xs"
          loading={deletingId === s.guid}
          onClick={() => removeSchedule(s.guid)}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Weekly Schedule"
        subtitle="Set your recurring availability template"
        actions={
          <Button onClick={() => setShowAdd(true)}>Add schedule</Button>
        }
      />

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <DataTable columns={columns} rows={rows} />
      )}

      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add schedule"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={saving} onClick={submitAdd}>
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Select
            label="Day of week"
            value={form.day_of_week}
            onChange={(e) =>
              setForm((f) => ({ ...f, day_of_week: Number(e.target.value) }))
            }
          >
            {DAYS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start time"
              type="time"
              value={form.start_time}
              onChange={(e) =>
                setForm((f) => ({ ...f, start_time: e.target.value }))
              }
            />
            <Input
              label="End time"
              type="time"
              value={form.end_time}
              onChange={(e) =>
                setForm((f) => ({ ...f, end_time: e.target.value }))
              }
            />
          </div>
          <Input
            label="Slot duration (minutes)"
            type="number"
            min="1"
            value={form.slot_duration}
            onChange={(e) =>
              setForm((f) => ({ ...f, slot_duration: e.target.value }))
            }
          />
        </div>
      </Modal>
    </div>
  );
}

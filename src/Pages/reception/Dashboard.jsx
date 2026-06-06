import { useNavigate } from "react-router-dom";
import api from "../../api/methods";
import { useQuery } from "../../hooks/useApi";
import {
  Badge,
  Button,
  StatCard,
  PageHeader,
  EmptyState,
  Loading,
  ErrorState,
  DataTable,
} from "../../ui";

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function ReceptionDashboard() {
  const navigate = useNavigate();
  const today = todayStr();

  const { data, loading, error, reload } = useQuery(
    () => api.getAppointments({ appointment_date: today, limit: 50 }),
    [today]
  );

  if (loading) return <Loading />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const appointments = data?.appointments || [];
  const countBy = (status) =>
    appointments.filter((a) => a.status === status).length;

  const columns = [
    {
      key: "time",
      header: "Time",
      render: (a) => `${a.start_time || "—"}–${a.end_time || "—"}`,
    },
    { key: "doctors_id", header: "Doctor" },
    { key: "patients_id", header: "Patient" },
    {
      key: "status",
      header: "Status",
      render: (a) => <Badge status={a.status} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Reception Dashboard"
        subtitle="Today's activity at a glance"
        actions={
          <>
            <Button onClick={() => navigate("/reception/walk-in")}>
              🚶 Walk-in
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate("/reception/register")}
            >
              ➕ Register patient
            </Button>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Today's total" value={appointments.length} icon="📅" />
        <StatCard label="Scheduled" value={countBy("scheduled")} icon="🕒" />
        <StatCard label="Confirmed" value={countBy("confirmed")} icon="✅" />
        <StatCard label="Completed" value={countBy("completed")} icon="🏁" />
      </div>

      <h2 className="mb-3 text-lg font-semibold text-gray-800">
        Today’s appointments
      </h2>
      <DataTable
        columns={columns}
        rows={appointments}
        empty={
          <EmptyState
            title="No appointments today"
            hint="Booked appointments for today will appear here."
            icon="🗓️"
          />
        }
      />
    </div>
  );
}

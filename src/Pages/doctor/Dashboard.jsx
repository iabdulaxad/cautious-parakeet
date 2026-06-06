import api from "../../api/methods";
import { useQuery } from "../../hooks/useApi";
import {
  Badge,
  StatCard,
  PageHeader,
  EmptyState,
  Loading,
  ErrorState,
  DataTable,
} from "../../ui";

export default function DoctorDashboard() {
  const { data, loading, error, reload } = useQuery(
    () => api.getDoctorDashboard(),
    []
  );

  if (loading) return <Loading />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const today = data?.today || [];

  const columns = [
    {
      key: "time",
      header: "Time",
      render: (a) => `${a.start_time || "—"}–${a.end_time || "—"}`,
    },
    { key: "patients_id", header: "Patient" },
    {
      key: "reason",
      header: "Reason",
      render: (a) => a.reason || "—",
    },
    {
      key: "status",
      header: "Status",
      render: (a) => <Badge status={a.status} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Doctor Dashboard"
        subtitle="Your day at a glance"
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Upcoming"
          value={data?.upcoming_count ?? 0}
          icon="📅"
        />
        <StatCard
          label="Completed"
          value={data?.completed_count ?? 0}
          icon="✅"
        />
        <StatCard
          label="Patients seen"
          value={data?.total_patients ?? 0}
          icon="🧑‍⚕️"
        />
      </div>

      <h2 className="mb-3 text-lg font-semibold text-gray-800">
        Today’s appointments
      </h2>
      <DataTable
        columns={columns}
        rows={today}
        empty={
          <EmptyState
            title="No appointments today"
            hint="You have a clear schedule for today."
            icon="🗓️"
          />
        }
      />
    </div>
  );
}

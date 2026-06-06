import { useNavigate } from "react-router-dom";
import api from "../../api/methods";
import { useQuery } from "../../hooks/useApi";
import {
  Button,
  StatCard,
  PageHeader,
  Loading,
  ErrorState,
} from "../../ui";
import { formatMoney } from "../../utils/format";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const { data, loading, error, reload } = useQuery(
    () => api.getDashboardCounts(),
    []
  );

  if (loading) return <Loading />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const counts = data || {};

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Hospital-wide numbers at a glance"
        actions={
          <>
            <Button onClick={() => navigate("/admin/staff")}>👥 Staff</Button>
            <Button variant="secondary" onClick={() => navigate("/admin/reports")}>
              📊 Reports
            </Button>
            <Button variant="secondary" onClick={() => navigate("/admin/profit-loss")}>
              💰 Profit / Loss
            </Button>
            <Button variant="secondary" onClick={() => navigate("/admin/expenses")}>
              🧾 Expenses
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total doctors" value={counts.total_doctors ?? 0} icon="🩺" />
        <StatCard label="Total patients" value={counts.total_patients ?? 0} icon="🧑‍🤝‍🧑" />
        <StatCard
          label="Total appointments"
          value={counts.total_appointments ?? 0}
          icon="📅"
        />
        <StatCard
          label="Appointments today"
          value={counts.appointments_today ?? 0}
          icon="🗓️"
        />
        <StatCard
          label="Revenue (paid)"
          value={formatMoney(counts.revenue_paid)}
          icon="💵"
        />
        <StatCard
          label="Unpaid invoices"
          value={counts.unpaid_invoices ?? 0}
          icon="⚠️"
        />
      </div>
    </div>
  );
}

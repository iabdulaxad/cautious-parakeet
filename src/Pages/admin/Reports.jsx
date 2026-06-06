import { useState } from "react";
import api from "../../api/methods";
import { useQuery } from "../../hooks/useApi";
import {
  Button,
  Input,
  Card,
  StatCard,
  PageHeader,
  Loading,
  ErrorState,
  EmptyState,
  DataTable,
} from "../../ui";
import { formatMoney, prettyStatus } from "../../utils/format";

// Report registry: id -> { label, fetch }.
const REPORTS = [
  { id: "appointments", label: "Appointments", fetch: api.appointmentsReport },
  { id: "revenue", label: "Revenue", fetch: api.revenueReport },
  { id: "doctors", label: "Doctors", fetch: api.doctorsReport },
  { id: "patients", label: "Patients", fetch: api.patientsReport },
  { id: "billing", label: "Billing", fetch: api.billingReport },
  { id: "prescriptions", label: "Prescriptions", fetch: api.prescriptionsReport },
  { id: "occupancy", label: "Occupancy", fetch: api.occupancyReport },
  { id: "reviews", label: "Reviews", fetch: api.reviewsReport },
];

const pct = (v) => `${(Number(v || 0) * 100).toFixed(1)}%`;
const num = (v) => Number(v || 0);

// KeyValueTable renders an object map (e.g. { scheduled: 4, completed: 9 }) as a
// small two-column table. `valueFmt` formats each value.
function KeyValueTable({ title, map, valueFmt = (v) => v, keyFmt = prettyStatus }) {
  const entries = Object.entries(map || {});
  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-gray-700">{title}</h3>
      {entries.length === 0 ? (
        <p className="text-sm text-gray-400">No data</p>
      ) : (
        <table className="min-w-full text-sm">
          <tbody>
            {entries.map(([k, v]) => (
              <tr key={k} className="border-b border-gray-50 last:border-0">
                <td className="py-1.5 pr-4 text-gray-600">{keyFmt(k)}</td>
                <td className="py-1.5 text-right font-medium text-gray-800">
                  {valueFmt(v)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}

function RawDetails({ data }) {
  return (
    <details className="mt-6 rounded-lg border border-gray-100 bg-gray-50 p-3">
      <summary className="cursor-pointer text-sm font-medium text-gray-500">
        Raw response
      </summary>
      <pre className="mt-2 overflow-x-auto text-xs text-gray-600">
        {JSON.stringify(data, null, 2)}
      </pre>
    </details>
  );
}

// --------------------------------------------------------------------------
// Per-report renderers — keys taken verbatim from backend reports.go.
// --------------------------------------------------------------------------

function AppointmentsView({ d }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total appointments" value={num(d.total)} icon="📅" />
        <StatCard label="Cancellation rate" value={pct(d.cancellation_rate)} icon="🚫" />
        <StatCard label="No-show rate" value={pct(d.no_show_rate)} icon="👻" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <KeyValueTable title="By status" map={d.by_status} />
        <KeyValueTable title="By specialization" map={d.by_specialization} />
      </div>
    </div>
  );
}

function RevenueView({ d }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Total invoiced" value={formatMoney(d.total_invoiced)} icon="🧾" />
        <StatCard label="Total paid" value={formatMoney(d.total_paid)} icon="💵" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <KeyValueTable
          title="Revenue by doctor (id)"
          map={d.revenue_by_doctor}
          valueFmt={formatMoney}
          keyFmt={(k) => k}
        />
        <KeyValueTable
          title="Revenue by service type"
          map={d.revenue_by_service_type}
          valueFmt={formatMoney}
        />
      </div>
    </div>
  );
}

function DoctorsView({ d }) {
  const rows = d.doctors || [];
  const columns = [
    { key: "name", header: "Doctor", render: (r) => r.name || r.doctors_id || "—" },
    {
      key: "specialization",
      header: "Specialization",
      render: (r) => prettyStatus(r.specialization) || "—",
    },
    { key: "appointment_count", header: "Appointments", render: (r) => num(r.appointment_count) },
    { key: "revenue", header: "Revenue", render: (r) => formatMoney(r.revenue) },
    {
      key: "average_rating",
      header: "Rating",
      render: (r) => `${num(r.average_rating).toFixed(1)} ⭐`,
    },
    { key: "review_count", header: "Reviews", render: (r) => num(r.review_count) },
  ];
  return (
    <DataTable
      columns={columns}
      rows={rows}
      rowKey="doctors_id"
      empty={<EmptyState title="No doctor data" icon="🩺" />}
    />
  );
}

function PatientsView({ d }) {
  const rvn = d.returning_vs_new || {};
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Returning patients" value={num(rvn.returning)} icon="🔁" />
        <StatCard label="New patients" value={num(rvn.new)} icon="🆕" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KeyValueTable
          title="Registrations by month"
          map={d.registrations_by_month}
          keyFmt={(k) => k}
        />
        <KeyValueTable title="By gender" map={d.by_gender} />
        <KeyValueTable title="By blood type" map={d.by_blood_type} keyFmt={(k) => k} />
      </div>
    </div>
  );
}

function BillingView({ d }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard label="Unpaid invoices" value={num(d.unpaid_count)} icon="⚠️" />
      <StatCard label="Unpaid amount" value={formatMoney(d.unpaid_amount)} icon="💳" />
      <StatCard label="Refunded count" value={num(d.refunded_count)} icon="↩️" />
      <StatCard label="Refund rate" value={pct(d.refund_rate)} icon="📉" />
      <StatCard label="Avg invoice value" value={formatMoney(d.average_invoice_value)} icon="📐" />
      <StatCard label="Total collected" value={formatMoney(d.total_collected)} icon="💵" />
      <StatCard label="Total outstanding" value={formatMoney(d.total_outstanding)} icon="🧾" />
    </div>
  );
}

function PrescriptionsView({ d }) {
  const ranked = d.most_prescribed_medications || [];
  const columns = [
    { key: "medication", header: "Medication", render: (r) => r.medication || "—" },
    { key: "count", header: "Count", render: (r) => num(r.count) },
  ];
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Total prescriptions" value={num(d.total)} icon="💊" />
      </div>
      <KeyValueTable title="Per doctor" map={d.per_doctor} keyFmt={(k) => k} />
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-700">
          Most-prescribed medications
        </h3>
        <DataTable
          columns={columns}
          rows={ranked}
          rowKey="medication"
          empty={<EmptyState title="No prescriptions" icon="💊" />}
        />
      </div>
    </div>
  );
}

function OccupancyView({ d }) {
  const rows = d.by_doctor || [];
  const peaks = d.peak_hours || [];
  const columns = [
    { key: "name", header: "Doctor", render: (r) => r.name || r.doctors_id || "—" },
    { key: "booked", header: "Booked", render: (r) => num(r.booked) },
    { key: "available", header: "Available", render: (r) => num(r.available) },
    {
      key: "utilization_rate",
      header: "Utilization",
      render: (r) => pct(r.utilization_rate),
    },
  ];
  return (
    <div className="space-y-5">
      <DataTable
        columns={columns}
        rows={rows}
        rowKey="doctors_id"
        empty={<EmptyState title="No occupancy data" icon="🪑" />}
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Peak hours</h3>
          {peaks.length === 0 ? (
            <p className="text-sm text-gray-400">No data</p>
          ) : (
            <table className="min-w-full text-sm">
              <tbody>
                {peaks.map((p) => (
                  <tr key={p.hour} className="border-b border-gray-50 last:border-0">
                    <td className="py-1.5 pr-4 text-gray-600">{p.hour || "—"}</td>
                    <td className="py-1.5 text-right font-medium text-gray-800">
                      {num(p.count)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
        <KeyValueTable title="Busiest days" map={d.busiest_days} keyFmt={(k) => k} />
      </div>
    </div>
  );
}

function ReviewsView({ d }) {
  const avg = d.average_rating_per_doctor || [];
  const low = d.recent_low_rated || [];
  const none = d.doctors_with_no_reviews || [];
  const avgColumns = [
    { key: "name", header: "Doctor", render: (r) => r.name || r.doctors_id || "—" },
    {
      key: "average_rating",
      header: "Avg rating",
      render: (r) => `${num(r.average_rating).toFixed(1)} ⭐`,
    },
    { key: "review_count", header: "Reviews", render: (r) => num(r.review_count) },
  ];
  const lowColumns = [
    { key: "doctor_name", header: "Doctor", render: (r) => r.doctor_name || r.doctors_id || "—" },
    { key: "rating", header: "Rating", render: (r) => `${num(r.rating)} ⭐` },
    { key: "comment", header: "Comment", render: (r) => r.comment || "—" },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-700">
          Average rating per doctor
        </h3>
        <DataTable
          columns={avgColumns}
          rows={avg}
          rowKey="doctors_id"
          empty={<EmptyState title="No reviews" icon="⭐" />}
        />
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-700">
          Recent low-rated reviews
        </h3>
        <DataTable
          columns={lowColumns}
          rows={low}
          rowKey="appointments_id"
          empty={<EmptyState title="No low-rated reviews" icon="🙂" />}
        />
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-700">
          Doctors with no reviews
        </h3>
        {none.length === 0 ? (
          <p className="text-sm text-gray-400">All doctors have reviews.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {none.map((r) => (
              <span
                key={r.doctors_id}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600"
              >
                {r.name || r.doctors_id}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const VIEWS = {
  appointments: AppointmentsView,
  revenue: RevenueView,
  doctors: DoctorsView,
  patients: PatientsView,
  billing: BillingView,
  prescriptions: PrescriptionsView,
  occupancy: OccupancyView,
  reviews: ReviewsView,
};

export default function AdminReports() {
  const [selected, setSelected] = useState("appointments");
  const [draft, setDraft] = useState({ start_date: "", end_date: "" });
  const [range, setRange] = useState({ start_date: "", end_date: "" });

  const report = REPORTS.find((r) => r.id === selected);

  const { data, loading, error, reload } = useQuery(
    () => report.fetch(range),
    [selected, range.start_date, range.end_date]
  );

  const apply = () => setRange({ ...draft });

  const View = VIEWS[selected];

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Hospital analytics across appointments, revenue and more"
      />

      {/* Report picker */}
      <div className="mb-4 flex flex-wrap gap-2">
        {REPORTS.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelected(r.id)}
            className={
              "rounded-lg px-3 py-1.5 text-sm font-medium transition " +
              (selected === r.id
                ? "bg-primary text-white"
                : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50")
            }
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Date-range filter */}
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div className="w-40">
          <Input
            label="Start date"
            type="date"
            value={draft.start_date}
            onChange={(e) => setDraft({ ...draft, start_date: e.target.value })}
          />
        </div>
        <div className="w-40">
          <Input
            label="End date"
            type="date"
            value={draft.end_date}
            onChange={(e) => setDraft({ ...draft, end_date: e.target.value })}
          />
        </div>
        <Button onClick={apply}>Apply</Button>
        {(range.start_date || range.end_date) && (
          <Button
            variant="ghost"
            onClick={() => {
              setDraft({ start_date: "", end_date: "" });
              setRange({ start_date: "", end_date: "" });
            }}
          >
            Clear
          </Button>
        )}
      </div>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <div>
          {View ? <View d={data || {}} /> : null}
          <RawDetails data={data} />
        </div>
      )}
    </div>
  );
}

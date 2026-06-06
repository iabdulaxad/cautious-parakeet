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
} from "../../ui";
import { formatMoney } from "../../utils/format";

export default function AdminProfitLoss() {
  const [draft, setDraft] = useState({ start_date: "", end_date: "" });
  const [range, setRange] = useState({ start_date: "", end_date: "" });

  const { data, loading, error, reload } = useQuery(
    () => api.getProfitLoss(range),
    [range.start_date, range.end_date]
  );

  const apply = () => setRange({ ...draft });

  const d = data || {};
  const inProfit = d.status === "in profit";

  return (
    <div>
      <PageHeader
        title="Profit & Loss"
        subtitle="Paid revenue minus salaries and operational expenses"
      />

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
        <div className="space-y-6">
          {/* Status banner */}
          <div
            className={
              "rounded-xl border p-5 " +
              (inProfit
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50")
            }
          >
            <p className="text-sm text-gray-500">Net profit</p>
            <p
              className={
                "text-3xl font-bold " +
                (inProfit ? "text-green-700" : "text-red-700")
              }
            >
              {formatMoney(d.net_profit)}
            </p>
            <span
              className={
                "mt-2 inline-block rounded-full px-3 py-0.5 text-sm font-medium capitalize " +
                (inProfit
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700")
              }
            >
              {d.status || "—"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Revenue" value={formatMoney(d.revenue)} icon="💵" />
            <StatCard
              label="Total expenses"
              value={formatMoney(d.total_expenses)}
              icon="📉"
            />
            <StatCard
              label="Net profit"
              value={formatMoney(d.net_profit)}
              icon={inProfit ? "📈" : "🔻"}
            />
          </div>

          {/* Expense breakdown */}
          <Card>
            <h3 className="mb-3 text-sm font-semibold text-gray-700">
              Expense breakdown
            </h3>
            <table className="min-w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-50">
                  <td className="py-2 pr-4 text-gray-600">Doctor salaries</td>
                  <td className="py-2 text-right font-medium text-gray-800">
                    {formatMoney(d.doctor_salaries)}
                  </td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="py-2 pr-4 text-gray-600">
                    Operational expenses
                  </td>
                  <td className="py-2 text-right font-medium text-gray-800">
                    {formatMoney(d.operational_expenses)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-semibold text-gray-700">
                    Total expenses
                  </td>
                  <td className="py-2 text-right font-semibold text-gray-900">
                    {formatMoney(d.total_expenses)}
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </div>
  );
}

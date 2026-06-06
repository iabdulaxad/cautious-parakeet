import api from "../../api/methods";
import { useQuery, useMutation } from "../../hooks/useApi";
import { Loading, ErrorState, EmptyState, Card, Badge, Button } from "../../ui";
import { formatDate, formatMoney } from "../../utils/format";

export default function MyInvoices() {
  const { data, loading, error, reload } = useQuery(() => api.getMyInvoices(), []);
  const pay = useMutation((id) => api.payInvoice(id, "paid"), {
    successMessage: "Payment successful",
    onSuccess: reload,
  });

  if (loading) return <Loading />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  const list = data?.invoices || [];

  return (
    <div className="py-8">
      <h1 className="text-2xl font-semibold text-gray-800">My invoices</h1>
      {list.length === 0 ? (
        <EmptyState title="No invoices yet" icon="🧾" />
      ) : (
        <div className="mt-6 space-y-4">
          {list.map((inv) => (
            <Card key={inv.guid}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-800">{formatMoney(inv.total_amount)}</p>
                  <p className="text-sm text-gray-500">Issued {formatDate(inv.issue_date)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge status={inv.status} />
                  {inv.status === "unpaid" && (
                    <Button loading={pay.loading} onClick={() => pay.run(inv.guid)}>
                      Pay now
                    </Button>
                  )}
                </div>
              </div>
              {(inv.items || []).length > 0 && (
                <ul className="mt-3 divide-y divide-gray-50 text-sm">
                  {inv.items.map((it) => (
                    <li key={it.guid} className="flex justify-between py-1.5 text-gray-600">
                      <span>
                        {it.service_name}{" "}
                        {it.service_type && (
                          <span className="text-xs text-gray-400">({it.service_type})</span>
                        )}
                      </span>
                      <span>{formatMoney(it.amount)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

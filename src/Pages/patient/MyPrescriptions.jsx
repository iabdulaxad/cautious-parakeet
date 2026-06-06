import api from "../../api/methods";
import { useQuery } from "../../hooks/useApi";
import { Loading, ErrorState, EmptyState, Card } from "../../ui";
import { formatDate } from "../../utils/format";

export default function MyPrescriptions() {
  const { data, loading, error, reload } = useQuery(() => api.getMyPrescriptions(), []);
  if (loading) return <Loading />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  const list = data?.prescriptions || [];

  return (
    <div className="py-8">
      <h1 className="text-2xl font-semibold text-gray-800">My prescriptions</h1>
      {list.length === 0 ? (
        <EmptyState title="No prescriptions yet" icon="💊" />
      ) : (
        <div className="mt-6 space-y-4">
          {list.map((p) => (
            <Card key={p.guid}>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Issued {formatDate(p.issue_date)}</span>
                <span>Expires {formatDate(p.expiration_date)}</span>
              </div>
              <ul className="mt-3 divide-y divide-gray-50">
                {(p.items || []).map((it) => (
                  <li key={it.guid} className="py-2">
                    <p className="font-medium text-gray-800">{it.medication_name}</p>
                    <p className="text-sm text-gray-500">
                      {[it.dosage, it.frequency, it.duration].filter(Boolean).join(" · ")}
                    </p>
                    {it.instructions && <p className="text-xs text-gray-400">{it.instructions}</p>}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

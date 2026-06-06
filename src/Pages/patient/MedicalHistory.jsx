import api from "../../api/methods";
import { useAuth } from "../../Context/AuthContext";
import { useQuery } from "../../hooks/useApi";
import { Loading, ErrorState, EmptyState, Card } from "../../ui";
import { formatDate } from "../../utils/format";

export default function MedicalHistory() {
  const { profile } = useAuth();
  const { data, loading, error, reload } = useQuery(
    () => api.getPatientMedicalHistory(profile?.guid || ""),
    [profile?.guid]
  );

  if (loading) return <Loading />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  const records = data?.records || [];

  return (
    <div className="py-8">
      <h1 className="text-2xl font-semibold text-gray-800">Medical history</h1>
      {records.length === 0 ? (
        <EmptyState title="No medical records yet" hint="Records appear after your visits." icon="📋" />
      ) : (
        <div className="mt-6 space-y-4">
          {records.map((entry, i) => {
            const r = entry.record || {};
            const prescriptions = entry.prescriptions || [];
            const labs = entry.lab_results || [];
            return (
              <Card key={r.guid || i}>
                <div className="flex items-start justify-between">
                  <p className="font-medium text-gray-800">{r.diagnosis || "Diagnosis"}</p>
                  <span className="text-sm text-gray-400">{formatDate(r.date)}</span>
                </div>
                {r.symptoms && <p className="mt-1 text-sm text-gray-500">Symptoms: {r.symptoms}</p>}
                {r.examination_notes && (
                  <p className="text-sm text-gray-500">Notes: {r.examination_notes}</p>
                )}

                {prescriptions.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Prescriptions
                    </p>
                    {prescriptions.map((p) => (
                      <ul key={p.guid} className="mt-1 list-disc pl-5 text-sm text-gray-600">
                        {(p.items || []).map((it) => (
                          <li key={it.guid}>
                            {it.medication_name} —{" "}
                            {[it.dosage, it.frequency, it.duration].filter(Boolean).join(", ")}
                          </li>
                        ))}
                      </ul>
                    ))}
                  </div>
                )}

                {labs.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Lab results
                    </p>
                    <ul className="mt-1 text-sm">
                      {labs.map((l) => (
                        <li key={l.guid}>
                          <a
                            href={l.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary underline"
                          >
                            {l.description || l.file_type || "View file"}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

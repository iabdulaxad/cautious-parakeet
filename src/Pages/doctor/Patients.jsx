import { useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/methods";
import { useAuth } from "../../Context/AuthContext";
import {
  Button,
  Input,
  Badge,
  Card,
  PageHeader,
  EmptyState,
  Loading,
  ErrorState,
  DataTable,
  Modal,
} from "../../ui";
import { formatDate } from "../../utils/format";

const EMPTY_ITEM = {
  medication_name: "",
  dosage: "",
  frequency: "",
  duration: "",
  instructions: "",
};

export default function DoctorPatients() {
  const { profile } = useAuth();
  const doctorId = profile?.guid;

  // --- Search ---
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null); // null = not searched yet
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  async function runSearch(e) {
    e?.preventDefault?.();
    if (!query.trim()) {
      toast.error("Enter a name, phone or patient ID");
      return;
    }
    setSearching(true);
    setSearchError(null);
    try {
      const data = await api.searchPatients(query.trim());
      // Backend returns [{ patient: {...}, name }]. Flatten for the table.
      const rows = (data?.patients || []).map((r) => ({
        ...r.patient,
        name: r.name || r.patient?.name || "—",
      }));
      setResults(rows);
    } catch (err) {
      setSearchError(err);
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  // --- Medical history modal ---
  const [activePatient, setActivePatient] = useState(null);
  const [history, setHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  async function openHistory(patient) {
    setActivePatient(patient);
    setHistory(null);
    setHistoryError(null);
    setHistoryLoading(true);
    try {
      const data = await api.getPatientMedicalHistory(patient.guid);
      setHistory(data?.records || []);
    } catch (err) {
      setHistoryError(err);
    } finally {
      setHistoryLoading(false);
    }
  }

  async function reloadHistory() {
    if (activePatient) await openHistory(activePatient);
  }

  // --- Prescription editor ---
  const [rxRecord, setRxRecord] = useState(null); // the medical record we're prescribing against
  const [rxExpiration, setRxExpiration] = useState("");
  const [rxItems, setRxItems] = useState([{ ...EMPTY_ITEM }]);
  const [rxSaving, setRxSaving] = useState(false);

  function openRx(record) {
    setRxRecord(record);
    setRxExpiration("");
    setRxItems([{ ...EMPTY_ITEM }]);
  }

  function updateItem(idx, key, value) {
    setRxItems((items) =>
      items.map((it, i) => (i === idx ? { ...it, [key]: value } : it))
    );
  }

  function addItem() {
    setRxItems((items) => [...items, { ...EMPTY_ITEM }]);
  }

  function removeItem(idx) {
    setRxItems((items) =>
      items.length === 1 ? items : items.filter((_, i) => i !== idx)
    );
  }

  async function submitRx() {
    const items = rxItems.filter((it) => it.medication_name.trim());
    if (items.length === 0) {
      toast.error("Add at least one medication");
      return;
    }
    setRxSaving(true);
    try {
      await api.createPrescription({
        medical_records_id: rxRecord.guid,
        patients_id: rxRecord.patients_id || activePatient?.guid,
        doctors_id: doctorId,
        expiration_date: rxExpiration,
        items,
      });
      toast.success("Prescription created");
      setRxRecord(null);
      await reloadHistory();
    } catch (err) {
      toast.error(err?.message || "Failed to create prescription");
    } finally {
      setRxSaving(false);
    }
  }

  const columns = [
    { key: "name", header: "Name", render: (p) => p.name || "—" },
    { key: "phone", header: "Phone", render: (p) => p.phone || "—" },
    { key: "guid", header: "Patient ID" },
    {
      key: "actions",
      header: "",
      render: (p) => (
        <Button
          variant="secondary"
          className="px-2 py-1 text-xs"
          onClick={() => openHistory(p)}
        >
          View history
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Patients"
        subtitle="Search patients and review their medical history"
      />

      <form onSubmit={runSearch} className="mb-5 flex items-end gap-2">
        <div className="flex-1 md:max-w-md">
          <Input
            label="Search"
            placeholder="Name, phone or patient ID"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button type="submit" loading={searching}>
          Search
        </Button>
      </form>

      {searchError ? (
        <ErrorState error={searchError} onRetry={() => runSearch()} />
      ) : results === null ? (
        <EmptyState
          title="Search for a patient"
          hint="Enter a name, phone number or patient ID above."
          icon="🔍"
        />
      ) : (
        <DataTable
          columns={columns}
          rows={results}
          empty={
            <EmptyState
              title="No patients found"
              hint="Try a different name, phone or ID."
            />
          }
        />
      )}

      {/* Medical history modal */}
      <Modal
        open={!!activePatient}
        onClose={() => setActivePatient(null)}
        title={`Medical history — ${activePatient?.name || activePatient?.guid || ""}`}
        width="max-w-2xl"
        footer={
          <Button variant="secondary" onClick={() => setActivePatient(null)}>
            Close
          </Button>
        }
      >
        {historyLoading ? (
          <Loading />
        ) : historyError ? (
          <ErrorState error={historyError} onRetry={reloadHistory} />
        ) : !history || history.length === 0 ? (
          <EmptyState
            title="No records yet"
            hint="This patient has no medical history."
            icon="📋"
          />
        ) : (
          <div className="space-y-4">
            {history.map((entry) => {
              const rec = entry.record || {};
              const prescriptions = entry.prescriptions || [];
              const labResults = entry.lab_results || [];
              return (
                <Card key={rec.guid} className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {rec.diagnosis || "—"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(rec.date)}
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      className="px-2 py-1 text-xs"
                      onClick={() => openRx(rec)}
                    >
                      Add prescription
                    </Button>
                  </div>

                  {rec.symptoms && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Symptoms: </span>
                      {rec.symptoms}
                    </p>
                  )}
                  {rec.examination_notes && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Notes: </span>
                      {rec.examination_notes}
                    </p>
                  )}

                  {prescriptions.length > 0 && (
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Prescriptions
                      </p>
                      {prescriptions.map((rx) => (
                        <div
                          key={rx.guid}
                          className="mb-2 rounded-lg bg-gray-50 p-3 text-sm"
                        >
                          <p className="mb-1 text-xs text-gray-400">
                            Issued {formatDate(rx.issue_date)}
                            {rx.expiration_date
                              ? ` · expires ${formatDate(rx.expiration_date)}`
                              : ""}
                          </p>
                          <ul className="list-disc space-y-0.5 pl-5 text-gray-700">
                            {(rx.items || []).map((it) => (
                              <li key={it.guid}>
                                <span className="font-medium">
                                  {it.medication_name}
                                </span>
                                {it.dosage ? ` — ${it.dosage}` : ""}
                                {it.frequency ? `, ${it.frequency}` : ""}
                                {it.duration ? ` for ${it.duration}` : ""}
                                {it.instructions ? ` (${it.instructions})` : ""}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {labResults.length > 0 && (
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Lab results
                      </p>
                      <ul className="space-y-1 text-sm">
                        {labResults.map((lab) => (
                          <li
                            key={lab.guid}
                            className="flex items-center gap-2"
                          >
                            {lab.file_type && <Badge>{lab.file_type}</Badge>}
                            <a
                              href={lab.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary underline"
                            >
                              {lab.description || "View file"}
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
      </Modal>

      {/* Prescription editor modal */}
      <Modal
        open={!!rxRecord}
        onClose={() => setRxRecord(null)}
        title="New prescription"
        width="max-w-2xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRxRecord(null)}>
              Cancel
            </Button>
            <Button variant="primary" loading={rxSaving} onClick={submitRx}>
              Save prescription
            </Button>
          </>
        }
      >
        <div className="mb-4 md:max-w-xs">
          <Input
            label="Expiration date"
            type="date"
            value={rxExpiration}
            onChange={(e) => setRxExpiration(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          {rxItems.map((item, idx) => (
            <Card key={idx} className="space-y-2 bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Medication {idx + 1}
                </span>
                {rxItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
              <Input
                label="Medication name"
                required
                value={item.medication_name}
                onChange={(e) =>
                  updateItem(idx, "medication_name", e.target.value)
                }
              />
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <Input
                  label="Dosage"
                  value={item.dosage}
                  onChange={(e) => updateItem(idx, "dosage", e.target.value)}
                />
                <Input
                  label="Frequency"
                  value={item.frequency}
                  onChange={(e) =>
                    updateItem(idx, "frequency", e.target.value)
                  }
                />
                <Input
                  label="Duration"
                  value={item.duration}
                  onChange={(e) => updateItem(idx, "duration", e.target.value)}
                />
              </div>
              <Input
                label="Instructions"
                value={item.instructions}
                onChange={(e) =>
                  updateItem(idx, "instructions", e.target.value)
                }
              />
            </Card>
          ))}
        </div>

        <Button
          variant="secondary"
          className="mt-3"
          onClick={addItem}
        >
          + Add medication
        </Button>
      </Modal>
    </div>
  );
}

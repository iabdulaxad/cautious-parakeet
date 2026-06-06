import { useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/methods";
import {
  Badge,
  Button,
  Input,
  PageHeader,
  EmptyState,
  Loading,
  ErrorState,
  DataTable,
  Modal,
} from "../../ui";
import { formatMoney, formatDate } from "../../utils/format";

export default function ReceptionPatients() {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState(null); // null = not searched yet
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Selected patient + their invoices
  const [selected, setSelected] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [invLoading, setInvLoading] = useState(false);
  const [invBusy, setInvBusy] = useState(false);

  const search = async () => {
    const q = query.trim();
    if (!q) {
      toast.error("Enter a name, phone or patient id");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.searchPatients(q);
      setRows(res?.patients || []);
    } catch (err) {
      setError(err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const loadInvoices = async (patientId) => {
    setInvLoading(true);
    try {
      const res = await api.getPatientInvoices(patientId);
      setInvoices(res?.invoices || []);
    } catch (err) {
      toast.error(err?.message || "Failed to load invoices");
      setInvoices([]);
    } finally {
      setInvLoading(false);
    }
  };

  const openPatient = (row) => {
    setSelected(row);
    setInvoices([]);
    if (row?.patient?.guid) loadInvoices(row.patient.guid);
  };

  const settleInvoice = async (invoiceId, status) => {
    setInvBusy(true);
    try {
      await api.payInvoice(invoiceId, status);
      toast.success(`Invoice ${status}`);
      if (selected?.patient?.guid) await loadInvoices(selected.patient.guid);
    } catch (err) {
      toast.error(err?.message || "Failed to update invoice");
    } finally {
      setInvBusy(false);
    }
  };

  const columns = [
    { key: "name", header: "Name", render: (r) => r.name || "—" },
    { key: "phone", header: "Phone", render: (r) => r.patient?.phone || "—" },
    { key: "gender", header: "Gender", render: (r) => r.patient?.gender || "—" },
    {
      key: "blood_type",
      header: "Blood type",
      render: (r) => r.patient?.blood_type || "—",
    },
    {
      key: "guid",
      header: "Patient ID",
      render: (r) => (
        <span className="font-mono text-xs text-gray-500">
          {r.patient?.guid}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <Button
          variant="secondary"
          className="px-2 py-1"
          onClick={() => openPatient(r)}
        >
          Invoices
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Patients"
        subtitle="Search patients by name, phone or ID"
      />

      <div className="mb-5 flex gap-2">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Name, phone or patient id"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
          />
        </div>
        <div className="flex items-start">
          <Button loading={loading} onClick={search}>
            Search
          </Button>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState error={error} onRetry={search} />
      ) : rows === null ? (
        <EmptyState
          title="Search for a patient"
          hint="Results will appear here."
          icon="🔎"
        />
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          rowKey="name"
          empty={
            <EmptyState
              title="No patients found"
              hint="Try a different name, phone or ID."
            />
          }
        />
      )}

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={`Invoices — ${selected?.name || selected?.patient?.guid || ""}`}
        width="max-w-2xl"
      >
        {invLoading ? (
          <Loading />
        ) : invoices.length === 0 ? (
          <EmptyState
            title="No invoices"
            hint="This patient has no invoices yet."
            icon="🧾"
          />
        ) : (
          <div className="space-y-3">
            {invoices.map((inv) => (
              <div
                key={inv.guid}
                className="rounded-lg border border-gray-100 p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {formatMoney(inv.total_amount)}
                    </p>
                    <p className="text-xs text-gray-400">
                      Issued {formatDate(inv.issue_date)} ·{" "}
                      {(inv.items || []).length} item(s)
                    </p>
                  </div>
                  <Badge status={inv.status} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    className="px-2 py-1"
                    disabled={invBusy || inv.status === "paid"}
                    onClick={() => settleInvoice(inv.guid, "paid")}
                  >
                    Pay
                  </Button>
                  <Button
                    variant="secondary"
                    className="px-2 py-1"
                    disabled={invBusy || inv.status === "refunded"}
                    onClick={() => settleInvoice(inv.guid, "refunded")}
                  >
                    Refund
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}

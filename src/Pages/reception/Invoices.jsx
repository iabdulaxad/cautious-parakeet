import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../../api/methods";
import {
  Badge,
  Button,
  Input,
  Select,
  Card,
  PageHeader,
  EmptyState,
  Loading,
  DataTable,
  Spinner,
} from "../../ui";
import { formatMoney, formatDate, formatDateTime, cn } from "../../utils/format";

const SERVICE_TYPES = ["consultation", "lab", "procedure"];
const blankItem = () => ({ service_name: "", service_type: "consultation", amount: "" });

export default function ReceptionInvoices() {
  // --- Create invoice ---
  const [appointmentId, setAppointmentId] = useState("");
  const [patientId, setPatientId] = useState("");
  const [items, setItems] = useState([blankItem()]);
  const [creating, setCreating] = useState(false);

  // --- Patient Search ---
  const [patientSearch, setPatientSearch] = useState("");
  const [patientResults, setPatientResults] = useState([]);
  const [searchingPatients, setSearchingPatients] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // --- Appointment Selection ---
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);

  // --- Lookup ---
  const [lookupId, setLookupId] = useState("");
  const [invoices, setInvoices] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (patientSearch.trim().length > 1) {
        handleSearchPatients(patientSearch);
      } else {
        setPatientResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [patientSearch]);

  const handleSearchPatients = async (query) => {
    setSearchingPatients(true);
    try {
      const res = await api.searchPatients(query);
      setPatientResults(res?.patients || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingPatients(false);
    }
  };

  const selectPatient = async (p) => {
    setSelectedPatient(p);
    setPatientId(p.patient.guid);
    setPatientSearch(p.name);
    setPatientResults([]);
    setSelectedAppt(null);
    setAppointmentId("");

    setLoadingAppointments(true);
    try {
      const res = await api.getAppointments({ patients_id: p.patient.guid });
      // Sort by date desc
      const list = (res?.appointments || []).sort(
        (a, b) => new Date(b.appointment_date) - new Date(a.appointment_date)
      );
      setAppointments(list);
    } catch (err) {
      toast.error("Failed to load patient appointments");
    } finally {
      setLoadingAppointments(false);
    }
  };

  const selectAppointment = (appt) => {
    setSelectedAppt(appt);
    setAppointmentId(appt.guid);
  };

  const setItem = (i, key, value) =>
    setItems((arr) =>
      arr.map((it, idx) => (idx === i ? { ...it, [key]: value } : it))
    );
  const addItem = () => setItems((arr) => [...arr, blankItem()]);
  const removeItem = (i) =>
    setItems((arr) => (arr.length === 1 ? arr : arr.filter((_, idx) => idx !== i)));

  const itemsTotal = items.reduce((sum, it) => sum + Number(it.amount || 0), 0);

  const createInvoice = async (e) => {
    e.preventDefault();
    if (!appointmentId.trim()) return toast.error("Please select an appointment");
    if (!patientId.trim()) return toast.error("Please select a patient");

    const payloadItems = items
      .filter((it) => it.service_name.trim() || Number(it.amount) > 0)
      .map((it) => ({
        service_name: it.service_name.trim(),
        service_type: it.service_type,
        amount: Number(it.amount || 0),
      }));

    if (payloadItems.length === 0) {
      return toast.error("Add at least one line item with an amount");
    }
    if (itemsTotal <= 0) {
      return toast.error("Invoice total must be greater than zero");
    }

    setCreating(true);
    try {
      // total_amount 0 -> backend sums the items.
      await api.createInvoice({
        appointments_id: appointmentId.trim(),
        patients_id: patientId.trim(),
        total_amount: 0,
        items: payloadItems,
      });
      toast.success("Invoice created");
      setAppointmentId("");
      setPatientId("");
      setPatientSearch("");
      setSelectedPatient(null);
      setSelectedAppt(null);
      setAppointments([]);
      setItems([blankItem()]);
      // Keep patientId for lookup if needed
      if (lookupId === patientId.trim()) await runLookup(patientId.trim());
    } catch (err) {
      toast.error(err?.message || "Failed to create invoice");
    } finally {
      setCreating(false);
    }
  };

  const runLookup = async (id) => {
    const pid = (id ?? lookupId).trim();
    if (!pid) return toast.error("Enter a patient ID");
    setLookupLoading(true);
    try {
      const res = await api.getPatientInvoices(pid);
      setInvoices(res?.invoices || []);
    } catch (err) {
      toast.error(err?.message || "Failed to load invoices");
      setInvoices([]);
    } finally {
      setLookupLoading(false);
    }
  };

  const settle = async (invoiceId, status) => {
    setBusy(true);
    try {
      await api.payInvoice(invoiceId, status);
      toast.success(`Invoice ${status}`);
      await runLookup(lookupId.trim());
    } catch (err) {
      toast.error(err?.message || "Failed to update invoice");
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    {
      key: "issue_date",
      header: "Issued",
      render: (inv) => formatDate(inv.issue_date),
    },
    {
      key: "total_amount",
      header: "Amount",
      render: (inv) => formatMoney(inv.total_amount),
    },
    {
      key: "items",
      header: "Items",
      render: (inv) => (inv.items || []).length,
    },
    {
      key: "status",
      header: "Status",
      render: (inv) => <Badge status={inv.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      render: (inv) => (
        <div className="flex gap-1">
          <Button
            className="px-2 py-1"
            disabled={busy || inv.status === "paid"}
            onClick={() => settle(inv.guid, "paid")}
          >
            Pay
          </Button>
          <Button
            variant="secondary"
            className="px-2 py-1"
            disabled={busy || inv.status === "refunded"}
            onClick={() => settle(inv.guid, "refunded")}
          >
            Refund
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Invoices"
        subtitle="Create invoices and settle patient balances"
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Create invoice */}
        <Card>
          <h2 className="mb-4 font-semibold text-gray-800">Create invoice</h2>
          <form onSubmit={createInvoice} className="space-y-4">
            <div className="relative">
              <Input
                label="Search Patient"
                placeholder="Type patient name..."
                required={!patientId}
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
              />
              {searchingPatients && (
                <div className="absolute right-3 top-9">
                  <Spinner className="h-4 w-4 text-primary" />
                </div>
              )}
              {patientResults.length > 0 && (
                <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
                  {patientResults.map((p) => (
                    <div
                      key={p.patient.guid}
                      className="cursor-pointer px-4 py-2 hover:bg-gray-50"
                      onClick={() => selectPatient(p)}
                    >
                      <div className="font-medium text-gray-800">{p.name}</div>
                      <div className="text-xs text-gray-500">
                        Phone: {p.patient.phone}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedPatient && (
              <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                Selected: <span className="font-semibold">{selectedPatient.name}</span>
                <button
                  type="button"
                  className="ml-2 text-xs underline"
                  onClick={() => {
                    setSelectedPatient(null);
                    setPatientId("");
                    setPatientSearch("");
                    setAppointments([]);
                    setSelectedAppt(null);
                    setAppointmentId("");
                  }}
                >
                  Clear
                </button>
              </div>
            )}

            {patientId && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Select Appointment
                </label>
                {loadingAppointments ? (
                  <div className="flex items-center gap-2 py-2 text-sm text-gray-500">
                    <Spinner className="h-4 w-4" /> Loading appointments...
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="py-2 text-sm text-amber-600">
                    No appointments found for this patient.
                  </div>
                ) : (
                  <div className="max-h-40 overflow-y-auto rounded-md border border-gray-200">
                    {appointments.map((appt) => (
                      <div
                        key={appt.guid}
                        className={cn(
                          "cursor-pointer border-b border-gray-50 px-3 py-2 last:border-0 hover:bg-gray-50",
                          selectedAppt?.guid === appt.guid && "bg-blue-50"
                        )}
                        onClick={() => selectAppointment(appt)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {formatDate(appt.appointment_date)} at {appt.appointment_time}
                          </span>
                          <Badge status={appt.status} />
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {appt.guid.slice(0, 8)}...
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {selectedAppt && (
                  <div className="text-xs text-green-600">
                    ✓ Appointment selected
                  </div>
                )}
              </div>
            )}

            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">
                Line items
              </p>
              <div className="space-y-2">
                {items.map((it, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-12 items-end gap-2"
                  >
                    <div className="col-span-5">
                      <Input
                        placeholder="Service name"
                        value={it.service_name}
                        onChange={(e) =>
                          setItem(i, "service_name", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-span-4">
                      <Select
                        value={it.service_type}
                        onChange={(e) =>
                          setItem(i, "service_type", e.target.value)
                        }
                      >
                        {SERVICE_TYPES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={it.amount}
                        onChange={(e) => setItem(i, "amount", e.target.value)}
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        variant="ghost"
                        className="px-2 py-2"
                        disabled={items.length === 1}
                        onClick={() => removeItem(i)}
                        title="Remove"
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addItem}
                className="mt-2 text-sm text-primary hover:underline"
              >
                + Add line item
              </button>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
              <span className="text-sm text-gray-500">
                Total:{" "}
                <span className="font-semibold text-gray-800">
                  {formatMoney(itemsTotal)}
                </span>
              </span>
              <Button type="submit" loading={creating} disabled={!appointmentId}>
                Create invoice
              </Button>
            </div>
          </form>
        </Card>

        {/* Lookup */}
        <Card>
          <h2 className="mb-4 font-semibold text-gray-800">
            Lookup patient invoices
          </h2>
          <div className="mb-4 flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Patient ID"
                value={lookupId}
                onChange={(e) => setLookupId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runLookup()}
              />
            </div>
            <div className="flex items-start">
              <Button loading={lookupLoading} onClick={() => runLookup()}>
                Lookup
              </Button>
            </div>
          </div>

          {lookupLoading ? (
            <Loading />
          ) : invoices === null ? (
            <EmptyState
              title="Look up a patient"
              hint="Enter a patient ID to see their invoices."
              icon="🧾"
            />
          ) : (
            <DataTable
              columns={columns}
              rows={invoices}
              empty={
                <EmptyState
                  title="No invoices"
                  hint="This patient has no invoices yet."
                  icon="🧾"
                />
              }
            />
          )}
        </Card>
      </div>
    </div>
  );
}

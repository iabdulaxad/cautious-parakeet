import { useState } from "react";
import api from "../../api/methods";
import { useQuery, useMutation } from "../../hooks/useApi";
import {
  Button,
  Input,
  Select,
  Textarea,
  StatCard,
  PageHeader,
  EmptyState,
  Loading,
  ErrorState,
  DataTable,
  Modal,
} from "../../ui";
import { formatMoney, formatDate, prettyStatus } from "../../utils/format";
import { toast } from "react-toastify";

const todayStr = () => new Date().toISOString().slice(0, 10);

const CATEGORIES = ["operational", "salary", "supplies", "other"];

const blankExpense = () => ({
  category: "operational",
  amount: "",
  expense_date: todayStr(),
  description: "",
});

export default function AdminExpenses() {
  const [draft, setDraft] = useState({ start_date: "", end_date: "" });
  const [range, setRange] = useState({ start_date: "", end_date: "" });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blankExpense());

  const { data, loading, error, reload } = useQuery(
    () => api.listExpenses(range),
    [range.start_date, range.end_date]
  );

  const apply = () => setRange({ ...draft });

  const createExpense = useMutation((payload) => api.createExpense(payload), {
    successMessage: "Expense created",
    onSuccess: () => {
      setOpen(false);
      setForm(blankExpense());
      reload();
    },
  });

  const deleteExpense = useMutation((id) => api.deleteExpense(id), {
    successMessage: "Expense deleted",
    onSuccess: () => reload(),
  });

  const submit = (e) => {
    e.preventDefault();
    if (!form.category) {
      toast.error("Category is required");
      return;
    }
    if (!(Number(form.amount) > 0)) {
      toast.error("Amount must be greater than zero");
      return;
    }
    createExpense
      .run({
        category: form.category,
        amount: Number(form.amount),
        expense_date: form.expense_date || todayStr(),
        description: form.description,
      })
      .catch(() => {});
  };

  const expenses = data?.expenses || [];
  const total = data?.total || 0;

  const columns = [
    {
      key: "expense_date",
      header: "Date",
      render: (e) => formatDate(e.expense_date),
    },
    {
      key: "category",
      header: "Category",
      render: (e) => prettyStatus(e.category) || "—",
    },
    {
      key: "amount",
      header: "Amount",
      render: (e) => formatMoney(e.amount),
    },
    {
      key: "description",
      header: "Description",
      render: (e) => e.description || "—",
    },
    {
      key: "actions",
      header: "",
      render: (e) => (
        <Button
          variant="danger"
          loading={deleteExpense.loading}
          onClick={() => deleteExpense.run(e.guid).catch(() => {})}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Expenses"
        subtitle="Track operational spending"
        actions={<Button onClick={() => setOpen(true)}>➕ New expense</Button>}
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
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard label="Total expenses" value={formatMoney(total)} icon="🧾" />
            <StatCard label="Records" value={expenses.length} icon="📄" />
          </div>

          <DataTable
            columns={columns}
            rows={expenses}
            empty={
              <EmptyState
                title="No expenses"
                hint="Record a new expense to get started."
                icon="🧾"
              />
            }
          />
        </div>
      )}

      {/* New expense modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New expense"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="new-expense-form"
              loading={createExpense.loading}
            >
              Create
            </Button>
          </>
        }
      >
        <form
          id="new-expense-form"
          onSubmit={submit}
          className="grid grid-cols-1 gap-3"
        >
          <Select
            label="Category"
            required
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {prettyStatus(c)}
              </option>
            ))}
          </Select>
          <Input
            label="Amount"
            type="number"
            min="0"
            step="0.01"
            required
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
          <Input
            label="Expense date"
            type="date"
            value={form.expense_date}
            onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </form>
      </Modal>
    </div>
  );
}

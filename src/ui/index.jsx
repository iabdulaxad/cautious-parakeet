import { cn, statusClasses, prettyStatus } from "../utils/format";

// ------------------------------- Spinner -----------------------------------
export function Spinner({ className = "" }) {
  return (
    <span
      className={cn(
        "inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent",
        className
      )}
    />
  );
}

export function Loading({ label = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
      <Spinner className="h-8 w-8 text-primary" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

// ------------------------------- Button ------------------------------------
const BTN_VARIANTS = {
  primary: "bg-primary text-white hover:opacity-90",
  secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
  danger: "bg-red-500 text-white hover:bg-red-600",
  ghost: "text-gray-600 hover:bg-gray-100",
};

export function Button({
  children,
  variant = "primary",
  className = "",
  loading = false,
  disabled = false,
  type = "button",
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
        BTN_VARIANTS[variant],
        className
      )}
      {...rest}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
}

// ------------------------------- Fields ------------------------------------
export function Field({ label, error, required, children, className = "" }) {
  return (
    <label className={cn("block", className)}>
      {label && (
        <span className="mb-1 block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </span>
      )}
      {children}
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  );
}

const CONTROL =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary";

export function Input({ label, error, required, className = "", ...rest }) {
  return (
    <Field label={label} error={error} required={required}>
      <input className={cn(CONTROL, className)} {...rest} />
    </Field>
  );
}

export function Textarea({ label, error, required, className = "", ...rest }) {
  return (
    <Field label={label} error={error} required={required}>
      <textarea className={cn(CONTROL, "min-h-[90px]", className)} {...rest} />
    </Field>
  );
}

export function Select({ label, error, required, children, className = "", ...rest }) {
  return (
    <Field label={label} error={error} required={required}>
      <select className={cn(CONTROL, "bg-white", className)} {...rest}>
        {children}
      </select>
    </Field>
  );
}

// ------------------------------- Badge -------------------------------------
export function Badge({ status, children, className = "" }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        status ? statusClasses(status) : "bg-gray-100 text-gray-600",
        className
      )}
    >
      {children || prettyStatus(status)}
    </span>
  );
}

// ------------------------------- Card --------------------------------------
export function Card({ children, className = "" }) {
  return (
    <div className={cn("rounded-xl border border-gray-100 bg-white p-5 shadow-sm", className)}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, hint, icon }) {
  return (
    <Card className="flex items-center gap-4">
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-2xl">
          {icon}
        </div>
      )}
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-semibold text-gray-800">{value}</p>
        {hint && <p className="text-xs text-gray-400">{hint}</p>}
      </div>
    </Card>
  );
}

// ----------------------------- PageHeader ----------------------------------
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

// ----------------------------- EmptyState ----------------------------------
export function EmptyState({ title = "Nothing here yet", hint, icon = "📭" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-center text-gray-400">
      <span className="text-4xl">{icon}</span>
      <p className="font-medium text-gray-500">{title}</p>
      {hint && <p className="text-sm">{hint}</p>}
    </div>
  );
}

// ------------------------------- Table -------------------------------------
// columns: [{ key, header, render?(row), className? }]
export function DataTable({ columns, rows, empty, rowKey = "guid" }) {
  if (!rows || rows.length === 0) {
    return empty || <EmptyState />;
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            {columns.map((c) => (
              <th key={c.key} className={cn("px-4 py-3 font-medium", c.className)}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row[rowKey] || i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
              {columns.map((c) => (
                <td key={c.key} className={cn("px-4 py-3 text-gray-700", c.className)}>
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ------------------------------- Modal -------------------------------------
export function Modal({ open, onClose, title, children, footer, width = "max-w-lg" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className={cn("w-full rounded-xl bg-white shadow-xl", width)}>
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-xl leading-none text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

// ----------------------------- Pagination ----------------------------------
export function Pagination({ page, hasNext, onPage }) {
  return (
    <div className="mt-4 flex items-center justify-end gap-2 text-sm">
      <Button variant="secondary" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        Prev
      </Button>
      <span className="px-2 text-gray-500">Page {page}</span>
      <Button variant="secondary" disabled={!hasNext} onClick={() => onPage(page + 1)}>
        Next
      </Button>
    </div>
  );
}

// --------------------------- ErrorState ------------------------------------
export function ErrorState({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <span className="text-3xl">⚠️</span>
      <p className="text-sm text-gray-500">{error?.message || "Failed to load."}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}

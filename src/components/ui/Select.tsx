import { clsx } from "clsx";
import type { SelectHTMLAttributes } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  hint?: string;
  error?: string;
  showRequired?: boolean;
}

export function Select({
  label,
  options,
  hint,
  error,
  showRequired,
  id,
  className,
  required,
  ...props
}: SelectProps) {
  const selectId =
    id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  const isRequired = showRequired ?? required;

  return (
    <div className="space-y-1.5">
      {label ? (
        <label
          htmlFor={selectId}
          className="block text-[13px] font-semibold tracking-tight text-neutral-800"
        >
          {label}
          {isRequired && <span className="ml-0.5 text-danger-600">*</span>}
        </label>
      ) : null}
      <select
        id={selectId}
        className={clsx(
          "w-full rounded-control border bg-white px-3.5 py-2.5 text-sm text-neutral-900 shadow-soft transition-shadow",
          "focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-1",
          error
            ? "border-danger-500 focus:border-danger-500"
            : "border-neutral-200 focus:border-primary-500",
          className,
        )}
        aria-invalid={Boolean(error)}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint && !error && (
        <p className="text-caption text-neutral-500">{hint}</p>
      )}
      {error && (
        <p className="text-caption text-danger-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

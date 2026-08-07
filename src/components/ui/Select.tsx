import { clsx } from "clsx";
import type { SelectHTMLAttributes } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
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
  const selectId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  const isRequired = showRequired ?? required;

  return (
    <div className="space-y-1.5">
      <label htmlFor={selectId} className="block text-[13px] font-medium text-slate-800">
        {label}
        {isRequired && <span className="ml-0.5 text-danger-600">*</span>}
      </label>
      <select
        id={selectId}
        className={clsx(
          "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-neutral-900",
          "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1",
          error ? "border-danger-500" : "border-neutral-300",
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

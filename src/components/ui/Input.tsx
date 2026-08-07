import { clsx } from "clsx";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  showRequired?: boolean;
}

export function Input({
  label,
  hint,
  error,
  showRequired,
  id,
  className,
  required,
  ...props
}: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  const isRequired = showRequired ?? required;

  return (
    <div className="space-y-1.5">
      {label ? (
        <label htmlFor={inputId} className="block text-[13px] font-medium text-slate-800">
          {label}
          {isRequired && <span className="ml-0.5 text-danger-600">*</span>}
        </label>
      ) : null}
      <input
        id={inputId}
        className={clsx(
          "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-neutral-900",
          "placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1",
          error ? "border-danger-500" : "border-neutral-300",
          className,
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...props}
      />
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-caption text-neutral-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} className="text-caption text-danger-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

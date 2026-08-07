import { clsx } from "clsx";
import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  error?: string;
}

export function Textarea({ label, hint, error, id, className, ...props }: TextareaProps) {
  const textareaId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      <label htmlFor={textareaId} className="block text-sm font-medium text-neutral-800">
        {label}
      </label>
      <textarea
        id={textareaId}
        className={clsx(
          "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-neutral-900",
          "placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1",
          error ? "border-danger-500" : "border-neutral-300",
          className,
        )}
        rows={3}
        aria-invalid={Boolean(error)}
        {...props}
      />
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

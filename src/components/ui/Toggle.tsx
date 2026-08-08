import { clsx } from "clsx";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled,
  id,
}: ToggleProps) {
  const toggleId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex items-center justify-between gap-4">
      {(label || description) && (
        <div className="flex-1">
          {label && (
            <p className="text-sm font-semibold text-slate-800">{label}</p>
          )}
          {description && (
            <p className="mt-1 text-xs text-slate-500">{description}</p>
          )}
        </div>
      )}
      <button
        id={toggleId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={clsx(
          "relative inline-flex h-[22px] w-10 shrink-0 rounded-full p-0.5 transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-60",
          checked ? "bg-primary-600" : "bg-slate-300",
        )}
      >
        <span
          className={clsx(
            "block h-[18px] w-[18px] rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-[18px]" : "translate-x-0",
          )}
        />
      </button>
    </div>
  );
}

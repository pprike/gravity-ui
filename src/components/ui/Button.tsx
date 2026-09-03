import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "destructive";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-600 text-white shadow-soft hover:bg-primary-700 hover:shadow-glow active:bg-primary-800 focus-visible:ring-primary-500",
  secondary:
    "border border-neutral-200 bg-white text-neutral-900 shadow-soft hover:border-neutral-300 hover:bg-neutral-50 focus-visible:ring-primary-500",
  tertiary:
    "bg-transparent text-neutral-700 hover:bg-neutral-100/80 focus-visible:ring-primary-500",
  destructive:
    "bg-danger-600 text-white shadow-soft hover:bg-danger-700 focus-visible:ring-danger-500",
};

export function Button({
  variant = "primary",
  fullWidth = false,
  isLoading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-control px-4 py-2.5 text-sm font-semibold tracking-tight transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none",
        variantStyles[variant],
        fullWidth && "w-full",
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Please wait…</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

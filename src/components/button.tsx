import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "quiet" | "ghost";

export function buttonClass(variant: Variant = "primary", className?: string) {
  return cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 py-2 text-center text-sm font-medium transition-colors duration-200",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
    "disabled:cursor-not-allowed disabled:opacity-50",
    variant === "primary" && "bg-ink text-on-ink hover:bg-ink/90",
    variant === "quiet" && "bg-paper text-ink ring-1 ring-line hover:bg-sheet",
    variant === "ghost" && "bg-transparent text-ink hover:bg-sheet",
    className,
  );
}

export function Button({
  variant = "primary",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type={type} className={buttonClass(variant, className)} {...props} />;
}

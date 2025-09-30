import { forwardRef } from "react";
import { cn } from "./utils";

type Variant = "default" | "outline" | "ghost";

const variantStyles: Record<Variant, string> = {
  default: "bg-indigo-500 text-white shadow-lg shadow-indigo-900/40 hover:bg-indigo-400",
  outline:
    "border border-slate-700 bg-transparent text-slate-200 hover:border-indigo-400 hover:text-white",
  ghost: "text-slate-300 hover:text-white hover:bg-slate-800/60"
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = "default", ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
      variantStyles[variant],
      className
    )}
    {...props}
  />
));

Button.displayName = "Button";

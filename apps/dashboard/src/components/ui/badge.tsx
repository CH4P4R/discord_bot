import { cn } from "./utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline";
}

const variants = {
  default: "bg-indigo-500/20 text-indigo-200 border border-indigo-500/30",
  secondary: "bg-slate-700/60 text-slate-200 border border-slate-600",
  outline: "border border-slate-600 text-slate-300"
} as const;

export const Badge = ({ className, variant = "default", ...props }: BadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider",
      variants[variant],
      className
    )}
    {...props}
  />
);

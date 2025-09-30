import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "./utils";

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("cyberhub-theme") as "dark" | "light") ?? "dark";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("cyberhub-theme", theme);
  }, [theme]);

  const toggle = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-700 bg-slate-900 text-slate-300 transition hover:border-slate-500 hover:text-white",
        className
      )}
      aria-label="Temayý deðiþtir"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
};

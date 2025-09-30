import { cn } from "./utils";

export const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "glass rounded-xl border border-slate-800/60 p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] ring-1 ring-transparent hover:ring-sky-600/20 transition",
      className
    )}
    {...props}
  />
);

export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mb-4", className)} {...props} />
);

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export const CardTitle = ({ className, children, ...props }: CardTitleProps) => (
  <h3 className={cn("text-lg font-semibold text-white drop-shadow-[0_1px_0_rgba(0,0,0,0.4)]", className)} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-slate-400", className)} {...props} />
);

export const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn(className)} {...props} />
);

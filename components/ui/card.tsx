import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div data-reveal="fade" className={cn("group card-surface", className)}>
      {children}
    </div>
  );
}

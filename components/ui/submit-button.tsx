"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SubmitButton({
  children,
  className,
  variant = "primary",
  fullWidth = true,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "outline" | "surface" | "danger";
  fullWidth?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        buttonClasses({ variant, fullWidth }),
        "disabled:cursor-not-allowed disabled:opacity-70",
        className
      )}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

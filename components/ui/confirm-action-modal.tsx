"use client";

import { useEffect, useId, useState } from "react";
import { X } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { cn } from "@/lib/utils";

type TriggerVariant = "primary" | "outline" | "ghost" | "surface" | "danger";

export function ConfirmActionModal({
  action,
  title,
  description,
  trigger,
  triggerVariant = "danger",
  triggerClassName,
  triggerAriaLabel,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  submitToastTitle,
}: {
  action: (formData: FormData) => void | Promise<void>;
  title: string;
  description: string;
  trigger: React.ReactNode;
  triggerVariant?: TriggerVariant;
  triggerClassName?: string;
  triggerAriaLabel?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  submitToastTitle?: string;
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={triggerAriaLabel}
        className={cn(
          buttonClasses({ variant: triggerVariant, fullWidth: false }),
          triggerClassName
        )}
      >
        {trigger}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-[rgba(8,22,10,0.56)] backdrop-blur-[2px]"
            aria-label="Close confirmation dialog"
            onClick={() => setOpen(false)}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            className="relative z-10 w-full max-w-md rounded-[28px] border border-[var(--color-border)] bg-white p-6 shadow-[0_30px_80px_rgba(8,22,10,0.24)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id={titleId}
                  className="serif-display text-2xl font-semibold text-[var(--color-text)]"
                >
                  {title}
                </h2>
                <p
                  id={descriptionId}
                  className="mt-3 text-sm leading-7 text-[var(--color-text-muted)]"
                >
                  {description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-[var(--color-border)] p-2 text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-muted)]"
                aria-label="Close confirmation dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className={buttonClasses({ variant: "surface", fullWidth: false })}
              >
                {cancelLabel}
              </button>
              <form
                action={action}
                data-submit-toast-title={submitToastTitle || confirmLabel}
              >
                <SubmitButton
                  variant="danger"
                  fullWidth={false}
                  className="min-w-[148px]"
                >
                  {confirmLabel}
                </SubmitButton>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

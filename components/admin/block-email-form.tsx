"use client";

import { useEffect, useId, useState } from "react";
import { MailX, X } from "lucide-react";
import { blockEmailFromFormAction } from "@/app/_actions/admin";
import { buttonClasses } from "@/components/ui/button";
import { FieldLabel, TextArea, TextInput } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

export function BlockEmailForm({ returnTo }: { returnTo: string }) {
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
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
      <div className="space-y-4">
        <div>
          <FieldLabel htmlFor="block-email">Email address</FieldLabel>
          <TextInput
            id="block-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@example.com"
          />
        </div>
        <div>
          <FieldLabel htmlFor="block-reason" optional>
            Note
          </FieldLabel>
          <TextArea
            id="block-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Why this address was blocked"
            className="min-h-24"
          />
        </div>
        <button
          type="button"
          className={buttonClasses({ variant: "danger", fullWidth: false })}
          onClick={() => setOpen(true)}
        >
          <MailX className="h-4 w-4" />
          Block Email
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-[rgba(8,22,10,0.56)] backdrop-blur-[2px]"
            aria-label="Close block email dialog"
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
                  Block this email?
                </h2>
                <p
                  id={descriptionId}
                  className="mt-3 text-sm leading-7 text-[var(--color-text-muted)]"
                >
                  Future comments, contact messages, sponsor applications, and
                  partner applications from this address will be rejected.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-[var(--color-border)] p-2 text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-muted)]"
                aria-label="Close block email dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              action={blockEmailFromFormAction}
              className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"
              data-submit-toast-title="Blocking email"
            >
              <input type="hidden" name="email" value={email} />
              <input type="hidden" name="reason" value={reason} />
              <input type="hidden" name="source" value="Manual admin block" />
              <input type="hidden" name="returnTo" value={returnTo} />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className={buttonClasses({ variant: "surface", fullWidth: false })}
              >
                Cancel
              </button>
              <SubmitButton
                variant="danger"
                fullWidth={false}
                className="min-w-[148px]"
              >
                Block Email
              </SubmitButton>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

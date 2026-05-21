"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import {
  FLASH_TOAST_COOKIE,
  parseFlashToast,
  type FlashToast,
} from "@/lib/flash-toast";
import { cn } from "@/lib/utils";

type Toast = FlashToast & { id: string };
type ToastSource = "flash" | "manual" | "submit";

const toastStyles = {
  success: {
    wrapper: "border-[#cde5d2] bg-[#eef8f0] text-[var(--color-primary)]",
    icon: CheckCircle2,
  },
  error: {
    wrapper: "border-[#f0c8c8] bg-[#fff3f3] text-[#a12626]",
    icon: TriangleAlert,
  },
  info: {
    wrapper: "border-[#d8e4fb] bg-[#f4f8ff] text-[#1e4f8e]",
    icon: Info,
  },
} as const;

const ToastContext = createContext<{
  pushToast: (
    toast: FlashToast,
    options?: {
      durationMs?: number;
      source?: ToastSource;
    }
  ) => void;
} | null>(null);

function readToastCookie() {
  if (typeof document === "undefined") {
    return null;
  }

  const encodedCookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${FLASH_TOAST_COOKIE}=`))
    ?.split("=")
    .slice(1)
    .join("=");

  return parseFlashToast(encodedCookie || null);
}

function clearToastCookie() {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${FLASH_TOAST_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback((
    toast: FlashToast,
    options?: {
      durationMs?: number;
      source?: ToastSource;
    }
  ) => {
    const id = crypto.randomUUID();
    const source = options?.source || "manual";
    const durationMs = options?.durationMs ?? 4500;

    setToasts((current) => {
      let next = current;

      if (source === "submit") {
        next = next.filter((toast) => !toast.id.startsWith("submit:"));
      } else if (toast.type !== "info") {
        next = next.filter((toast) => !toast.id.startsWith("submit:"));
      }

      const nextId = source === "submit" ? `submit:${id}` : id;
      return [...next, { ...toast, id: nextId }];
    });

    window.setTimeout(() => {
      setToasts((current) =>
        current.filter(
          (item) => item.id !== id && item.id !== `submit:${id}`
        )
      );
    }, durationMs);
  }, []);

  useEffect(() => {
    const getLabelFromSubmitter = (submitter: HTMLElement | null) => {
      if (!submitter) {
        return "";
      }

      const explicitTitle = submitter.getAttribute("data-submit-toast-title");
      if (explicitTitle) {
        return explicitTitle.trim();
      }

      const textLabel =
        submitter.textContent
          ?.replace(/\s+/g, " ")
          .replace(/^[^A-Za-z0-9]+/, "")
          .trim() || "";
      if (textLabel.length > 1) {
        return textLabel;
      }

      const ariaLabel = submitter.getAttribute("aria-label")?.trim() || "";
      return ariaLabel;
    };

    const handleSubmit = (event: Event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) {
        return;
      }

      if (form.dataset.submitToast === "off") {
        return;
      }

      const submitEvent = event as SubmitEvent;
      const submitter =
        submitEvent.submitter instanceof HTMLElement ? submitEvent.submitter : null;

      if (submitter?.dataset.submitToast === "off") {
        return;
      }

      const title =
        submitter?.dataset.submitToastTitle ||
        form.dataset.submitToastTitle ||
        getLabelFromSubmitter(submitter) ||
        "Submitting request";
      const description =
        submitter?.dataset.submitToastDescription ||
        form.dataset.submitToastDescription ||
        "Please wait while we process your request.";

      pushToast(
        {
          type: "info",
          title,
          description,
        },
        {
          durationMs: 2200,
          source: "submit",
        }
      );
    };

    document.addEventListener("submit", handleSubmit, true);

    return () => {
      document.removeEventListener("submit", handleSubmit, true);
    };
  }, [pushToast]);

  useEffect(() => {
    const syncToastCookie = () => {
      const toast = readToastCookie();
      if (!toast) {
        return;
      }

      clearToastCookie();
      pushToast(toast, { source: "flash" });
    };

    syncToastCookie();
    const intervalId = window.setInterval(syncToastCookie, 500);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [pushToast]);

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex flex-col items-end gap-3 sm:inset-x-auto sm:right-4 sm:top-4">
        {toasts.map((toast) => {
          const Icon = toastStyles[toast.type].icon;
          return (
            <div
              key={toast.id}
              className={cn(
                "pointer-events-auto w-full max-w-sm rounded-[20px] border px-4 py-4 shadow-[0_18px_40px_rgba(8,22,10,0.14)] backdrop-blur-sm",
                toastStyles[toast.type].wrapper
              )}
            >
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{toast.title}</p>
                  {toast.description ? (
                    <p className="mt-1 text-sm opacity-80">{toast.description}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  className="rounded-full p-1 opacity-70 transition hover:opacity-100"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider.");
  }

  return {
    toast: context.pushToast,
  };
}

export type FlashToast = {
  type: "success" | "error" | "info";
  title: string;
  description?: string;
};

export const FLASH_TOAST_COOKIE = "daaicf_flash_toast";

export function serializeFlashToast(toast: FlashToast) {
  return encodeURIComponent(JSON.stringify(toast));
}

export function parseFlashToast(value?: string | null) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(value)) as FlashToast;
  } catch {
    return null;
  }
}

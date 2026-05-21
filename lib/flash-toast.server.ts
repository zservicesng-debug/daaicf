import "server-only";

import { cookies } from "next/headers";
import {
  FLASH_TOAST_COOKIE,
  serializeFlashToast,
  type FlashToast,
} from "@/lib/flash-toast";

export async function setFlashToast(toast: FlashToast) {
  const cookieStore = await cookies();
  cookieStore.set(FLASH_TOAST_COOKIE, serializeFlashToast(toast), {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 20,
  });
}

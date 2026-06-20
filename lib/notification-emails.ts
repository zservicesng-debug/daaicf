import "server-only";

const MAX_NOTIFICATION_RECIPIENTS = 4;

export function getNotificationEmails() {
  const configuredEmails = process.env.NOTIFICATION_EMAILS;

  if (configuredEmails === undefined) {
    return [process.env.ADMIN_EMAIL || "admin@daaicf.org"];
  }

  return Array.from(
    new Set(
      configuredEmails
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean)
    )
  ).slice(0, MAX_NOTIFICATION_RECIPIENTS);
}

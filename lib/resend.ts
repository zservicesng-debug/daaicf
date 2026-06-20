import { Resend } from "resend";

export async function sendTransactionalEmail(input: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  if (Array.isArray(input.to) && input.to.length === 0) {
    return { delivered: false, reason: "missing-recipients" as const };
  }

  if (!process.env.RESEND_API_KEY) {
    return { delivered: false, reason: "missing-api-key" as const };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromEmail = process.env.RESEND_FROM_EMAIL || "no-reply@daaicf.org";

  try {
    const { error } = await resend.emails.send({
      from: `DAAICF <${fromEmail}>`,
      to: input.to,
      subject: input.subject,
      html: input.html,
    });

    if (error) {
      return { delivered: false, reason: error.message };
    }
  } catch (error) {
    return {
      delivered: false,
      reason: error instanceof Error ? error.message : "send-failed",
    };
  }

  return { delivered: true as const };
}

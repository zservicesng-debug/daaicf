import { Resend } from "resend";

export async function sendTransactionalEmail(input: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    return { delivered: false, reason: "missing-api-key" as const };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: "DAAICF <no-reply@daaicf.org>",
    to: input.to,
    subject: input.subject,
    html: input.html,
  });

  return { delivered: true as const };
}

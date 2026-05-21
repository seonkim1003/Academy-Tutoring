import { Resend } from "resend";
import { render } from "@react-email/render";
import type { ReactElement } from "react";

type SendOptions = {
  to: string | string[];
  subject: string;
  template: ReactElement;
  replyTo?: string;
};

export function emailEnvTag(webUrl: string): "dev" | "prod" {
  return webUrl.includes("localhost") ? "dev" : "prod";
}

export async function sendEmail(
  apiKey: string,
  fromEmail: string,
  replyToDefault: string,
  opts: SendOptions,
  envTag: "dev" | "prod" = "prod"
): Promise<void> {
  const resend = new Resend(apiKey);
  const html = await render(opts.template);

  const { error } = await resend.emails.send({
    from: `Academy Tutoring <${fromEmail}>`,
    to: Array.isArray(opts.to) ? opts.to : [opts.to],
    subject: opts.subject,
    html,
    replyTo: opts.replyTo ?? replyToDefault,
    headers: {
      "X-Entity-Ref-ID": crypto.randomUUID(), // prevents threading duplicates
    },
    // Disable click/open tracking so localhost links aren't wrapped
    // by resend-clicks.com (which causes SSL errors in local dev)
    tags: [{ name: "env", value: envTag }],
  });

  if (error) {
    console.error("Resend error:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

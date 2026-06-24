import { Resend } from "resend";

/**
 * Vercel serverless function: emails Contact-page submissions to Off Air.
 *
 * Setup (do once in the Vercel dashboard → Project → Settings → Environment
 * Variables):
 *   RESEND_API_KEY   – your Resend API key
 *   CONTACT_TO       – (optional) override recipient; defaults to info@offairwp.com
 *   CONTACT_FROM     – (optional) verified sender; defaults to Resend's test sender
 *
 * Until you verify your own domain in Resend, leave CONTACT_FROM unset and it
 * will send from onboarding@resend.dev (Resend's shared test sender).
 */

const TO = process.env.CONTACT_TO || "info@offairwp.com";
const FROM = process.env.CONTACT_FROM || "Off Air <onboarding@resend.dev>";

type Body = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  links?: { platform: string; url: string }[];
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!process.env.RESEND_API_KEY) {
    res
      .status(500)
      .json({ error: "Email is not configured yet (missing RESEND_API_KEY)." });
    return;
  }

  const body: Body =
    typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};

  const name = (body.name || "").trim();
  const email = (body.email || "").trim();
  const subject = (body.subject || "").trim();
  const message = (body.message || "").trim();
  const links = Array.isArray(body.links) ? body.links : [];

  if (!name || !email || !message) {
    res.status(400).json({ error: "Name, email and message are required." });
    return;
  }

  const linksHtml = links.length
    ? `<h3 style="margin:24px 0 8px">Submitted links</h3><ul>${links
        .map(
          (l) =>
            `<li><strong>${escapeHtml(l.platform)}:</strong> <a href="${escapeHtml(
              l.url
            )}">${escapeHtml(l.url)}</a></li>`
        )
        .join("")}</ul>`
    : "";

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
      <h2>New Off Air contact submission</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Subject:</strong> ${escapeHtml(subject || "(none)")}</p>
      <p><strong>Message:</strong></p>
      <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
      ${linksHtml}
    </div>
  `;

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: FROM,
      to: [TO],
      replyTo: email,
      subject: subject ? `Contact: ${subject}` : `New contact from ${name}`,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      res.status(502).json({ error: "Failed to send email." });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Contact handler error:", err);
    res.status(500).json({ error: "Unexpected error sending email." });
  }
}

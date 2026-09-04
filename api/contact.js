export const config = { runtime: "edge" };

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export default async function handler(request) {
  if (request.method !== "POST")
    return json({ error: "Method not allowed" }, 405);

  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.CONTACT_TO_EMAIL || "aryantalib60@gmail.com";
  const sender =
    process.env.RESEND_FROM_EMAIL ||
    "Portfolio Contact <onboarding@resend.dev>";

  if (!apiKey) return json({ error: "Email service is not configured." }, 500);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const subject = String(body.subject || "").trim();
  const message = String(body.message || "").trim();

  if (body.website) return json({ ok: true });
  if (!name || !email || !subject || !message)
    return json({ error: "Please complete every field." }, 400);
  if (
    name.length > 100 ||
    email.length > 254 ||
    subject.length > 180 ||
    message.length > 5000
  ) {
    return json({ error: "One or more fields are too long." }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return json({ error: "Please enter a valid email address." }, 400);

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: sender,
      to: [recipient],
      reply_to: email,
      subject: `Portfolio message: ${subject}`,
      html: `<h2>New portfolio message</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        <hr>
        <p>${escapeHtml(message).replaceAll("\n", "<br>")}</p>`,
    }),
  });

  if (!resendResponse.ok) {
    const error = await resendResponse.text();
    console.error("Resend error:", error);
    return json({ error: "Email delivery failed." }, 502);
  }

  return json({ ok: true });
}

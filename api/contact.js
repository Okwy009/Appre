// Optional Vercel serverless function — a self-hosted alternative to a
// third-party form service like Formspree.
//
// To use it instead of Formspree:
//   1. Deploy this repo to Vercel as-is (this file is auto-detected as an
//      API route at /api/contact — no extra config needed).
//   2. In contact.html, change the form's `action` and `data-endpoint`
//      attributes from the Formspree URL to "/api/contact".
//   3. Add real email delivery below (see the TODO) — this stub validates
//      and logs the submission but does not send anything on its own.
//   4. Add any provider API key as a Vercel environment variable, never
//      hard-coded here.
//
// This file intentionally has no dependencies so it runs on Vercel's
// Node.js runtime with no extra install step.

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  var body = req.body || {};

  // Vercel parses JSON bodies automatically; form-encoded/multipart bodies
  // may arrive as a string depending on runtime config — handle both.
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (e) {
      body = Object.fromEntries(new URLSearchParams(body));
    }
  }

  var name = (body.name || "").toString().trim();
  var email = (body.email || "").toString().trim();
  var targetRoles = (body.target_roles || "").toString().trim();
  var message = (body.message || "").toString().trim();
  var honeypot = (body._gotcha || "").toString().trim();

  // Silently accept and drop honeypot-triggered spam submissions.
  if (honeypot) {
    return res.status(200).json({ ok: true });
  }

  var errors = [];
  if (!name) errors.push("Name is required.");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("A valid email is required.");
  if (!message) errors.push("Message is required.");

  if (errors.length) {
    return res.status(400).json({ error: errors.join(" ") });
  }

  // TODO: send the submission somewhere real — e.g. an email API
  // (Resend, Postmark, SendGrid) or a database/CRM write. Example with an
  // HTTP-based email API (pseudocode, install the provider's SDK or use
  // fetch directly):
  //
  //   await fetch("https://api.resend.com/emails", {
  //     method: "POST",
  //     headers: {
  //       Authorization: "Bearer " + process.env.RESEND_API_KEY,
  //       "Content-Type": "application/json"
  //     },
  //     body: JSON.stringify({
  //       from: "Appre site <site@yourdomain.com>",
  //       to: "hello@yourdomain.com",
  //       subject: "New contact form submission",
  //       text: "Name: " + name + "\nEmail: " + email +
  //             "\nTarget roles: " + targetRoles + "\n\n" + message
  //     })
  //   });

  console.log("Contact form submission:", { name: name, email: email, targetRoles: targetRoles, message: message });

  return res.status(200).json({ ok: true });
};

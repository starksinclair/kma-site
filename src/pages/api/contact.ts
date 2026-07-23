import type { APIRoute } from "astro";
import nodemailer from "nodemailer";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  // Only accept JSON
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return new Response(JSON.stringify({ error: "Invalid content type" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { name, email, subject, message } = body;

  // Basic validation
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return new Response(
      JSON.stringify({ error: "Name, email, and message are required." }),
      { status: 422, headers: { "Content-Type": "application/json" } }
    );
  }

  // Simple email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return new Response(
      JSON.stringify({ error: "Please provide a valid email address." }),
      { status: 422, headers: { "Content-Type": "application/json" } }
    );
  }

  // Pull SMTP config from env (set these in Vercel dashboard)
  const {
    SMTP_HOST = "smtp.resend.com",
    SMTP_PORT = "465",
    SMTP_USER = "resend",
    SMTP_PASS,
    CONTACT_EMAIL = "Partnerships.kma@gmail.com",
  } = process.env;

  if (!SMTP_PASS) {
    console.error("SMTP_PASS environment variable is not set");
    return new Response(
      JSON.stringify({ error: "Mail service not configured." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // Create transporter — swap SMTP details via env vars, no code change needed
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465, // true for 465, false for 587
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const mailSubject = subject?.trim()
    ? `KMA Contact: ${subject.trim()}`
    : `KMA Contact form — message from ${name.trim()}`;

  const htmlBody = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#070509;color:#fff;border-radius:12px;overflow:hidden">
      <div style="background:#E6A817;padding:20px 28px">
        <h2 style="margin:0;font-size:1.2rem;color:#070509;font-family:sans-serif">
          KMA — New contact form submission
        </h2>
      </div>
      <div style="padding:28px">
        <p style="margin:0 0 18px"><strong style="color:#E6A817">Name:</strong> ${name}</p>
        <p style="margin:0 0 18px"><strong style="color:#E6A817">Email:</strong> <a href="mailto:${email}" style="color:#7b2fd4">${email}</a></p>
        ${subject ? `<p style="margin:0 0 18px"><strong style="color:#E6A817">Subject:</strong> ${subject}</p>` : ""}
        <p style="margin:0 0 10px"><strong style="color:#E6A817">Message:</strong></p>
        <div style="background:#120b1c;border:1px solid rgba(230,168,23,.18);border-radius:8px;padding:16px;white-space:pre-wrap;color:rgba(255,255,255,.85)">${message}</div>
      </div>
      <div style="padding:16px 28px;border-top:1px solid rgba(230,168,23,.18);font-size:.8rem;color:rgba(255,255,255,.45)">
        Sent via growwithkma.com contact form
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"KMA Website" <${SMTP_USER}@growwithkma.com>`,
      to: CONTACT_EMAIL,
      replyTo: `"${name}" <${email}>`,
      subject: mailSubject,
      html: htmlBody,
      text: `Name: ${name}\nEmail: ${email}\n${subject ? `Subject: ${subject}\n` : ""}Message:\n${message}`,
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Nodemailer error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to send email. Please try WhatsApp instead." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

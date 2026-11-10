
const RESEND_API_URL = "https://api.resend.com/emails";

const MAX_BODY_BYTES = 20_000;

function cleanText(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getField(body, ...keys) {
  for (const key of keys) {
    if (typeof body[key] === "string") {
      return body[key];
    }
  }
  return "";
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      success: false,
      error: "Method not allowed.",
    });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY");

    return res.status(500).json({
      success: false,
      error: "Email service is not configured.",
    });
  }

  try {
    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body;

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid submission.",
      });
    }

    if (
      Buffer.byteLength(JSON.stringify(body), "utf8") >
      MAX_BODY_BYTES
    ) {
      return res.status(413).json({
        success: false,
        error: "Submission is too large.",
      });
    }

    // Honeypot: automated bots may fill this hidden field.
    if (body.website_url) {
      return res.status(200).json({
        success: true,
      });
    }

    const name = cleanText(
      getField(body, "name"),
      120
    );

    const email = cleanText(
      getField(body, "email"),
      254
    );

    const message = cleanText(
      getField(body, "message", "project", "description"),
      5000
    );

    const style = cleanText(
      getField(body, "style", "selectedStyle", "demoStyle"),
      120
    );

    const color = cleanText(
      getField(body, "color", "accentColor", "selectedColor"),
      80
    );

    const device = cleanText(
      getField(body, "device", "previewDevice"),
      80
    );

    const demoEnabled =
      body.demoEnabled === true ||
      body.includeDemo === true ||
      body.demo === true;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: "Name, email, and message are required.",
      });
    }

    if (!validEmail(email)) {
      return res.status(400).json({
        success: false,
        error: "Please enter a valid email address.",
      });
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message);
    const safeStyle = escapeHtml(style || "Not selected");
    const safeColor = escapeHtml(color || "Not selected");
    const safeDevice = escapeHtml(device || "Not selected");

    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body style="margin:0;padding:32px;background:#101010;font-family:Arial,Helvetica,sans-serif;color:#f7f7f7;">
          <div style="max-width:620px;margin:0 auto;">
            <div style="font-size:26px;font-weight:900;letter-spacing:-1px;">
              MNGM<span style="color:#FF784F;">.</span>
            </div>

            <p style="font-size:11px;letter-spacing:3px;color:#999;">
              STUDIOS / NEW PROJECT INQUIRY
            </p>

            <div style="height:2px;background:#FF784F;margin:24px 0 32px;"></div>

            <h1 style="font-size:32px;letter-spacing:-1px;margin:0 0 24px;">
              You've got a new inquiry.
            </h1>

            <div style="background:#1b1b1b;border:1px solid #303030;border-radius:12px;padding:24px;">
              <p style="color:#999;font-size:12px;">CUSTOMER</p>
              <p style="font-size:20px;font-weight:bold;">${safeName}</p>

              <p style="color:#999;font-size:12px;">EMAIL</p>
              <p>
                <a href="mailto:${safeEmail}" style="color:#FF784F;">
                  ${safeEmail}
                </a>
              </p>

              <p style="color:#999;font-size:12px;">PROJECT MESSAGE</p>
              <p style="line-height:1.8;white-space:pre-wrap;overflow-wrap:anywhere;">${safeMessage}</p>
            </div>

            <div style="background:#1b1b1b;border:1px solid #303030;border-radius:12px;padding:24px;margin-top:16px;">
              <h2 style="font-size:18px;margin-top:0;">
                Website Demo Preferences
              </h2>

              <p>Demo requested: <strong>${demoEnabled ? "Yes" : "No"}</strong></p>
              <p>Style: <strong>${safeStyle}</strong></p>
              <p>Accent color: <strong>${safeColor}</strong></p>
              <p>Preview device: <strong>${safeDevice}</strong></p>
            </div>

            <p style="color:#888;font-size:12px;margin-top:32px;">
              Sent through the MNGM Studios website.
              Reply to this email to contact the customer.
            </p>
          </div>
        </body>
      </html>
    `;

    const text = [
      "NEW MNGM STUDIOS PROJECT INQUIRY",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      "",
      "Message:",
      message,
      "",
      "Website Demo Preferences",
      `Demo requested: ${demoEnabled ? "Yes" : "No"}`,
      `Style: ${style || "Not selected"}`,
      `Accent color: ${color || "Not selected"}`,
      `Preview device: ${device || "Not selected"}`,
    ].join("\n");

    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "MNGM Studios <contact@mngmstudios.com>",
        to: ["ryanmngm@gmail.com"],
        reply_to: email,
        subject: "New Project Inquiry — MNGM Studios",
        html,
        text,
      }),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || !result.id) {
      console.error("Resend delivery error", {
        status: response.status,
        error: result,
      });

      return res.status(502).json({
        success: false,
        error: "We couldn't send your message. Please try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Your inquiry was submitted successfully.",
    });
  } catch (error) {
    console.error("Contact form error:", error);

    return res.status(500).json({
      success: false,
      error: "Something went wrong. Please try again.",
    });
  }
}

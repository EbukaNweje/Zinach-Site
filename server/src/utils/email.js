// Use Brove (or any HTTP email proxy) when configured. Provide the
// `BROVE_API_URL` and `BROVE_API_KEY` environment variables. We use
// `fetch` to POST a JSON payload to the configured endpoint.

const BROVE_API_URL = process.env.BROVE_API_URL;
const BROVE_API_KEY = process.env.BROVE_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM;
const SENDER_NAME = "Dr William Makis MD";

function htmlToPlainText(html) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function sendViaBrove({ to, subject, html, replyTo }) {
  if (!BROVE_API_URL || !BROVE_API_KEY) {
    throw new Error(
      "Brove is not configured. Set BROVE_API_URL and BROVE_API_KEY in your environment.",
    );
  }

  const payload = { from: EMAIL_FROM, to, subject, html };
  if (replyTo) payload.replyTo = replyTo;

  // Brevo expects the API key in the `api-key` header and a specific
  // payload for `/smtp/email`.
  const brevoPayload = {
    sender: { name: SENDER_NAME, email: EMAIL_FROM },
    to: [{ email: to }],
    subject,
    htmlContent: html,
    textContent: htmlToPlainText(html),
  };
  if (replyTo)
    brevoPayload.replyTo = { email: replyTo, name: "Website visitor" };

  const res = await fetch(BROVE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": BROVE_API_KEY,
    },
    body: JSON.stringify(brevoPayload),
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 401) {
      throw new Error(
        "Brove send failed: 401 Unauthorized — token invalid or expired. Verify BROVE_API_KEY in your server environment.",
      );
    }
    throw new Error(`Brove send failed: ${res.status} ${text}`);
  }
}

// ── Shared layout wrapper ─────────────────────────────────────────────────────
function wrapLayout(content) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Dr William Makis MD</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background:#1e293b;border-radius:24px;overflow:hidden;border:1px solid #334155;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1d4ed8 0%,#2563eb 100%);padding:36px 40px;text-align:center;">
              <div style="display:inline-block;width:52px;height:52px;background:rgba(255,255,255,0.15);border-radius:50%;line-height:52px;font-size:18px;font-weight:700;color:#fff;margin-bottom:16px;">WM</div>
              <h1 style="margin:0;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Dr William Makis MD</h1>
              <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.75);">Pharmacy &amp; Wellness</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#0f172a;padding:24px 40px;text-align:center;border-top:1px solid #334155;">
              <p style="margin:0;font-size:12px;color:#64748b;">© ${new Date().getFullYear()} Dr William Makis MD. All rights reserved.</p>
              <p style="margin:8px 0 0;font-size:12px;color:#64748b;">
                Questions? Email us at
                <a href="mailto:williammakismd1946@outlook.com" style="color:#60a5fa;text-decoration:none;">williammakismd1946@outlook.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Order confirmation email (sent to customer) ───────────────────────────────
function buildOrderConfirmationHtml(order) {
  const itemRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #334155;color:#cbd5e1;font-size:14px;">
          ${item.name}${item.packageOption ? ` <span style="color:#94a3b8;font-size:12px;">(${item.packageOption})</span>` : ""}
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #334155;color:#cbd5e1;font-size:14px;text-align:right;">
          x${item.quantity}
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #334155;color:#f1f5f9;font-size:14px;text-align:right;font-weight:600;">
          ${item.price}
        </td>
      </tr>`,
    )
    .join("");

  const content = `
    <p style="margin:0 0 8px;font-size:16px;color:#94a3b8;">Hi ${order.customer.name},</p>
    <h2 style="margin:0 0 24px;font-size:22px;font-weight:700;color:#f1f5f9;">Your order is confirmed 🎉</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#94a3b8;line-height:1.7;">
      Thank you for your order. We've received it and will process it shortly.
      You'll receive another email once your payment is verified.
    </p>

    <!-- Order number badge -->
    <div style="background:#0f172a;border:1px solid #334155;border-radius:16px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#64748b;">Order number</p>
      <p style="margin:6px 0 0;font-size:20px;font-weight:700;color:#f1f5f9;">${order.orderNumber}</p>
    </div>

    <!-- Items table -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <thead>
        <tr>
          <th style="padding:8px 0;font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#64748b;text-align:left;border-bottom:1px solid #334155;">Item</th>
          <th style="padding:8px 0;font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#64748b;text-align:right;border-bottom:1px solid #334155;">Qty</th>
          <th style="padding:8px 0;font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#64748b;text-align:right;border-bottom:1px solid #334155;">Price</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>

    <!-- Total block -->
    <div style="background:linear-gradient(135deg,#166534 0%,#16a34a 100%);border-radius:16px;padding:24px;text-align:center;margin-bottom:24px;">
      <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:0.2em;color:rgba(255,255,255,0.7);">Order total</p>
      <p style="margin:10px 0 6px;font-size:40px;font-weight:800;color:#ffffff;letter-spacing:-1px;">$${order.total}</p>
      <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.75);">via ${order.paymentMethod}</p>
    </div>

    <p style="margin:0;font-size:13px;color:#64748b;line-height:1.7;">
      Please complete your payment using the <strong style="color:#94a3b8;">${order.paymentMethod}</strong> details
      provided on the payment page. Once we verify your payment, your order will be shipped.
    </p>`;

  return wrapLayout(content);
}

// ── Payment confirmation email (sent to customer after payment verified) ──────
function buildPaymentConfirmationHtml(order) {
  const content = `
    <p style="margin:0 0 8px;font-size:16px;color:#94a3b8;">Hi ${order.customer.name},</p>
    <h2 style="margin:0 0 24px;font-size:22px;font-weight:700;color:#f1f5f9;">Payment Processed ✅</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#94a3b8;line-height:1.7;">
      <strong style="color:#f1f5f9;">Great news!</strong> Your payment has been processed and confirmed.
      Your order is now being prepared for shipment.
    </p>

    <!-- Amount paid block — matches the screenshot style -->
    <div style="background:linear-gradient(135deg,#166534 0%,#16a34a 100%);border-radius:20px;padding:32px;text-align:center;margin-bottom:28px;">
      <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:0.25em;color:rgba(255,255,255,0.7);">Amount paid</p>
      <p style="margin:12px 0 8px;font-size:48px;font-weight:800;color:#ffffff;letter-spacing:-2px;">$${order.total}</p>
      <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.8);">via ${order.paymentMethod}</p>
    </div>

    <!-- Order reference -->
    <div style="background:#0f172a;border:1px solid #334155;border-radius:16px;padding:20px;margin-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:13px;color:#64748b;">Order number</td>
          <td style="font-size:13px;color:#f1f5f9;font-weight:600;text-align:right;">${order.orderNumber}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#64748b;padding-top:10px;">Payment method</td>
          <td style="font-size:13px;color:#f1f5f9;font-weight:600;text-align:right;padding-top:10px;">${order.paymentMethod}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#64748b;padding-top:10px;">Status</td>
          <td style="padding-top:10px;text-align:right;">
            <span style="background:#166534;color:#86efac;font-size:11px;font-weight:700;padding:4px 12px;border-radius:999px;text-transform:uppercase;letter-spacing:0.1em;">Paid</span>
          </td>
        </tr>
      </table>
    </div>

    <p style="margin:0;font-size:13px;color:#64748b;line-height:1.7;">
      Your order will be shipped within 1–3 business days. You'll receive a tracking number once it's on its way.
      If you have any questions, reply to this email or contact us at
      <a href="mailto:williammakismd1946@outlook.com" style="color:#60a5fa;text-decoration:none;">williammakismd1946@outlook.com</a>.
    </p>`;

  return wrapLayout(content);
}

// ── Admin notification email ──────────────────────────────────────────────────
function buildAdminNotificationHtml(order) {
  const itemList = order.items
    .map(
      (i) =>
        `<li style="color:#cbd5e1;font-size:14px;padding:4px 0;">${i.name} x${i.quantity} — ${i.price}</li>`,
    )
    .join("");

  const content = `
    <h2 style="margin:0 0 20px;font-size:20px;font-weight:700;color:#f1f5f9;">New order received 🛒</h2>

    <div style="background:#0f172a;border:1px solid #334155;border-radius:16px;padding:20px;margin-bottom:20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="font-size:13px;color:#64748b;">Order</td><td style="font-size:13px;color:#f1f5f9;font-weight:600;text-align:right;">${order.orderNumber}</td></tr>
        <tr><td style="font-size:13px;color:#64748b;padding-top:8px;">Customer</td><td style="font-size:13px;color:#f1f5f9;text-align:right;padding-top:8px;">${order.customer.name}</td></tr>
        <tr><td style="font-size:13px;color:#64748b;padding-top:8px;">Email</td><td style="font-size:13px;color:#60a5fa;text-align:right;padding-top:8px;">${order.customer.email}</td></tr>
        <tr><td style="font-size:13px;color:#64748b;padding-top:8px;">Phone</td><td style="font-size:13px;color:#f1f5f9;text-align:right;padding-top:8px;">${order.customer.phone || "—"}</td></tr>
        <tr><td style="font-size:13px;color:#64748b;padding-top:8px;">Payment method</td><td style="font-size:13px;color:#f1f5f9;text-align:right;padding-top:8px;">${order.paymentMethod}</td></tr>
        <tr><td style="font-size:13px;color:#64748b;padding-top:8px;">Total</td><td style="font-size:20px;color:#4ade80;font-weight:700;text-align:right;padding-top:8px;">$${order.total}</td></tr>
      </table>
    </div>

    <p style="margin:0 0 8px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.1em;">Items ordered</p>
    <ul style="margin:0 0 20px;padding-left:20px;">${itemList}</ul>

    <p style="margin:0;font-size:13px;color:#64748b;">
      Log in to the admin dashboard to verify payment and update the order status.
    </p>`;

  return wrapLayout(content);
}

// ── Contact form email ────────────────────────────────────────────────────────
function buildContactEmailHtml({ name, email, subject, message }) {
  const content = `
    <h2 style="margin:0 0 20px;font-size:20px;font-weight:700;color:#f1f5f9;">New contact message 📬</h2>
    <div style="background:#0f172a;border:1px solid #334155;border-radius:16px;padding:20px;margin-bottom:20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="font-size:13px;color:#64748b;">From</td><td style="font-size:13px;color:#f1f5f9;text-align:right;">${name}</td></tr>
        <tr><td style="font-size:13px;color:#64748b;padding-top:8px;">Email</td><td style="font-size:13px;color:#60a5fa;text-align:right;padding-top:8px;">${email}</td></tr>
        <tr><td style="font-size:13px;color:#64748b;padding-top:8px;">Subject</td><td style="font-size:13px;color:#f1f5f9;text-align:right;padding-top:8px;">${subject}</td></tr>
      </table>
    </div>
    <p style="margin:0 0 8px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.1em;">Message</p>
    <div style="background:#0f172a;border:1px solid #334155;border-radius:16px;padding:20px;">
      <p style="margin:0;font-size:14px;color:#cbd5e1;line-height:1.7;white-space:pre-wrap;">${message}</p>
    </div>`;

  return wrapLayout(content);
}

// ── Send helpers ──────────────────────────────────────────────────────────────
async function sendOrderConfirmation(order) {
  await sendViaBrove({
    to: order.customer.email,
    subject: `Order Confirmed — ${order.orderNumber} | Dr William Makis MD`,
    html: buildOrderConfirmationHtml(order),
  });
}

async function sendPaymentConfirmation(order) {
  await sendViaBrove({
    to: order.customer.email,
    subject: `Payment Processed — ${order.orderNumber} | Dr William Makis MD`,
    html: buildPaymentConfirmationHtml(order),
  });
}

async function sendAdminNotification(order) {
  await sendViaBrove({
    to: process.env.ADMIN_EMAIL,
    subject: `New Order ${order.orderNumber} — $${order.total} via ${order.paymentMethod}`,
    html: buildAdminNotificationHtml(order),
  });
}

async function sendContactEmail(data) {
  await sendViaBrove({
    to: process.env.ADMIN_EMAIL,
    subject: `Contact: ${data.subject}`,
    html: buildContactEmailHtml(data),
    replyTo: data.email,
  });
}

module.exports = {
  sendOrderConfirmation,
  sendPaymentConfirmation,
  sendAdminNotification,
  sendContactEmail,
};

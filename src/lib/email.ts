// Use Brove (or any HTTP email proxy) when configured. Fall back to throwing
// helpful errors if not present. This makes the app independent of
// `nodemailer` and uses a simple HTTP POST interface to send messages.

const BROVE_API_URL = process.env.BROVE_API_URL; // e.g. https://api.brove.example/send
const BROVE_API_KEY = process.env.BROVE_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM;

async function sendViaBrove({
  to,
  subject,
  html,
  replyTo,
}: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}) {
  if (!BROVE_API_URL || !BROVE_API_KEY) {
    throw new Error(
      "Brove is not configured. Set BROVE_API_URL and BROVE_API_KEY in your environment.",
    );
  }

  const payload: Record<string, unknown> = {
    from: EMAIL_FROM,
    to,
    subject,
    html,
  };
  if (replyTo) payload.replyTo = replyTo;

  // Brevo (formerly Sendinblue) expects the API key in the `api-key` header
  // and a specific payload shape for the /smtp/email endpoint.
  const brevoPayload: Record<string, unknown> = {
    sender: { email: EMAIL_FROM },
    to: [{ email: to }],
    subject,
    htmlContent: html,
  };
  if (replyTo) brevoPayload.replyTo = { email: replyTo };

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
        `Brove send failed: 401 Unauthorized — token invalid or expired. Verify BROVE_API_KEY in your environment.`,
      );
    }
    throw new Error(`Brove send failed: ${res.status} ${text}`);
  }
}

// ── Shared layout wrapper ─────────────────────────────────────────────────────
function wrapLayout(content: string): string {
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
          <tr>
            <td style="background:linear-gradient(135deg,#1d4ed8 0%,#2563eb 100%);padding:36px 40px;text-align:center;">
              <div style="display:inline-block;width:52px;height:52px;background:rgba(255,255,255,0.15);border-radius:50%;line-height:52px;font-size:18px;font-weight:700;color:#fff;margin-bottom:16px;">WM</div>
              <h1 style="margin:0;font-size:26px;font-weight:700;color:#ffffff;">Dr William Makis MD</h1>
              <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.75);">Pharmacy &amp; Wellness</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="background:#0f172a;padding:24px 40px;text-align:center;border-top:1px solid #334155;">
              <p style="margin:0;font-size:12px;color:#64748b;">© ${new Date().getFullYear()} Dr William Makis MD. All rights reserved.</p>
              <p style="margin:8px 0 0;font-size:12px;color:#64748b;">
                Questions? <a href="mailto:williammakismd1946@outlook.com" style="color:#60a5fa;text-decoration:none;">williammakismd1946@outlook.com</a>
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

// ── Order confirmation ────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildOrderConfirmationHtml(order: any): string {
  const itemRows = order.items
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map(
      (item: any) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #334155;color:#cbd5e1;font-size:14px;">
          ${item.name}${item.packageOption ? ` <span style="color:#94a3b8;font-size:12px;">(${item.packageOption})</span>` : ""}
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #334155;color:#cbd5e1;font-size:14px;text-align:right;">x${item.quantity}</td>
        <td style="padding:12px 0;border-bottom:1px solid #334155;color:#f1f5f9;font-size:14px;text-align:right;font-weight:600;">${item.price}</td>
      </tr>`,
    )
    .join("");

  return wrapLayout(`
    <p style="margin:0 0 8px;font-size:16px;color:#94a3b8;">Hi ${order.customer.name},</p>
    <h2 style="margin:0 0 24px;font-size:22px;font-weight:700;color:#f1f5f9;">Your order is confirmed 🎉</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#94a3b8;line-height:1.7;">
      Thank you for your order. We've received it and will process it shortly.
    </p>
    <div style="background:#0f172a;border:1px solid #334155;border-radius:16px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#64748b;">Order number</p>
      <p style="margin:6px 0 0;font-size:20px;font-weight:700;color:#f1f5f9;">${order.orderNumber}</p>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <thead>
        <tr>
          <th style="padding:8px 0;font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#64748b;text-align:left;border-bottom:1px solid #334155;">Item</th>
          <th style="padding:8px 0;font-size:11px;text-transform:uppercase;color:#64748b;text-align:right;border-bottom:1px solid #334155;">Qty</th>
          <th style="padding:8px 0;font-size:11px;text-transform:uppercase;color:#64748b;text-align:right;border-bottom:1px solid #334155;">Price</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>
    <div style="background:linear-gradient(135deg,#166534 0%,#16a34a 100%);border-radius:16px;padding:24px;text-align:center;margin-bottom:24px;">
      <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:0.2em;color:rgba(255,255,255,0.7);">Order total</p>
      <p style="margin:10px 0 6px;font-size:40px;font-weight:800;color:#ffffff;letter-spacing:-1px;">$${order.total}</p>
      <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.75);">via ${order.paymentMethod}</p>
    </div>
    <p style="margin:0;font-size:13px;color:#64748b;line-height:1.7;">
      Please complete your payment using the <strong style="color:#94a3b8;">${order.paymentMethod}</strong> details provided on the payment page.
    </p>`);
}

// ── Payment confirmation ──────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildPaymentConfirmationHtml(order: any): string {
  return wrapLayout(`
    <p style="margin:0 0 8px;font-size:16px;color:#94a3b8;">Hi ${order.customer.name},</p>
    <h2 style="margin:0 0 24px;font-size:22px;font-weight:700;color:#f1f5f9;">Payment Processed ✅</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#94a3b8;line-height:1.7;">
      <strong style="color:#f1f5f9;">Great news!</strong> Your payment has been confirmed. Your order is being prepared for shipment.
    </p>
    <div style="background:linear-gradient(135deg,#166534 0%,#16a34a 100%);border-radius:20px;padding:32px;text-align:center;margin-bottom:28px;">
      <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:0.25em;color:rgba(255,255,255,0.7);">Amount paid</p>
      <p style="margin:12px 0 8px;font-size:48px;font-weight:800;color:#ffffff;letter-spacing:-2px;">$${order.total}</p>
      <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.8);">via ${order.paymentMethod}</p>
    </div>
    <div style="background:#0f172a;border:1px solid #334155;border-radius:16px;padding:20px;margin-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="font-size:13px;color:#64748b;">Order number</td><td style="font-size:13px;color:#f1f5f9;font-weight:600;text-align:right;">${order.orderNumber}</td></tr>
        <tr><td style="font-size:13px;color:#64748b;padding-top:10px;">Payment method</td><td style="font-size:13px;color:#f1f5f9;font-weight:600;text-align:right;padding-top:10px;">${order.paymentMethod}</td></tr>
        <tr><td style="font-size:13px;color:#64748b;padding-top:10px;">Status</td>
          <td style="padding-top:10px;text-align:right;">
            <span style="background:#166534;color:#86efac;font-size:11px;font-weight:700;padding:4px 12px;border-radius:999px;text-transform:uppercase;">Paid</span>
          </td>
        </tr>
      </table>
    </div>
    <p style="margin:0;font-size:13px;color:#64748b;line-height:1.7;">
      Your order ships within 1–3 business days. Questions? Reply to this email or contact
      <a href="mailto:williammakismd1946@outlook.com" style="color:#60a5fa;text-decoration:none;">williammakismd1946@outlook.com</a>.
    </p>`);
}

// ── Admin notification ────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildAdminNotificationHtml(order: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const itemList = order.items
    .map(
      (i: any) =>
        `<li style="color:#cbd5e1;font-size:14px;padding:4px 0;">${i.name} x${i.quantity} — ${i.price}</li>`,
    )
    .join("");

  return wrapLayout(`
    <h2 style="margin:0 0 20px;font-size:20px;font-weight:700;color:#f1f5f9;">New order received 🛒</h2>
    <div style="background:#0f172a;border:1px solid #334155;border-radius:16px;padding:20px;margin-bottom:20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="font-size:13px;color:#64748b;">Order</td><td style="font-size:13px;color:#f1f5f9;font-weight:600;text-align:right;">${order.orderNumber}</td></tr>
        <tr><td style="font-size:13px;color:#64748b;padding-top:8px;">Customer</td><td style="font-size:13px;color:#f1f5f9;text-align:right;padding-top:8px;">${order.customer.name}</td></tr>
        <tr><td style="font-size:13px;color:#64748b;padding-top:8px;">Email</td><td style="font-size:13px;color:#60a5fa;text-align:right;padding-top:8px;">${order.customer.email}</td></tr>
        <tr><td style="font-size:13px;color:#64748b;padding-top:8px;">Method</td><td style="font-size:13px;color:#f1f5f9;text-align:right;padding-top:8px;">${order.paymentMethod}</td></tr>
        <tr><td style="font-size:13px;color:#64748b;padding-top:8px;">Total</td><td style="font-size:20px;color:#4ade80;font-weight:700;text-align:right;padding-top:8px;">$${order.total}</td></tr>
      </table>
    </div>
    <p style="margin:0 0 8px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.1em;">Items</p>
    <ul style="margin:0 0 20px;padding-left:20px;">${itemList}</ul>
    <p style="margin:0;font-size:13px;color:#64748b;">Log in to the admin dashboard to verify payment and update the order status.</p>`);
}

// ── Contact form ──────────────────────────────────────────────────────────────
function buildContactEmailHtml({
  name,
  email,
  subject,
  message,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): string {
  return wrapLayout(`
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
    </div>`);
}

// ── Exported send functions ───────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sendOrderConfirmation(order: any) {
  await sendViaBrove({
    to: order.customer.email,
    subject: `Order Confirmed — ${order.orderNumber} | Dr William Makis MD`,
    html: buildOrderConfirmationHtml(order),
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sendPaymentConfirmation(order: any) {
  await sendViaBrove({
    to: order.customer.email,
    subject: `Payment Processed — ${order.orderNumber} | Dr William Makis MD`,
    html: buildPaymentConfirmationHtml(order),
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sendAdminNotification(order: any) {
  await sendViaBrove({
    to: process.env.ADMIN_EMAIL as string,
    subject: `New Order ${order.orderNumber} — $${order.total} via ${order.paymentMethod}`,
    html: buildAdminNotificationHtml(order),
  });
}

export async function sendContactEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  await sendViaBrove({
    to: process.env.ADMIN_EMAIL as string,
    subject: `Contact: ${data.subject}`,
    html: buildContactEmailHtml(data),
    replyTo: data.email,
  });
}

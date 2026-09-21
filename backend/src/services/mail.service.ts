import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
  }
  return transporter;
}

type CustomerMail = { to: string; name: string; subject: string; eyebrow: string; title: string; message: string; ctaLabel?: string; ctaUrl?: string; detail?: string };

export async function sendCustomerActivityEmail(input: CustomerMail) {
  const transport = getTransporter();
  if (!transport) { console.info(`[CUSTOMER EMAIL] ${input.to} • ${input.subject}`); return; }
  const action = input.ctaLabel && input.ctaUrl ? `<p style="margin:26px 0"><a href="${escapeHtml(input.ctaUrl)}" style="display:inline-block;background:#0875B5;color:#fff;text-decoration:none;padding:13px 20px;border-radius:12px;font-weight:800">${escapeHtml(input.ctaLabel)}</a></p>` : '';
  const detail = input.detail ? `<div style="margin:20px 0;background:#f0f9ff;border:1px solid #bae6fd;border-radius:16px;padding:16px;color:#075985">${escapeHtml(input.detail)}</div>` : '';
  await transport.sendMail({
    from: env.SMTP_FROM, to: input.to, subject: input.subject,
    text: `Hello ${input.name},\n\n${input.title}\n${input.message}${input.detail ? `\n\n${input.detail}` : ''}${input.ctaUrl ? `\n\n${input.ctaUrl}` : ''}\n\nSweety Birds & Fishes`,
    html: `<div style="margin:0;background:#eefaff;padding:28px 12px;font-family:Arial,sans-serif;color:#032B42"><div style="max-width:620px;margin:auto;background:#fff;border:1px solid #d7eff8;border-radius:24px;overflow:hidden"><div style="padding:24px 28px;background:linear-gradient(135deg,#032B42,#0875B5);color:#fff"><div style="font-size:12px;font-weight:800;letter-spacing:1.4px;color:#8ee7f7;text-transform:uppercase">${escapeHtml(input.eyebrow)}</div><h1 style="font-size:25px;line-height:1.25;margin:8px 0 0">${escapeHtml(input.title)}</h1></div><div style="padding:26px 28px"><p>Hello <b>${escapeHtml(input.name)}</b>,</p><p style="line-height:1.7;color:#475569">${escapeHtml(input.message)}</p>${detail}${action}<p style="font-size:12px;line-height:1.6;color:#64748b;border-top:1px solid #e0f2fe;padding-top:18px">This message was sent automatically after an activity on your Sweety Birds &amp; Fishes account or a seller-published store offer.</p></div></div></div>`,
  });
}

export async function sendOfferAnnouncementEmail(input: { productId: string; productName: string; category: string; regularPrice: number; offerPrice: number; offerEndsAt: Date }) {
  const { prisma } = await import('../config/prisma.js');
  const customers = await prisma.user.findMany({ where: { role: 'CUSTOMER', status: 'ACTIVE', isEmailVerified: true }, select: { email: true, name: true }, take: 5000 });
  const savings = Math.max(0, input.regularPrice - input.offerPrice);
  const categorySuggestion = input.category === 'GUPPY' ? 'A colourful pick for your aquarium collection.' : input.category === 'FISH_FOOD' ? 'A timely nutrition pick for everyday feeding.' : input.category === 'COMBO_PACK' ? 'A convenient value combination worth exploring.' : 'A bulk-value option for aquarium buyers.';
  for (let index = 0; index < customers.length; index += 20) {
    await Promise.allSettled(customers.slice(index, index + 20).map(customer => sendCustomerActivityEmail({ to: customer.email, name: customer.name, subject: `New offer: ${input.productName} at ₹${input.offerPrice}`, eyebrow: 'Fresh aquarium offer', title: `${input.productName} is now on offer`, message: `${categorySuggestion} The seller has published this limited-time offer for registered customers.`, detail: `Offer price ₹${input.offerPrice.toFixed(2)} • Save ₹${savings.toFixed(2)} • Ends ${input.offerEndsAt.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })}`, ctaLabel: 'View current offer', ctaUrl: `${env.FRONTEND_URL}/product/${encodeURIComponent(input.productId)}` })));
  }
}

export async function sendOtpEmail(input: {
  to: string;
  name: string;
  otp: string;
  purpose: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';
}) {
  const subject = input.purpose === 'PASSWORD_RESET'
    ? 'Reset your Sweety Birds & Fishes password'
    : 'Verify your Sweety Birds & Fishes email';
  const purposeText = input.purpose === 'PASSWORD_RESET' ? 'reset your password' : 'verify your email address';
  const transport = getTransporter();

  if (!transport) {
    if (env.NODE_ENV === 'production') {
      throw new Error('SMTP is required in production to send OTP emails');
    }
    console.info(`[DEV OTP] ${input.to} • ${input.purpose} • ${input.otp}`);
    return { developmentOtp: input.otp };
  }

  await transport.sendMail({
    from: env.SMTP_FROM,
    to: input.to,
    subject,
    text: `Hello ${input.name}, your OTP to ${purposeText} is ${input.otp}. It expires in ${env.OTP_TTL_MINUTES} minutes.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px"><h2>Sweety Birds &amp; Fishes</h2><p>Hello ${escapeHtml(input.name)},</p><p>Use this one-time code to ${purposeText}:</p><p style="font-size:30px;font-weight:800;letter-spacing:6px">${input.otp}</p><p>This code expires in ${env.OTP_TTL_MINUTES} minutes. Do not share it with anyone.</p></div>`,
  });
  return {};
}

export async function sendManualPaymentReviewEmail(input: { orderNumber:string; customerName:string; customerEmail:string; customerMobile?:string|null; amount:number; transactionId:string; reviewUrl:string }) {
  const transport=getTransporter();
  if(!transport){console.info(`[PAYMENT REVIEW] ${input.orderNumber} • ${input.customerName} • INR ${input.amount} • ${input.transactionId}`);return;}
  const customerContact=`${input.customerName} • ${input.customerEmail}${input.customerMobile?` • ${input.customerMobile}`:''}`;
  await transport.sendMail({from:env.SMTP_FROM,to:env.BUSINESS_EMAIL,subject:`Payment verification required: ${input.orderNumber}`,text:`Order ID: ${input.orderNumber}\nCustomer: ${customerContact}\nAmount: INR ${input.amount.toFixed(2)}\nTransaction ID: ${input.transactionId}\nAdmin review: ${input.reviewUrl}\n\nThis payment is still pending and must be verified manually.`,html:`<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:28px;color:#032B42"><h2>Payment verification required</h2><p>A customer submitted a manual UPI payment for review.</p><div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:16px;padding:18px"><p><b>Order ID:</b> ${escapeHtml(input.orderNumber)}</p><p><b>Customer:</b> ${escapeHtml(customerContact)}</p><p><b>Amount:</b> ₹${input.amount.toFixed(2)}</p><p><b>Transaction ID:</b> ${escapeHtml(input.transactionId)}</p></div><p style="margin-top:22px"><a href="${escapeHtml(input.reviewUrl)}" style="background:#0875B5;color:white;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:bold">Open seller payment review</a></p><p style="color:#92400e;background:#fffbeb;padding:12px;border-radius:10px">This payment has not been marked successful automatically. Confirm it only after checking your bank or UPI app.</p></div>`});
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char] || char));
}

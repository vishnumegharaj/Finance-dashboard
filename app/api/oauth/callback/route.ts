import { google } from 'googleapis';
import { NextRequest } from 'next/server';
import { Buffer } from 'buffer';

// Check if email looks like a transaction
function isTransactionEmail(body: string): boolean {
  return /(?:₹|Rs\.?)\s?[\d,]+/.test(body) &&
         /(txn|transaction|paid|debited|repayment|credited|ref\.?)/i.test(body);
}

// Extract amount, date, ID, time
function extractTransactionDetails(body: string) {
  const amountMatch = body.match(/(?:₹|Rs\.?)\s?([\d,]+\.\d{1,2}|\d+)/);
  const transactionIdMatch = body.match(/Txn(?:\.|\s)?(?:ID|Id)?[:\s-]*([A-Z0-9]{8,})/i);
  const dateMatch = body.match(/\b(?:\d{1,2}[/-])?(?:\d{1,2}[/-])?\d{2,4}\b/);
  const timeMatch = body.match(/\b\d{1,2}:\d{2}(?:\s?[APap][Mm])?\b/);

  return {
    amount: amountMatch?.[1]?.replace(/,/g, '') ?? null,
    transactionId: transactionIdMatch?.[1] ?? null,
    date: dateMatch?.[0] ?? null,
    time: timeMatch?.[0] ?? null,
  };
}

// Detect PhonePe, Slice, etc.
function detectSource(body: string): string | null {
  const sources = ['PhonePe', 'GPay', 'Google Pay', 'CRED', 'Amazon Pay', 'Paytm', 'Slice', 'Razorpay', 'HDFC', 'ICICI'];
  const lower = body.toLowerCase();
  for (const src of sources) {
    if (lower.includes(src.toLowerCase())) return src;
  }
  return null;
}

// 📦 Decode full email body (prefer text/plain, fallback to text/html and strip tags)
function extractFullBody(payload: any): string {
  const parts = payload.parts || [];
  const textPart = parts.find((p: any) => p.mimeType === 'text/plain');
  if (textPart?.body?.data) {
    return Buffer.from(textPart.body.data, 'base64').toString('utf8');
  }
  // Fallback: try text/html
  const htmlPart = parts.find((p: any) => p.mimeType === 'text/html');
  if (htmlPart?.body?.data) {
    const html = Buffer.from(htmlPart.body.data, 'base64').toString('utf8');
    // Strip HTML tags
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }
  // Fallback: root body
  const data = payload.body?.data;
  if (data) {
    return Buffer.from(data, 'base64').toString('utf8');
  }
  return '';
}

// List of trusted senders (add your banks/payment apps here)
const TRUSTED_SENDERS = [
  'alerts@kotak.com',
  'no-reply@kotak.com',
  'no-reply@paytm.com',
  'noreply@phonepe.com',
  // Add more as needed
];

// Negative keywords/phrases to filter out non-transactional emails
const NEGATIVE_KEYWORDS = [
  'will be debited',
  'scheduled',
  'reminder',
  'autopay',
  'upcoming',
  'due',
  'setup',
  'initiated',
  'pending',
  'will be processed',
  'will be credited',
  'will be paid',
  'will be received',
];

// Helper to check if a string contains any negative keyword
function containsNegativeKeyword(text: string): boolean {
  return NEGATIVE_KEYWORDS.some(kw => text.toLowerCase().includes(kw));
}

// Helper to check if a date is within the last month (and not more than 1 day in the future)
function isValidDate(date: Date): boolean {
  const now = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(now.getMonth() - 1);
  const oneDayAhead = new Date(now);
  oneDayAhead.setDate(now.getDate() + 1);
  return date >= oneMonthAgo && date <= oneDayAhead;
}

// Helper to parse various date formats
function parseDateFromBody(body: string): Date | null {
  // Numeric date (dd/mm/yyyy, dd-mm-yyyy, etc.)
  const numericDateMatch = body.match(/\b(\d{1,2}[/-])?(\d{1,2}[/-])?\d{2,4}\b/);
  if (numericDateMatch?.[0]) {
    const parsed = new Date(numericDateMatch[0]);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  // Format: 'Jul 12, 2025'
  const mmmDateMatch = body.match(/([A-Za-z]{3,9})\s+(\d{1,2}),\s*(\d{4})/);
  if (mmmDateMatch) {
    const parsed = new Date(mmmDateMatch[0]);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  // Format: 'Fri, Jul 18' (use current year)
  const dddMmmDateMatch = body.match(/([A-Za-z]{3}),\s*([A-Za-z]{3,9})\s+(\d{1,2})/);
  if (dddMmmDateMatch) {
    const year = new Date().getFullYear();
    const parsed = new Date(`${dddMmmDateMatch[2]} ${dddMmmDateMatch[3]}, ${year}`);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return null;
}

// Stricter transaction detection
function isValidTransactionEmail(from: string, subject: string, body: string): boolean {
  // Only allow trusted senders
  const isTrusted = TRUSTED_SENDERS.some(sender => from.toLowerCase().includes(sender));
  if (!isTrusted) return false;

  // Must contain transaction keywords and an amount
  const hasAmount = /(?:₹|Rs\.?|INR)[\s]?([\d,]+\.?\d{0,2})/i.test(body);
  const hasTxnKeyword = /(debited|credited|transaction|txn|purchase|spent|received|paid|payment|successful)/i.test(body + subject);

  // Exclude reminders, scheduled, autopay, etc.
  if (containsNegativeKeyword(body + subject)) return false;

  return hasAmount && hasTxnKeyword;
}

// Extract transaction details for DB
function extractTransactionForDB(from: string, subject: string, body: string, emailDateStr: string) {
  // Amount
  const amountMatch = body.match(/(?:₹|Rs\.?|INR)[\s]?([\d,]+\.?\d{0,2})/i);
  const amount = amountMatch?.[1]?.replace(/,/g, '') ?? null;

  // Type
  let type: 'INCOME' | 'EXPENSE' = 'EXPENSE';
  if (/credited|received/i.test(body + subject)) type = 'INCOME';
  if (/debited|spent|purchase|paid|payment/i.test(body + subject)) type = 'EXPENSE';

  // Date: try to extract from body, else use email header date
  let date: Date | null = null;
  const parsedBodyDate = parseDateFromBody(body);
  if (parsedBodyDate && isValidDate(parsedBodyDate)) {
    date = parsedBodyDate;
  } else if (emailDateStr) {
    const parsedHeaderDate = new Date(emailDateStr);
    if (isValidDate(parsedHeaderDate)) {
      date = parsedHeaderDate;
    }
  }
  if (!date) return null;

  // Description (first line or subject)
  const description = subject || body.split('\n')[0];

  if (!amount) return null; // Must have amount

  return {
    amount: parseFloat(amount),
    type,
    date: date.toISOString(),
    description,
    // Add more fields as needed for your DB
  };
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  if (!code) return new Response('Missing code', { status: 400 });

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GOOGLE_REDIRECT_URI!
  );

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  // Calculate 1 month ago in YYYY/MM/DD
  const today = new Date();
  const lastMonth = new Date();
  lastMonth.setMonth(today.getMonth() - 1);
  const after = `${lastMonth.getFullYear()}/${lastMonth.getMonth() + 1}/${lastMonth.getDate()}`;

  // Query for transaction-like emails from the past month
  const query = `after:${after} subject:Payment OR subject:Transaction OR PhonePe OR Slice OR Paid OR Debit`;

  const messagesList = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults: 50,
  });

  const messages = messagesList.data.messages || [];
  const results = [];

  for (const msg of messages) {
    const full = await gmail.users.messages.get({ userId: 'me', id: msg.id! });
    const payload = full.data.payload!;
    const body = extractFullBody(payload);

    const from = payload.headers?.find((h: any) => h.name === 'From')?.value || '';
    const subject = payload.headers?.find((h: any) => h.name === 'Subject')?.value || '';
    const emailDateStr = payload.headers?.find((h: any) => h.name === 'Date')?.value || '';

    if (!isValidTransactionEmail(from, subject, body)) continue;

    const txn = extractTransactionForDB(from, subject, body, emailDateStr);
    if (txn) results.push(txn);
  }

  // Return as JSON for direct DB insertion
  return new Response(JSON.stringify(results, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
}

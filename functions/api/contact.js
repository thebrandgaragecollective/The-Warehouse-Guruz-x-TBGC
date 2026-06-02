const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const MAX_CONCURRENT_REQUESTS = 20;

const rateBuckets = new Map();
let activeRequests = 0;

export async function onRequestPost(context) {
  if (activeRequests >= MAX_CONCURRENT_REQUESTS) {
    return jsonResponse({ result: "error", message: "The form is busy. Please try again in a moment." }, 429);
  }

  activeRequests += 1;

  try {
    const webhookUrl = context.env.GOOGLE_APPS_SCRIPT_WEBHOOK_URL;
    const sharedSecret = context.env.GOOGLE_APPS_SCRIPT_SHARED_SECRET;

    if (!webhookUrl || !sharedSecret) {
      return jsonResponse({ result: "error", message: "Form backend is not configured." }, 500);
    }

    const payload = normalizePayload(await parseBody(context.request));
    validatePayload(payload);

    const clientIp = getClientIp(context.request);
    enforceRateLimit(clientIp);

    const upstreamBody = new URLSearchParams({
      ...payload,
      clientIp,
      secret: sharedSecret
    });

    const upstreamResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: upstreamBody
    });

    const upstreamText = await upstreamResponse.text();
    let upstreamResult = {};
    try {
      upstreamResult = JSON.parse(upstreamText);
    } catch {
      throw new Error("Apps Script did not return JSON. Check the deployed Web App URL and access permissions.");
    }

    if (!upstreamResponse.ok) {
      throw new Error(upstreamResult.message || `Apps Script returned status ${upstreamResponse.status}.`);
    }

    if (upstreamResult.result !== "success") {
      return jsonResponse({
        result: "error",
        message: upstreamResult.message || "Form submission was rejected."
      }, 400);
    }

    console.log(
      `Lead saved by Apps Script: spreadsheet="${upstreamResult.spreadsheetName || "unknown"}", ` +
        `sheet="${upstreamResult.sheetName || "unknown"}", row="${upstreamResult.rowNumber || "unknown"}"`
    );

    return jsonResponse({ result: "success", message: "Lead captured successfully." });
  } catch (error) {
    return jsonResponse({ result: "error", message: error.message || "Something went wrong." }, 400);
  } finally {
    activeRequests = Math.max(0, activeRequests - 1);
  }
}

export function onRequest() {
  return jsonResponse({ result: "error", message: "Method not allowed." }, 405);
}

async function parseBody(request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return request.json();
  }

  return Object.fromEntries(await request.formData());
}

function normalizePayload(payload) {
  return {
    fullName: clean(payload.fullName),
    companyName: clean(payload.companyName),
    phoneNumber: clean(payload.phoneNumber),
    emailAddress: clean(payload.emailAddress),
    service: clean(payload.service),
    message: clean(payload.message),
    website: clean(payload.website),
    sourcePage: clean(payload.sourcePage),
    userAgent: clean(payload.userAgent),
    clientKey: clean(payload.clientKey),
    submissionId: clean(payload.submissionId)
  };
}

function validatePayload(payload) {
  if (payload.website) throw new Error("Spam submission rejected.");
  if (!payload.fullName) throw new Error("Full name is required.");
  if (!payload.companyName) throw new Error("Organisation name is required.");
  if (!payload.phoneNumber) throw new Error("Phone number is required.");
  if (!payload.emailAddress) throw new Error("Email address is required.");
  if (!payload.service) throw new Error("Service interested in is required.");
  if (!payload.message) throw new Error("Message is required.");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.emailAddress)) {
    throw new Error("A valid email address is required.");
  }
}

function getClientIp(request) {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function enforceRateLimit(clientIp) {
  const identity = clientIp || "unknown";
  const now = Date.now();
  const currentBucket = rateBuckets.get(identity) || [];
  const recentHits = currentBucket.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);

  if (recentHits.length >= RATE_LIMIT_MAX) {
    throw new Error("Too many submissions. Please try again later.");
  }

  recentHits.push(now);
  rateBuckets.set(identity, recentHits);
}

function clean(value) {
  return String(value == null ? "" : value).trim().slice(0, 5000);
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

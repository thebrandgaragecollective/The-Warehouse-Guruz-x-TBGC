var CONFIG = {
  SHEET_NAME: "Website Leads",
  CLIENT_EMAIL: "deepak@thewarehouseguruz.com",
  SHEET_VIEW_URL: "", // Optional: paste the Google Sheet URL here for the email button.
  SHARED_SECRET: "", // Required: set the same value as GOOGLE_APPS_SCRIPT_SHARED_SECRET on the Cloudflare Pages Function.
  RATE_LIMIT_MAX: 5,
  RATE_LIMIT_WINDOW_SECONDS: 60 * 60,
  MAX_CONCURRENT_REQUESTS: 20,
  HEADERS: [
    "Timestamp",
    "Full Name",
    "Company Name",
    "Phone Number",
    "Email Address",
    "Service Interested In",
    "Message / Requirement",
    "Source Page",
    "User Agent",
    "Client IP",
    "Client Key",
    "Submission ID"
  ]
};

function doPost(e) {
  var activeRequestKey = "active_request_count";
  var activeCountIncremented = false;

  try {
    enforceConcurrencyLimit_(activeRequestKey);
    activeCountIncremented = true;

    var payload = parsePayload_(e);
    validateSharedSecret_(payload);
    validateHoneypot_(payload);

    var lead = normalizeLead_(payload);
    validateLead_(lead);
    enforceRateLimit_(lead.clientIp, lead.clientKey);

    var sheet = getLeadSheet_();
    ensureHeaders_(sheet);
    sheet.appendRow([
      lead.timestamp,
      lead.fullName,
      lead.companyName,
      lead.phoneNumber,
      lead.emailAddress,
      lead.service,
      lead.message,
      lead.sourcePage,
      lead.userAgent,
      lead.clientIp,
      lead.clientKey,
      lead.submissionId
    ]);
    SpreadsheetApp.flush();

    var appendedRow = sheet.getLastRow();

    sendLeadEmail_(lead);

    return jsonResponse_({
      result: "success",
      message: "Lead captured successfully.",
      spreadsheetName: SpreadsheetApp.getActiveSpreadsheet().getName(),
      sheetName: sheet.getName(),
      rowNumber: appendedRow
    });
  } catch (error) {
    return jsonResponse_({
      result: "error",
      message: error.message || String(error)
    });
  } finally {
    if (activeCountIncremented) {
      decrementActiveRequests_(activeRequestKey);
    }
  }
}

function doGet() {
  return jsonResponse_({
    result: "ok",
    message: "The Warehouse Guruz lead webhook is running."
  });
}

function resetTestingLimits() {
  CacheService.getScriptCache().remove("active_request_count");
  Logger.log("Active request counter cleared. Per-identity rate limits expire automatically after one hour.");
}

function parsePayload_(e) {
  var payload = {};

  if (e && e.parameter) {
    Object.keys(e.parameter).forEach(function (key) {
      payload[key] = e.parameter[key];
    });
  }

  if (e && e.postData && e.postData.contents) {
    var contentType = String(e.postData.type || "").toLowerCase();
    if (contentType.indexOf("application/json") !== -1) {
      var parsed = JSON.parse(e.postData.contents);
      Object.keys(parsed).forEach(function (key) {
        payload[key] = parsed[key];
      });
    }
  }

  return payload;
}

function normalizeLead_(payload) {
  return {
    timestamp: new Date(),
    fullName: clean_(payload.fullName || payload.full_name),
    companyName: clean_(payload.companyName || payload.company_name),
    phoneNumber: clean_(payload.phoneNumber || payload.phone_number),
    emailAddress: clean_(payload.emailAddress || payload.email),
    service: clean_(payload.service || payload.serviceType || payload.service_type),
    message: clean_(payload.message),
    sourcePage: clean_(payload.sourcePage || payload.source_page),
    userAgent: clean_(payload.userAgent || payload.user_agent),
    clientIp: clean_(payload.clientIp || payload.client_ip || "unknown"),
    clientKey: clean_(payload.clientKey || payload.client_key || ""),
    submissionId: clean_(payload.submissionId || payload.submission_id || Utilities.getUuid())
  };
}

function validateLead_(lead) {
  if (!lead.fullName) throw new Error("Full name is required.");
  if (!lead.companyName) throw new Error("Organisation name is required.");
  if (!lead.phoneNumber) throw new Error("Phone number is required.");
  if (!lead.emailAddress) throw new Error("Email address is required.");
  if (!lead.service) throw new Error("Service interested in is required.");
  if (!lead.message) throw new Error("Message is required.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.emailAddress)) {
    throw new Error("A valid email address is required.");
  }
}

function validateSharedSecret_(payload) {
  if (!CONFIG.SHARED_SECRET) {
    throw new Error("Apps Script shared secret is not configured.");
  }

  var submittedSecret = clean_(payload.secret || payload.formSecret || payload.form_secret);
  if (submittedSecret !== CONFIG.SHARED_SECRET) {
    throw new Error("Unauthorized request.");
  }
}

function validateHoneypot_(payload) {
  if (clean_(payload.website || payload.company_website)) {
    throw new Error("Spam submission rejected.");
  }
}

function getLeadSheet_() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(CONFIG.SHEET_NAME);
  }
  return sheet;
}

function ensureHeaders_(sheet) {
  var existing = sheet.getRange(1, 1, 1, CONFIG.HEADERS.length).getValues()[0];
  var needsHeaders = existing.every(function (cell) {
    return !cell;
  });

  if (needsHeaders) {
    sheet.getRange(1, 1, 1, CONFIG.HEADERS.length).setValues([CONFIG.HEADERS]);
    sheet.setFrozenRows(1);
  }
}

function sendLeadEmail_(lead) {
  var sheetUrl = CONFIG.SHEET_VIEW_URL || SpreadsheetApp.getActiveSpreadsheet().getUrl();
  var subject = "New Website Lead: " + lead.service + " inquiry from " + lead.fullName;
  var plainBody =
    "You have received a new inquiry from The Warehouse Guruz website.\n\n" +
    "Submitted At: " + lead.timestamp + "\n" +
    "Full Name: " + lead.fullName + "\n" +
    "Company Name: " + (lead.companyName || "-") + "\n" +
    "Phone Number: " + lead.phoneNumber + "\n" +
    "Email Address: " + lead.emailAddress + "\n" +
    "Service Interested In: " + lead.service + "\n" +
    "Message / Requirement:\n" + lead.message + "\n\n" +
    "View the Google Sheet: " + sheetUrl;

  var htmlBody =
    '<div style="font-family:Arial,sans-serif;color:#1b1c1c;line-height:1.5">' +
    '<h2 style="color:#04162e">New Website Lead</h2>' +
    '<p>You have received a new inquiry from The Warehouse Guruz website.</p>' +
    '<table cellpadding="8" cellspacing="0" style="border-collapse:collapse;border:1px solid #d9d9d9">' +
    emailRow_("Submitted At", lead.timestamp) +
    emailRow_("Full Name", lead.fullName) +
    emailRow_("Company Name", lead.companyName || "-") +
    emailRow_("Phone Number", lead.phoneNumber) +
    emailRow_("Email Address", lead.emailAddress) +
    emailRow_("Service Interested In", lead.service) +
    emailRow_("Message / Requirement", lead.message) +
    '</table>' +
    '<p style="margin-top:20px"><a href="' + escapeHtml_(sheetUrl) + '" style="background:#04162e;color:#ffffff;padding:12px 18px;text-decoration:none;font-weight:bold;display:inline-block">View Google Sheet</a></p>' +
    '</div>';

  MailApp.sendEmail({
    to: CONFIG.CLIENT_EMAIL,
    subject: subject,
    body: plainBody,
    htmlBody: htmlBody
  });
}

function emailRow_(label, value) {
  return (
    '<tr>' +
    '<td style="border:1px solid #d9d9d9;background:#f5f3f3;font-weight:bold">' + escapeHtml_(label) + '</td>' +
    '<td style="border:1px solid #d9d9d9">' + escapeHtml_(String(value || "")) + '</td>' +
    '</tr>'
  );
}

function enforceRateLimit_(clientIp, clientKey) {
  // Google Apps Script web apps do not reliably expose visitor IPs, so use IP
  // only when a trusted proxy supplies it and otherwise fall back to clientKey.
  var identity = clientIp && clientIp !== "unknown" ? clientIp : clientKey;
  if (!identity) {
    throw new Error("Missing rate-limit identity.");
  }

  var key = "rate_" + Utilities.base64EncodeWebSafe(identity);
  var lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    var cache = CacheService.getScriptCache();
    var currentCount = Number(cache.get(key) || "0");
    if (currentCount >= CONFIG.RATE_LIMIT_MAX) {
      throw new Error("Too many submissions. Please try again later.");
    }
    cache.put(key, String(currentCount + 1), CONFIG.RATE_LIMIT_WINDOW_SECONDS);
  } finally {
    lock.releaseLock();
  }
}

function enforceConcurrencyLimit_(activeRequestKey) {
  var lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    var cache = CacheService.getScriptCache();
    var activeCount = Number(cache.get(activeRequestKey) || "0");
    if (activeCount >= CONFIG.MAX_CONCURRENT_REQUESTS) {
      throw new Error("The form is busy. Please try again in a moment.");
    }
    cache.put(activeRequestKey, String(activeCount + 1), 120);
  } finally {
    lock.releaseLock();
  }
}

function decrementActiveRequests_(activeRequestKey) {
  var lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    var cache = CacheService.getScriptCache();
    var activeCount = Math.max(0, Number(cache.get(activeRequestKey) || "0") - 1);
    cache.put(activeRequestKey, String(activeCount), 120);
  } finally {
    lock.releaseLock();
  }
}

function clean_(value) {
  return String(value == null ? "" : value).trim().slice(0, 5000);
}

function escapeHtml_(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function jsonResponse_(object) {
  return ContentService
    .createTextOutput(JSON.stringify(object))
    .setMimeType(ContentService.MimeType.JSON);
}

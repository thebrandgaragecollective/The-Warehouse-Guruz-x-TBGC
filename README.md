# The Warehouse Guruz x TBGC Website

Static, mobile-first brochure website for The Warehouse Guruz, built by The Brand Garage Collective.

## Pages

- `index.html` - Home page with hero, about-style relationship section, service previews, and CTA links.
- `services.html` - Service detail page with anchored sections for each service.
- `contact.html` - Contact page with office information, Google Maps embed, WhatsApp CTA, and lead inquiry form.

## Working Features

- Mobile-first responsive layout for high mobile traffic.
- Shared header, footer, navigation, active page state, and floating WhatsApp button.
- WhatsApp CTA uses the client mobile number through `wa.me/919374032161`.
- Local image assets and logo assets, no external placeholder images.
- Social links for Instagram, Facebook, and LinkedIn.
- Contact page Google Maps embed.
- Accessible contact form labels, required fields, validation, honeypot field, and inline status messages.
- Thank-you message after successful form submission.
- Browser-side local testing bypass for form rate-limit checks on `localhost` and `127.0.0.1`.
- Production-oriented security headers through `_headers`.
- Cache-busted favicon setup.

## Lead Form Backend

The contact form posts to:

```txt
/api/contact
```

On Cloudflare Pages, this route is handled by:

```txt
functions/api/contact.js
```

The Cloudflare Pages Function validates the form, applies rate limiting, reads secret values from Cloudflare environment variables, and forwards the lead to a Google Apps Script webhook.

Required Cloudflare environment variables:

```txt
GOOGLE_APPS_SCRIPT_WEBHOOK_URL
GOOGLE_APPS_SCRIPT_SHARED_SECRET
```

The real values must not be committed to Git.

## Google Apps Script

The ready-to-paste Apps Script is:

```txt
google-apps-script-webhook.gs
```

It handles:

- Shared-secret validation.
- Honeypot spam rejection.
- Required field validation.
- Per-identity rate limiting.
- Concurrent request limiting.
- Automatic `Website Leads` sheet tab creation.
- Automatic header creation.
- Backend timestamp capture.
- Google Sheet row append.
- Email notification to the client.
- "View Google Sheet" email CTA.

Deployment settings:

```txt
Execute as: Me
Who has access: Anyone
```

The Apps Script `CONFIG.SHARED_SECRET` must match Cloudflare's `GOOGLE_APPS_SCRIPT_SHARED_SECRET`.

## Local Testing

Create a local `.dev.vars` file using `.dev.vars.example` as a template:

```txt
GOOGLE_APPS_SCRIPT_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_DEPLOYED_WEB_APP_ID/exec
GOOGLE_APPS_SCRIPT_SHARED_SECRET=replace-with-a-long-random-secret
```

Then run:

```powershell
npx wrangler pages dev .
```

Wrangler serves the site locally and loads `.dev.vars` for the Cloudflare Pages Function.

## Production Deployment

Recommended deployment target:

```txt
Cloudflare Pages
```

Build settings:

```txt
Framework preset: None
Build command: leave blank
Build output directory: /
```

If Cloudflare does not accept `/`, use:

```txt
.
```

After deployment, add the production environment variables in the Cloudflare Pages dashboard and submit one live test lead.

## Private Files

These files/folders are intentionally ignored:

- `.dev.vars`
- `.wrangler/`
- `.DS_Store`
- `Thumbs.db`

Do not commit secrets, Apps Script deployment URLs, or local Cloudflare state.

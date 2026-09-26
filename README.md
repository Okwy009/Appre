# Appre

A static, multi-page marketing site for Appre, a resume and job-application
service. Seven real routes (not one long scroll), a working client-side
gap-check tool, and a contact form ready to wire up to a real backend.

No build step, no framework, no backend required to deploy. One optional
serverless function is included for anyone who wants to self-host form
handling instead of using a third-party form service.

## Structure

```
index.html            Home
how-it-works.html      Process, step by step
case-studies.html      Filterable before/after examples
pricing.html            Package comparison table + referral program
tool.html               Interactive gap-check wizard
about.html               Credibility + honesty commitment
contact.html             Contact form

css/styles.css          Shared design system
js/main.js               Mobile nav toggle (shared)
js/gapcheck.js            Gap-check tool logic (dictionary + rule-based matching)
js/case-studies.js        Case study data + filter/render logic
js/contact.js             Contact form submit handling

api/contact.js           Optional Vercel serverless function (self-hosted form backend)
vercel.json               Deployment config (clean URLs, basic security headers)
```

Every page is a real, separate HTML file — this is a genuine multi-page
site with real URLs (`/how-it-works`, `/pricing`, etc. once deployed with
`cleanUrls`), not client-side-only routing faking separate pages.

## Deploying to Vercel

1. Push this folder to a Git repository (GitHub, GitLab, or Bitbucket).
2. In Vercel, "Add New Project" → import the repo. No framework preset is
   needed — Vercel will detect it as a static site with one API route.
3. Deploy. That's it; there's no build command to configure.

You can also deploy directly from this folder with the Vercel CLI:

```
npm i -g vercel
vercel
```

## Wiring the contact form to a real backend

The form in `contact.html` currently points at a placeholder Formspree URL
(`https://formspree.io/f/your-form-id`). Two supported options:

**Option A — Formspree (or any similar hosted form service)**
1. Create a form at [formspree.io](https://formspree.io) (or Basin, Getform,
   etc.) and copy its endpoint URL.
2. In `contact.html`, replace `your-form-id` in both the `action` and
   `data-endpoint` attributes of `#contact-form` with your real endpoint.
3. Done — `js/contact.js` already posts to whatever URL is in
   `data-endpoint` and shows inline success/error states.

**Option B — the included Vercel serverless function**
1. In `contact.html`, change `action` and `data-endpoint` on `#contact-form`
   to `/api/contact`.
2. Open `api/contact.js` and fill in the `TODO` section with real delivery —
   an email API (Resend, Postmark, SendGrid), a database write, or a CRM
   webhook. The function already validates required fields and drops
   honeypot spam submissions; it just doesn't send anywhere until you add
   that call.
3. Add any provider API key as an environment variable in the Vercel
   project settings — never hard-code a key in the file.

If JavaScript fails to load for any reason, the form still submits as a
plain HTML POST to whatever `action` is set, so it degrades gracefully.

## The gap-check tool

`js/gapcheck.js` is a self-contained, dependency-free, rule-based matcher:
a phrase dictionary spanning multiple industries, an acronym scanner, and
simple "required" vs. "preferred" sentence classification based on marker
words in the posting. It runs entirely in the visitor's browser — nothing
they paste is sent to a server. To extend the dictionary, edit the
`DICTIONARY` object at the top of the file; categories and terms are added
the same way.

## Content notes

- Case study data in `js/case-studies.js` is labeled on the page as
  illustrative/composite examples, not verified individual client
  outcomes — the page's disclosure banner explains why, and that
  framing should stay intact if you edit the copy.
- Pricing and referral terms are written as real, current terms rather
  than promotional estimates; keep them in sync with whatever your actual
  policy is if you reuse this template for a live business.

## Local preview

Any static file server works, e.g.:

```
npx serve .
```

or

```
python3 -m http.server 8000
```

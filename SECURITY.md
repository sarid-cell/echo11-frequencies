# Security Policy

## What echo.11 Is

echo.11 is a client-side web application. It has no user accounts, no passwords, and stores data only in the browser's `localStorage`. The only server-side component is a Vercel Edge Function that proxies AI analysis requests.

## Supported Versions

There are no numbered releases. Only the live version at **echo11.space** is actively maintained.

| Version | Supported |
| ------- | --------- |
| Live (echo11.space) | ✅ |
| Previous deployments | ❌ |

## Scope

**In scope:**
- The web app at echo11.space
- The Edge Function at `/api/ai-analysis`
- Client-side vulnerabilities (XSS, sensitive data exposure via localStorage)

**Out of scope:**
- Ko-fi payment processing (managed by Ko-fi)
- Google Analytics (managed by Google)
- Vulnerabilities requiring physical device access

## What We Store

- `localStorage` only — session history, streak count, user preferences, supporter status
- No passwords, no payment data, no personal identifiers are sent to our servers

## Reporting a Vulnerability

Please report security issues **privately** — do not open a public GitHub issue.

**Email:** hello@echo11.space

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact

We aim to respond within **48 hours** and resolve confirmed issues within **7 days**.

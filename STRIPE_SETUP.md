# Stripe Tip Jar — Setup

The Tip Jar in `/profile` uses Stripe Checkout via two Vercel Serverless Functions:

- `POST /api/create-checkout-session` — creates a Checkout Session and returns its URL
- `POST /api/stripe-webhook` — receives Stripe events for audit logging

The frontend never sees a Stripe key. Everything stays server-side.

---

## 1. One-time Stripe setup

1. Sign in at **https://dashboard.stripe.com**
2. **Activate your account** (Business → Activate) so you can receive real payments. While testing you can stay in test mode.
3. From the top-right toggle, decide whether you want this PR to go live (`Live mode`) or stay in `Test mode` first. Recommended: deploy to test first, do one real $3 tip to yourself, then flip to live.

### Get the API keys
1. **Developers → API keys**
2. Copy **Secret key** (`sk_test_...` or `sk_live_...`). You only need the *secret* — the publishable key isn't used by this integration.

### Create the webhook endpoint
1. **Developers → Webhooks → Add endpoint**
2. Endpoint URL: `https://echo11.space/api/stripe-webhook`
3. Events to send: `checkout.session.completed` (just that one)
4. After creating, click into the endpoint and copy the **Signing secret** (starts `whsec_...`).

---

## 2. One-time Vercel setup

1. Go to your echo.11 project at **https://vercel.com/dashboard**
2. **Settings → Environment Variables → Add new**
3. Add both, scoped to **Production, Preview, Development**:

| Name                    | Value                                |
|-------------------------|--------------------------------------|
| `STRIPE_SECRET_KEY`     | `sk_live_...` (or `sk_test_...`)     |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` from the webhook page    |

4. **Redeploy** the latest commit so the new env vars apply.

---

## 3. Smoke test

In Stripe **Test mode** (toggle, top-right):

1. Open https://echo11.space (or your preview URL) → Profile → tap **$3**
2. You're redirected to Stripe Checkout
3. Use Stripe's test card: `4242 4242 4242 4242`, any future expiry, any CVC, any ZIP
4. You should land back on echo.11 with a thank-you toast: "Thank you. $3 received…"
5. **In Vercel**: Logs → confirm a line like `[tip] USD 3 — echo_session=abc123 stripe_session=cs_test_...`
6. **In GA4**: Realtime → confirm `tip_clicked` (when you tapped) then `tip_success` (when you returned)

If steps 5 or 6 fail, check Vercel function logs — the webhook signature verification is the most common point of failure (means the `STRIPE_WEBHOOK_SECRET` doesn't match the endpoint you registered).

---

## 4. Going live

Once the test flow works end-to-end:

1. Flip the Stripe toggle to **Live mode**
2. **Developers → API keys** — copy the `sk_live_...` key
3. **Developers → Webhooks** — create a *separate* webhook endpoint for live mode (same URL, same event), copy its `whsec_...`
4. Update both env vars in Vercel → redeploy
5. Do one real $3 tip to yourself with a real card to confirm

---

## What's tracked in GA4

| Event           | Fires when                                | Params                                                |
|-----------------|-------------------------------------------|-------------------------------------------------------|
| `tip_clicked`   | User taps a tip amount in Profile         | `value` (USD), `currency=USD`, `is_bot`, `session_id` |
| `tip_success`   | Stripe redirects back with `?tip=success` | `value` (USD), `currency=USD`, `session_id`           |
| `tip_cancelled` | User abandoned Checkout                   | `is_bot`, `session_id`                                |
| `tip_error`     | `/api/create-checkout-session` failed     | `event_label` = error message                         |

Conversion rate = `tip_success / tip_clicked`. Refund/dispute handling: stays inside Stripe Dashboard, no app-side logic.

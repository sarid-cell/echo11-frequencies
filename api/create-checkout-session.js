// Vercel Serverless Function — creates a Stripe Checkout Session for a tip.
// Called from the Profile → Tip Jar UI.
//
// Required env vars (set in Vercel project settings):
//   STRIPE_SECRET_KEY  — sk_live_... (or sk_test_... in preview)
//
// Allowed tip amounts (USD): 3, 7, 14. Anything else → 400.

const Stripe = require('stripe')

const ALLOWED_TIPS = {
  3:  { cents: 300,  label: '$3 tip — a small thank-you' },
  7:  { cents: 700,  label: '$7 tip — covers a week of listeners' },
  14: { cents: 1400, label: '$14 tip — keeps echo.11 free' },
}

module.exports = async function handler(req, res){
  // Vercel Functions don't auto-set CORS — explicit allow for same-origin
  res.setHeader('Cache-Control', 'no-store')

  if(req.method !== 'POST'){
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const secret = process.env.STRIPE_SECRET_KEY
  if(!secret){
    console.error('[stripe] STRIPE_SECRET_KEY missing in env')
    return res.status(500).json({ error: 'Server misconfigured' })
  }

  // Body might arrive as object (Vercel parses JSON) or as raw string
  let body = req.body
  if(typeof body === 'string'){ try{ body = JSON.parse(body) }catch(e){ body = {} } }
  const amount = Number(body && body.amount)
  const tip = ALLOWED_TIPS[amount]
  if(!tip){
    return res.status(400).json({ error: 'Invalid amount. Allowed: 3, 7, 14.' })
  }

  const origin = (req.headers.origin || `https://${req.headers.host}` || 'https://echo11.space').replace(/\/$/, '')

  try{
    const stripe = new Stripe(secret, { apiVersion: '2024-11-20.acacia' })
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: tip.label,
            description: 'Thank you for keeping echo.11 free for everyone.',
          },
          unit_amount: tip.cents,
        },
        quantity: 1,
      }],
      // Echo Session ID propagates to webhook + GA so we can correlate
      client_reference_id: (body && body.sessionId) || undefined,
      metadata: {
        echo_amount_usd: String(amount),
        echo_session_id: (body && body.sessionId) || '',
      },
      submit_type: 'donate',
      success_url: `${origin}/?tip=success&amount=${amount}`,
      cancel_url:  `${origin}/?tip=cancelled`,
      // Optional but kind: lets Stripe show a thank-you message
      custom_text: {
        submit: { message: 'echo.11 stays free for everyone because of tips like yours. 🌙' },
      },
    })
    return res.status(200).json({ url: session.url, id: session.id })
  }catch(err){
    console.error('[stripe] checkout.sessions.create failed:', err.message)
    return res.status(500).json({ error: 'Could not create checkout session' })
  }
}

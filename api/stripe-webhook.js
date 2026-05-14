// Vercel Serverless Function — Stripe webhook receiver.
// Logs successful tip payments so you have an audit trail in Vercel logs
// even if the user closes the browser before redirect.
//
// Required env vars:
//   STRIPE_SECRET_KEY      — sk_live_... / sk_test_...
//   STRIPE_WEBHOOK_SECRET  — whsec_... (from Stripe Dashboard → Webhooks)
//
// In Stripe Dashboard → Webhooks → Add endpoint:
//   URL:    https://echo11.space/api/stripe-webhook
//   Events: checkout.session.completed
//
// Vercel requires the raw body for signature verification, so we disable
// the default JSON body parser below.

const Stripe = require('stripe')

function readRawBody(req){
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', c => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

async function handler(req, res){
  if(req.method !== 'POST'){
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method not allowed')
  }

  const secret = process.env.STRIPE_SECRET_KEY
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET
  if(!secret || !whSecret){
    console.error('[stripe-webhook] missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET')
    return res.status(500).end('Server misconfigured')
  }

  const stripe = new Stripe(secret, { apiVersion: '2024-11-20.acacia' })
  const sig = req.headers['stripe-signature']
  let event

  try{
    const raw = await readRawBody(req)
    event = stripe.webhooks.constructEvent(raw, sig, whSecret)
  }catch(err){
    console.error('[stripe-webhook] signature verification failed:', err.message)
    return res.status(400).end(`Webhook Error: ${err.message}`)
  }

  if(event.type === 'checkout.session.completed'){
    const s = event.data.object
    const amount = (s.amount_total || 0) / 100
    const currency = (s.currency || 'usd').toUpperCase()
    const echoSession = (s.metadata && s.metadata.echo_session_id) || s.client_reference_id || 'unknown'
    console.log(`[tip] ${currency} ${amount} — echo_session=${echoSession} stripe_session=${s.id}`)
  } else {
    console.log(`[stripe-webhook] unhandled event type: ${event.type}`)
  }

  return res.status(200).json({ received: true })
}

module.exports = handler
// Disable default JSON body parsing — Stripe needs the raw body for signature verification
module.exports.config = {
  api: { bodyParser: false },
}

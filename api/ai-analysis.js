export const config = { runtime: 'edge' }

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'not_configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  let body
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_json' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const { prompt, lang } = body
  if (!prompt || typeof prompt !== 'string' || prompt.length > 2000) {
    return new Response(JSON.stringify({ error: 'invalid_prompt' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 220,
      messages: [{ role: 'user', content: prompt }]
    })
  })

  if (!resp.ok) {
    return new Response(JSON.stringify({ error: 'upstream_error', status: resp.status }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const data = await resp.json()
  const text = data.content?.[0]?.text || ''

  return new Response(JSON.stringify({ text }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { userId, email, priceId } = req.body

  if (!userId || !priceId) {
    return res.status(400).json({ error: 'Missing userId or priceId' })
  }

  try {
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        mode: 'subscription',
        'line_items[0][price]': priceId,
        'line_items[0][quantity]': '1',
        customer_email: email,
        success_url: `${req.headers.origin || req.headers.referer}/review?success=true`,
        cancel_url: `${req.headers.origin || req.headers.referer}/review?canceled=true`,
        'metadata[userId]': userId,
      }).toString(),
    })

    const session = await response.json()

    if (session.error) {
      console.error('Stripe error:', session.error)
      return res.status(400).json({ error: session.error.message })
    }

    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('Checkout error:', err)
    return res.status(500).json({ error: err.message })
  }
}

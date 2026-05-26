// /api/create-checkout.js — Creates a Stripe Checkout session for the €1/mo subscription

import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { userId, email, priceId } = req.body

  if (!userId || !priceId) {
    return res.status(400).json({ error: 'Missing userId or priceId' })
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${req.headers.origin}/review?success=true`,
      cancel_url: `${req.headers.origin}/review?canceled=true`,
      metadata: { userId },
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return res.status(500).json({ error: 'Failed to create checkout session' })
  }
}

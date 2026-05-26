// /api/webhook.js — Handles Stripe webhook events to manage subscription status

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for server-side writes
)

export const config = { api: { bodyParser: false } }

async function buffer(readable) {
  const chunks = []
  for await (const chunk of readable) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  return Buffer.concat(chunks)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const buf = await buffer(req)
  const sig = req.headers['stripe-signature']

  let event
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  const { type, data } = event

  try {
    if (type === 'checkout.session.completed') {
      const session = data.object
      const userId = session.metadata.userId
      const subscriptionId = session.subscription

      await supabase.from('subscriptions').upsert({
        user_id: userId,
        stripe_subscription_id: subscriptionId,
        stripe_customer_id: session.customer,
        status: 'active',
        current_period_end: null, // Will be set by invoice.paid
      }, { onConflict: 'user_id' })
    }

    if (type === 'invoice.paid') {
      const invoice = data.object
      const sub = await stripe.subscriptions.retrieve(invoice.subscription)
      
      await supabase.from('subscriptions')
        .update({
          status: 'active',
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        })
        .eq('stripe_subscription_id', invoice.subscription)
    }

    if (type === 'customer.subscription.deleted') {
      const subscription = data.object
      await supabase.from('subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_subscription_id', subscription.id)
    }

    if (type === 'customer.subscription.updated') {
      const subscription = data.object
      await supabase.from('subscriptions')
        .update({
          status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id)
    }
  } catch (err) {
    console.error(`Error handling ${type}:`, err)
    return res.status(500).json({ error: 'Webhook handler failed' })
  }

  return res.status(200).json({ received: true })
}

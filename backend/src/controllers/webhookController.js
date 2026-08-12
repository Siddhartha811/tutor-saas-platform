const stripe = require('../config/stripe');
const { Payment } = require('../models');

// POST /api/webhooks/stripe — Stripe calls this directly, no auth/tenant middleware.
// Requires the raw request body for signature verification (wired in app.js).
const handleStripeWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const paymentId = session.metadata?.paymentId;
    if (paymentId) {
      await Payment.findByIdAndUpdate(paymentId, {
        status: 'paid',
        paidAt: new Date(),
        stripePaymentIntentId: session.payment_intent,
      });
    }
  }

  res.status(200).json({ received: true });
};

module.exports = { handleStripeWebhook };
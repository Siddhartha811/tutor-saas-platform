const { Payment } = require('../models');
const stripe = require('../config/stripe');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/payments?studentId=&status=
const getPayments = asyncHandler(async (req, res) => {
  const { studentId, status } = req.query;
  const filter = { tenantId: req.tenantId };
  if (studentId) filter.studentId = studentId;
  if (status) filter.status = status;
  const payments = await Payment.find(filter).sort({ createdAt: -1 }).populate('studentId', 'name');
  res.status(200).json({ success: true, count: payments.length, payments });
});

// POST /api/payments — creates a pending invoice
const createPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.create({ ...req.body, tenantId: req.tenantId });
  res.status(201).json({ success: true, payment });
});

// POST /api/payments/:id/checkout-session — generates a Stripe hosted payment link
const createCheckoutSession = asyncHandler(async (req, res) => {
  if (!stripe) {
    const error = new Error('Stripe is not configured');
    error.statusCode = 503;
    throw error;
  }

  const payment = await Payment.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  if (!payment) {
    const error = new Error('Payment not found');
    error.statusCode = 404;
    throw error;
  }

  if (payment.status === 'paid') {
    const error = new Error('Payment already completed');
    error.statusCode = 400;
    throw error;
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: payment.currency,
          product_data: {
            name: payment.description
          },
          unit_amount: payment.amount
        },
        quantity: 1
      }
    ],
    metadata: {
      paymentId: payment._id.toString(),
      tenantId: req.tenantId.toString()
    },
    success_url: `${process.env.CLIENT_URL}/billing?status=success`,
    cancel_url: `${process.env.CLIENT_URL}/billing?status=cancelled`
  });

  payment.stripeCheckoutSessionId = session.id;
  await payment.save();

  res.status(200).json({
    success: true,
    url: session.url
  });
});

module.exports = { getPayments, createPayment, createCheckoutSession };
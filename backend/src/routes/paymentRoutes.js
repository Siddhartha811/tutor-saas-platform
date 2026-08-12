const express = require('express');
const protect = require('../middleware/auth');
const tenantScope = require('../middleware/tenantScope');
const validate = require('../middleware/validate');
const { createPaymentSchema } = require('../validators/paymentValidators');
const { getPayments, createPayment, createCheckoutSession } = require('../controllers/paymentController');

const router = express.Router();
router.use(protect, tenantScope);

router.get('/', getPayments);
router.post('/', validate(createPaymentSchema), createPayment);
router.post('/:id/checkout-session', createCheckoutSession);

module.exports = router;
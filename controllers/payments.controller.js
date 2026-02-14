const paymentsService = require('../services/payments.service');

class PaymentsController {
  // Get user payments (root route)
  async getUserPayments(req, res) {
    try {
      const result = await paymentsService.getUserPayments(req.user.id);
      res.json(result);
    } catch (error) {
      console.error('Error in getUserPayments controller:', error);
      res.status(500).json({ message: 'Failed to fetch payments', error: error.message });
    }
  }

  // Initialize late fee payment
  async initializeLateFeePayment(req, res) {
    try {
      const result = await paymentsService.initializeLateFeePayment(req.user.id, req.user.email, req.body);
      res.json(result);
    } catch (error) {
      console.error('Error in initializeLateFeePayment controller:', error);
      res.status(500).json({ message: 'Failed to initialize payment', error: error.message });
    }
  }

  // Verify payment
  async verifyPayment(req, res) {
    try {
      const result = await paymentsService.verifyPayment(req.body.reference);
      res.json(result);
    } catch (error) {
      console.error('Error in verifyPayment controller:', error);
      res.status(500).json({ message: 'Failed to verify payment', error: error.message });
    }
  }

  // Get payment history
  async getPaymentHistory(req, res) {
    try {
      const result = await paymentsService.getPaymentHistory(req.user.id);
      res.json(result);
    } catch (error) {
      console.error('Error in getPaymentHistory controller:', error);
      res.status(500).json({ message: 'Failed to fetch payment history', error: error.message });
    }
  }

  // Get payment status
  async getPaymentStatus(req, res) {
    try {
      const result = await paymentsService.getPaymentStatus(req.params.reference);
      res.json(result);
    } catch (error) {
      console.error('Error in getPaymentStatus controller:', error);
      res.status(500).json({ message: 'Failed to fetch payment', error: error.message });
    }
  }

  // Get all payments (admin view)
  async getAllPayments(req, res) {
    try {
      const result = await paymentsService.getAllPayments(req.query);
      res.json(result);
    } catch (error) {
      console.error('Error in getAllPayments controller:', error);
      res.status(500).json({ message: 'Failed to fetch payments', error: error.message });
    }
  }

  // Get payment statistics
  async getPaymentStats(req, res) {
    try {
      const result = await paymentsService.getPaymentStats();
      res.json(result);
    } catch (error) {
      console.error('Error in getPaymentStats controller:', error);
      res.status(500).json({ message: 'Failed to fetch payment statistics', error: error.message });
    }
  }

  // Handle Paystack webhook
  async handleWebhook(req, res) {
    try {
      const signature = req.headers['x-paystack-signature'];
      console.log(`[Webhook] Received Paystack webhook. Signature present: ${!!signature}`);

      const result = await paymentsService.processWebhook(req.body, signature);

      if (!result.success) {
        console.error('[Webhook] Processing failed:', result.error);

        if (result.error === 'Invalid webhook signature') {
          console.warn('[Webhook] Invalid signature detected. Rejecting request.');
          return res.status(401).json({ message: 'Invalid signature' });
        }
      } else {
        console.log('[Webhook] Successfully processed event:', req.body.event);
        if (result.message) {
          console.log('[Webhook] Result message:', result.message);
        }
      }

      res.status(200).send('Webhook received');
    } catch (error) {
      console.error('[Webhook] Error in controller:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }
}

module.exports = new PaymentsController(); 
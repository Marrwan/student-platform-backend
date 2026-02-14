const { Payment, Submission, User, Project, sequelize } = require('../models');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// ENV VARS: PAYSTACK_SECRET_KEY, PAYSTACK_BASE_URL
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = process.env.PAYSTACK_BASE_URL || 'https://api.paystack.co';

class PaymentsService {
  // Get user payments
  async getUserPayments(userId) {
    try {
      const payments = await Payment.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']]
      });
      return { payments };
    } catch (error) {
      console.error('Error fetching user payments:', error);
      throw error;
    }
  }

  // Initialize late fee payment
  async initializeLateFeePayment(userId, userEmail, paymentData) {
    try {
      const { submissionId, assignmentId, amount } = paymentData;

      if ((!submissionId && !assignmentId) || !amount) {
        throw new Error('Missing required fields (submissionId or assignmentId, and amount)');
      }

      const reference = uuidv4();

      const paymentDataToCreate = {
        userId,
        amount,
        reference,
        status: 'pending',
        type: 'late_fee',
      };

      if (submissionId) paymentDataToCreate.submissionId = submissionId;

      const payment = await Payment.create(paymentDataToCreate);

      // Metadata for Paystack
      const metadata = {};
      if (submissionId) metadata.submissionId = submissionId;
      if (assignmentId) metadata.assignmentId = assignmentId;

      // Create Paystack payment
      const paystackRes = await axios.post(
        `${PAYSTACK_BASE_URL}/transaction/initialize`,
        {
          email: userEmail,
          amount: amount * 100, // Paystack expects kobo
          reference,
          metadata: metadata,
        },
        { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } }
      );

      // Update payment with Paystack response and metadata
      payment.paystackResponse = paystackRes.data;
      payment.metadata = metadata;
      await payment.save();



      return {
        message: 'Payment initialized',
        payment,
        paystack: paystackRes.data
      };
    } catch (error) {
      console.error('Error initializing late fee payment:', error);
      throw error;
    }
  }

  // Verify payment
  async verifyPayment(reference) {
    try {
      if (!reference) {
        throw new Error('Missing reference');
      }

      const payment = await Payment.findOne({ where: { reference } });
      if (!payment) {
        throw new Error('Payment not found');
      }

      // Verify with Paystack
      const verifyRes = await axios.get(
        `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
        { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } }
      );

      payment.paystackResponse = verifyRes.data;
      if (verifyRes.data.data.status === 'success') {
        payment.status = 'success';
        // Optionally update submission status here
      } else {
        payment.status = 'failed';
      }
      await payment.save();

      return {
        success: payment.status === 'success',
        message: 'Payment verified',
        payment
      };
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  // Get payment history
  async getPaymentHistory(userId) {
    try {
      console.log('Fetching payment history for user:', userId);

      // First check if Payment model is properly loaded
      if (!Payment) {
        console.error('Payment model not found');
        throw new Error('Payment model not available');
      }

      const payments = await Payment.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']]
      });

      console.log('Found payments:', payments.length);
      return { payments };
    } catch (error) {
      console.error('Payment history error:', error);
      throw error;
    }
  }

  // Get payment status
  async getPaymentStatus(reference) {
    try {
      const payment = await Payment.findOne({ where: { reference } });
      if (!payment) {
        throw new Error('Payment not found');
      }
      return { payment };
    } catch (error) {
      console.error('Error fetching payment status:', error);
      throw error;
    }
  }

  // Get all payments (admin view)
  async getAllPayments(params) {
    try {
      const { page = 1, limit = 20, status, type } = params;

      const where = {};
      if (status) where.status = status;
      if (type) where.type = type;

      const payments = await Payment.findAndCountAll({
        where,
        include: [
          {
            model: User,
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: Submission,
            attributes: ['id', 'projectId'],
            include: [{ model: Project, attributes: ['id', 'title', 'day'] }]
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });

      return {
        data: payments.rows,
        total: payments.count,
        page: parseInt(page),
        totalPages: Math.ceil(payments.count / parseInt(limit))
      };
    } catch (error) {
      console.error('Error fetching admin payments:', error);
      throw error;
    }
  }

  // Get payment statistics
  async getPaymentStats() {
    try {
      const [
        totalPayments,
        successfulPayments,
        pendingPayments,
        failedPayments,
        totalAmount,
        averageAmount
      ] = await Promise.all([
        Payment.count(),
        Payment.count({ where: { status: 'successful' } }),
        Payment.count({ where: { status: 'pending' } }),
        Payment.count({ where: { status: 'failed' } }),
        Payment.sum('amount', { where: { status: 'successful' } }),
        Payment.findOne({
          attributes: [[sequelize.fn('AVG', sequelize.col('amount')), 'average']],
          where: { status: 'successful' }
        })
      ]);

      return {
        totalPayments,
        successfulPayments,
        pendingPayments,
        failedPayments,
        totalAmount: totalAmount || 0,
        averageAmount: averageAmount ? parseFloat(averageAmount.getDataValue('average')) : 0
      };
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      throw error;
    }
  }
}

module.exports = new PaymentsService(); 
const axios = require('axios');
const crypto = require('crypto');

class PaystackService {
  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY;
    this.publicKey = process.env.PAYSTACK_PUBLIC_KEY;
    this.baseURL = 'https://api.paystack.co';
  }

  // Initialize transaction
  async initializeTransaction(data) {
    try {
      const response = await axios.post(
        `${this.baseURL}/transaction/initialize`,
        {
          email: data.email,
          amount: data.amount * 100, // Convert to kobo (smallest currency unit)
          reference: data.reference,
          callback_url: data.callback_url,
          metadata: {
            submissionId: data.submissionId,
            assignmentId: data.assignmentId,
            userId: data.userId,
            type: data.type || 'late_fee'
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data.data,
        authorization_url: response.data.data.authorization_url
      };
    } catch (error) {
      console.error('Paystack initialization error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // Verify transaction
  async verifyTransaction(reference) {
    try {
      const response = await axios.get(
        `${this.baseURL}/transaction/verify/${reference}`,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`
          }
        }
      );

      const transaction = response.data.data;
      
      return {
        success: true,
        data: {
          reference: transaction.reference,
          amount: transaction.amount / 100, // Convert from kobo to naira
          status: transaction.status,
          gateway_response: transaction.gateway_response,
          channel: transaction.channel,
          paid_at: transaction.paid_at,
          metadata: transaction.metadata
        }
      };
    } catch (error) {
      console.error('Paystack verification error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // Create transfer recipient
  async createTransferRecipient(data) {
    try {
      const response = await axios.post(
        `${this.baseURL}/transferrecipient`,
        {
          type: 'nuban',
          name: data.name,
          account_number: data.account_number,
          bank_code: data.bank_code,
          currency: 'NGN'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Paystack transfer recipient error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // Initiate transfer
  async initiateTransfer(data) {
    try {
      const response = await axios.post(
        `${this.baseURL}/transfer`,
        {
          source: 'balance',
          amount: data.amount * 100, // Convert to kobo
          recipient: data.recipient_code,
          reason: data.reason || 'Late fee refund'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Paystack transfer error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // Get banks list
  async getBanks() {
    try {
      const response = await axios.get(
        `${this.baseURL}/bank`,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`
          }
        }
      );

      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Paystack banks error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // Verify bank account
  async verifyBankAccount(accountNumber, bankCode) {
    try {
      const response = await axios.get(
        `${this.baseURL}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`
          }
        }
      );

      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Paystack bank verification error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // Generate reference
  generateReference() {
    return `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Verify webhook signature
  verifyWebhookSignature(signature, body) {
    try {
      const hash = crypto
        .createHmac('sha512', this.secretKey)
        .update(JSON.stringify(body))
        .digest('hex');

      return hash === signature;
    } catch (error) {
      console.error('Webhook signature verification error:', error);
      return false;
    }
  }

  // Process webhook
  async processWebhook(body, signature) {
    try {
      // Verify webhook signature
      if (!this.verifyWebhookSignature(signature, body)) {
        return {
          success: false,
          error: 'Invalid webhook signature'
        };
      }

      const event = body.event;
      const data = body.data;

      switch (event) {
        case 'charge.success':
          return await this.handleSuccessfulCharge(data);
        
        case 'transfer.success':
          return await this.handleSuccessfulTransfer(data);
        
        case 'transfer.failed':
          return await this.handleFailedTransfer(data);
        
        default:
          return {
            success: true,
            message: `Unhandled event: ${event}`
          };
      }
    } catch (error) {
      console.error('Webhook processing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Handle successful charge
  async handleSuccessfulCharge(data) {
    try {
      const { reference, amount, metadata } = data;
      
      // Update payment record in database
      const { Payment } = require('../models');
      
      const payment = await Payment.findOne({ where: { reference } });
      if (payment) {
        await payment.update({
          status: 'completed',
          amount: amount / 100, // Convert from kobo to naira
          paidAt: new Date(),
          gatewayResponse: data.gateway_response,
          channel: data.channel
        });

        // Update submission status if it's a late fee payment
        if (metadata && metadata.submissionId) {
          const { AssignmentSubmission } = require('../models');
          const submission = await AssignmentSubmission.findByPk(metadata.submissionId);
          if (submission) {
            await submission.update({
              lateFeePaid: true,
              lateFeePaidAt: new Date()
            });
          }
        }

        return {
          success: true,
          message: 'Payment processed successfully',
          paymentId: payment.id
        };
      }

      return {
        success: false,
        error: 'Payment record not found'
      };
    } catch (error) {
      console.error('Handle successful charge error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Handle successful transfer
  async handleSuccessfulTransfer(data) {
    try {
      const { reference, amount, recipient } = data;
      
      // Update transfer record in database
      const { Transfer } = require('../models');
      
      const transfer = await Transfer.findOne({ where: { reference } });
      if (transfer) {
        await transfer.update({
          status: 'completed',
          amount: amount / 100,
          completedAt: new Date()
        });
      }

      return {
        success: true,
        message: 'Transfer completed successfully'
      };
    } catch (error) {
      console.error('Handle successful transfer error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Handle failed transfer
  async handleFailedTransfer(data) {
    try {
      const { reference, failure_reason } = data;
      
      // Update transfer record in database
      const { Transfer } = require('../models');
      
      const transfer = await Transfer.findOne({ where: { reference } });
      if (transfer) {
        await transfer.update({
          status: 'failed',
          failureReason: failure_reason,
          failedAt: new Date()
        });
      }

      return {
        success: true,
        message: 'Transfer failed recorded'
      };
    } catch (error) {
      console.error('Handle failed transfer error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get transaction status
  async getTransactionStatus(reference) {
    try {
      const response = await axios.get(
        `${this.baseURL}/transaction/verify/${reference}`,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`
          }
        }
      );

      const transaction = response.data.data;
      
      return {
        success: true,
        status: transaction.status,
        amount: transaction.amount / 100,
        paid_at: transaction.paid_at,
        gateway_response: transaction.gateway_response
      };
    } catch (error) {
      console.error('Get transaction status error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // Get balance
  async getBalance() {
    try {
      const response = await axios.get(
        `${this.baseURL}/balance`,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`
          }
        }
      );

      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Get balance error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }
}

module.exports = new PaystackService(); 
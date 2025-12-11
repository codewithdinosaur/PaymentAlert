const Joi = require('joi');

// Order creation validation schema
const orderCreationSchema = Joi.object({
  amount: Joi.number().positive().precision(2).required().messages({
    'number.base': 'Amount must be a number',
    'number.positive': 'Amount must be positive',
    'any.required': 'Amount is required'
  }),
  currency: Joi.string().valid('INR').default('INR').messages({
    'any.only': 'Currency must be INR'
  }),
  contact: Joi.string().pattern(/^[+]?[0-9]{10,15}$/).required().messages({
    'string.pattern.base': 'Contact must be a valid phone number',
    'any.required': 'Contact is required'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email must be valid',
    'any.required': 'Email is required'
  }),
  description: Joi.string().max(255).optional().messages({
    'string.max': 'Description cannot exceed 255 characters'
  }),
  receipt: Joi.string().max(255).optional().messages({
    'string.max': 'Receipt cannot exceed 255 characters'
  })
});

// UPI QR code creation validation schema
const upiQRCodeSchema = Joi.object({
  order_id: Joi.string().required().messages({
    'any.required': 'Order ID is required'
  }),
  amount: Joi.number().positive().precision(2).required().messages({
    'number.base': 'Amount must be a number',
    'number.positive': 'Amount must be positive',
    'any.required': 'Amount is required'
  })
});

// UPI intent creation validation schema
const upiIntentSchema = Joi.object({
  order_id: Joi.string().required().messages({
    'any.required': 'Order ID is required'
  }),
  amount: Joi.number().positive().precision(2).required().messages({
    'number.base': 'Amount must be a number',
    'number.positive': 'Amount must be positive',
    'any.required': 'Amount is required'
  })
});

// UPI Autopay mandate creation validation schema
const upiMandateSchema = Joi.object({
  customer_name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Customer name must be at least 2 characters',
    'string.max': 'Customer name cannot exceed 100 characters',
    'any.required': 'Customer name is required'
  }),
  customer_email: Joi.string().email().required().messages({
    'string.email': 'Email must be valid',
    'any.required': 'Email is required'
  }),
  customer_contact: Joi.string().pattern(/^[+]?[0-9]{10,15}$/).required().messages({
    'string.pattern.base': 'Contact must be a valid phone number',
    'any.required': 'Contact is required'
  }),
  amount: Joi.number().positive().precision(2).required().messages({
    'number.base': 'Amount must be a number',
    'number.positive': 'Amount must be positive',
    'any.required': 'Amount is required'
  }),
  frequency: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly', 'as_presented').required().messages({
    'any.only': 'Frequency must be one of: daily, weekly, monthly, yearly, as_presented',
    'any.required': 'Frequency is required'
  }),
  start_date: Joi.string().isoDate().optional().messages({
    'string.isoDate': 'Start date must be in ISO format'
  }),
  end_date: Joi.string().isoDate().optional().messages({
    'string.isoDate': 'End date must be in ISO format'
  }),
  reference_id: Joi.string().max(100).optional().messages({
    'string.max': 'Reference ID cannot exceed 100 characters'
  })
});

// Webhook validation schema
const webhookSchema = Joi.object({
  razorpay_order_id: Joi.string().required().messages({
    'any.required': 'Razorpay order ID is required'
  }),
  razorpay_payment_id: Joi.string().required().messages({
    'any.required': 'Razorpay payment ID is required'
  }),
  razorpay_signature: Joi.string().required().messages({
    'any.required': 'Razorpay signature is required'
  })
});

// Payment verification validation schema
const paymentVerificationSchema = Joi.object({
  order_id: Joi.string().required().messages({
    'any.required': 'Order ID is required'
  }),
  payment_id: Joi.string().required().messages({
    'any.required': 'Payment ID is required'
  }),
  signature: Joi.string().required().messages({
    'any.required': 'Signature is required'
  })
});

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errorDetails
      });
    }

    req.validatedData = value;
    next();
  };
};

// Query parameter validation middleware
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: 'Query validation failed',
        details: errorDetails
      });
    }

    req.validatedQuery = value;
    next();
  };
};

// Common query validation schemas
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().valid('asc', 'desc').default('desc'),
  orderBy: Joi.string().valid('created_at', 'updated_at', 'amount', 'status').default('created_at')
});

module.exports = {
  validate: validate,
  validateQuery: validateQuery,
  orderCreationSchema: orderCreationSchema,
  upiQRCodeSchema: upiQRCodeSchema,
  upiIntentSchema: upiIntentSchema,
  upiMandateSchema: upiMandateSchema,
  webhookSchema: webhookSchema,
  paymentVerificationSchema: paymentVerificationSchema,
  paginationSchema: paginationSchema
};
const { body, param, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

// ── Users ──────────────────────────────────────────────────────────

const validateCreateUser = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name must be at most 100 characters'),
  body('role')
    .optional()
    .trim()
    .isIn(['user', 'admin']).withMessage('Role must be user or admin'),
  handleValidationErrors,
];

const validateUpdateUser = [
  param('id').custom(isValidObjectId).withMessage('Invalid user ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Name must be at most 100 characters'),
  body('role')
    .optional()
    .trim()
    .isIn(['user', 'admin']).withMessage('Role must be user or admin'),
  handleValidationErrors,
];

const validateUserId = [
  param('id').custom(isValidObjectId).withMessage('Invalid user ID'),
  handleValidationErrors,
];

// ── Events ─────────────────────────────────────────────────────────

const validateCreateEvent = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title must be at most 200 characters'),
  body('eventDate')
    .notEmpty().withMessage('Event date is required')
    .isISO8601().withMessage('Event date must be a valid date'),
  body('owner')
    .custom(isValidObjectId).withMessage('Invalid owner ID'),
  body('participants')
    .isArray({ min: 1 }).withMessage('At least one participant is required'),
  body('participants.*')
    .custom(isValidObjectId).withMessage('Invalid participant ID'),
  handleValidationErrors,
];

const validateUpdateEvent = [
  param('id').custom(isValidObjectId).withMessage('Invalid event ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Title must be at most 200 characters'),
  body('eventDate')
    .optional()
    .isISO8601().withMessage('Event date must be a valid date'),
  handleValidationErrors,
];

const validateEventId = [
  param('id').custom(isValidObjectId).withMessage('Invalid event ID'),
  handleValidationErrors,
];

const validateAddEventItem = [
  param('id').custom(isValidObjectId).withMessage('Invalid event ID'),
  body('itemName')
    .trim()
    .notEmpty().withMessage('Item name is required')
    .isLength({ max: 200 }).withMessage('Item name must be at most 200 characters'),
  body('amount')
    .isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
  handleValidationErrors,
];

const validateAddEventItemBatch = [
  param('id').custom(isValidObjectId).withMessage('Invalid event ID'),
  body('items')
    .isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.itemName')
    .trim()
    .notEmpty().withMessage('Item name is required')
    .isLength({ max: 200 }).withMessage('Item name must be at most 200 characters'),
  body('items.*.amount')
    .isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
  handleValidationErrors,
];

const validateUpdatePayment = [
  param('id').custom(isValidObjectId).withMessage('Invalid event ID'),
  param('participantId').custom(isValidObjectId).withMessage('Invalid participant ID'),
  body('amountPaid')
    .isFloat({ min: 0 }).withMessage('amountPaid must be a non-negative number'),
  handleValidationErrors,
];

// ── Expense Items ──────────────────────────────────────────────────

const validateCreateExpenseItem = [
  body('eventId')
    .custom(isValidObjectId).withMessage('Invalid event ID'),
  body('itemName')
    .trim()
    .notEmpty().withMessage('Item name is required')
    .isLength({ max: 200 }).withMessage('Item name must be at most 200 characters'),
  body('amount')
    .isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
  handleValidationErrors,
];

const validateExpenseItemId = [
  param('id').custom(isValidObjectId).withMessage('Invalid expense item ID'),
  handleValidationErrors,
];

const validateUpdateExpenseItem = [
  param('id').custom(isValidObjectId).withMessage('Invalid expense item ID'),
  body('amount')
    .isFloat({ min: 0 }).withMessage('Amount must be a non-negative number'),
  handleValidationErrors,
];

// ── Analytics ──────────────────────────────────────────────────────

const validatePurgeAll = [
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

// ── Search ─────────────────────────────────────────────────────────

const validateUserSearch = [
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Search term must be at most 100 characters'),
  handleValidationErrors,
];

module.exports = {
  validateCreateUser,
  validateUpdateUser,
  validateUserId,
  validateCreateEvent,
  validateUpdateEvent,
  validateEventId,
  validateAddEventItem,
  validateAddEventItemBatch,
  validateUpdatePayment,
  validateCreateExpenseItem,
  validateExpenseItemId,
  validateUpdateExpenseItem,
  validatePurgeAll,
  validateUserSearch,
};

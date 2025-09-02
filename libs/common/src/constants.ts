// Service Names
export const SERVICES = {
  USER_SERVICE: 'USER_SERVICE',
  PRODUCT_SERVICE: 'PRODUCT_SERVICE',
  ORDER_SERVICE: 'ORDER_SERVICE',
  NOTIFICATION_SERVICE: 'NOTIFICATION_SERVICE',
} as const;

// Message Patterns
export const MESSAGE_PATTERNS = {
  // User Service
  USER_CREATE: 'user.create',
  USER_FIND_BY_ID: 'user.findById',
  USER_FIND_BY_EMAIL: 'user.findByEmail',
  USER_FIND_ALL: 'user.findAll',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',
  USER_VALIDATE: 'user.validate',

  // Product Service
  PRODUCT_CREATE: 'product.create',
  PRODUCT_FIND_BY_ID: 'product.findById',
  PRODUCT_FIND_ALL: 'product.findAll',
  PRODUCT_UPDATE: 'product.update',
  PRODUCT_DELETE: 'product.delete',
  PRODUCT_SEARCH: 'product.search',
  PRODUCT_UPDATE_STOCK: 'product.updateStock',

  // Order Service
  ORDER_CREATE: 'order.create',
  ORDER_FIND_BY_ID: 'order.findById',
  ORDER_FIND_BY_USER: 'order.findByUser',
  ORDER_UPDATE_STATUS: 'order.updateStatus',
  ORDER_GET_STATS: 'order.getStats',

  // Notification Service
  NOTIFICATION_SEND: 'notification.send',
  NOTIFICATION_SEND_EMAIL: 'notification.sendEmail',
  NOTIFICATION_SEND_SMS: 'notification.sendSMS',
} as const;

// Event Patterns
export const EVENT_PATTERNS = {
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  ORDER_CREATED: 'order.created',
  ORDER_STATUS_UPDATED: 'order.status.updated',
  PRODUCT_STOCK_UPDATED: 'product.stock.updated',
  PAYMENT_PROCESSED: 'payment.processed',
} as const;

// Database Tables
export const DB_TABLES = {
  USERS: 'users',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  ORDER_ITEMS: 'order_items',
  NOTIFICATIONS: 'notifications',
} as const;

// Cache Keys
export const CACHE_KEYS = {
  USER_PREFIX: 'user:',
  PRODUCT_PREFIX: 'product:',
  ORDER_PREFIX: 'order:',
} as const;

// JWT Constants
export const JWT_CONSTANTS = {
  SECRET: process.env.JWT_SECRET || 'your-secret-key',
  EXPIRES_IN: '24h',
  REFRESH_EXPIRES_IN: '7d',
} as const;

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

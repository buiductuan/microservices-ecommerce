# Notification Service

The Notification Service handles email and SMS notifications for the e-commerce platform. It supports template-based notifications, event-driven messaging, and multi-channel delivery.

## Features

### Core Functionality
- **Multi-channel notifications**: Email, SMS, Push, In-app
- **Template management**: Create, update, and manage notification templates
- **Event-driven architecture**: Responds to Kafka events from other services
- **Notification logging**: Track all notification attempts and delivery status
- **Retry mechanism**: Automatic retry for failed notifications
- **Variable templating**: Dynamic content using template variables

### Supported Notification Types
- Welcome messages
- Order confirmations
- Order status updates (shipped, delivered)
- Password reset requests
- Email verification
- Payment confirmations
- Promotional messages
- System alerts

### Integrations
- **Email**: SMTP (Gmail, SendGrid, etc.)
- **SMS**: Twilio
- **Database**: PostgreSQL for templates and logs
- **Message Broker**: Kafka for event processing

## API Endpoints

### Authentication Required
All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### Notification Management
- `POST /notifications/send` - Send a notification
- `GET /notifications/history` - Get current user's notification history
- `GET /notifications/history/:recipientId` - Get user's notification history (Admin only)
- `GET /notifications/stats` - Get notification statistics (Admin only)
- `POST /notifications/retry/:notificationId` - Retry failed notification (Admin only)

### Template Management (Admin Only)
- `GET /notifications/templates` - Get all templates
- `GET /notifications/templates/:id` - Get template by ID
- `POST /notifications/templates` - Create new template
- `PUT /notifications/templates/:id` - Update template
- `DELETE /notifications/templates/:id` - Delete template
- `POST /notifications/templates/:id/render` - Render template with variables

### Health Check
- `GET /notifications/health` - Service health status

## Environment Variables

```bash
# Service Configuration
PORT=3004
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=notification_db

# Kafka Configuration
KAFKA_BROKERS=localhost:9092

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM="E-commerce Platform <noreply@ecommerce.com>"

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Frontend URL (for reset links)
FRONTEND_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h
```

## Kafka Event Handlers

The service listens to the following Kafka events:

### `user.created`
Triggered when a new user registers.
```json
{
  "userId": "user-123",
  "email": "user@example.com",
  "name": "John Doe"
}
```
**Action**: Sends welcome email

### `order.created`
Triggered when a new order is placed.
```json
{
  "orderId": "order-456",
  "userId": "user-123",
  "userEmail": "user@example.com",
  "userName": "John Doe",
  "totalAmount": 99.99,
  "items": [...]
}
```
**Action**: Sends order confirmation email

### `order.shipped`
Triggered when an order is shipped.
```json
{
  "orderId": "order-456",
  "userId": "user-123",
  "userEmail": "user@example.com",
  "userName": "John Doe",
  "trackingNumber": "TRACK123"
}
```
**Action**: Sends shipment notification

### `password.reset.requested`
Triggered when user requests password reset.
```json
{
  "userId": "user-123",
  "userEmail": "user@example.com",
  "userName": "John Doe",
  "resetToken": "reset-token-123"
}
```
**Action**: Sends password reset email

## Template Variables

Templates support dynamic content using `{{variable_name}}` syntax:

### Common Variables
- `{{user_name}}` - User's display name
- `{{platform_name}}` - Platform/brand name
- `{{order_id}}` - Order identifier
- `{{total_amount}}` - Order total amount
- `{{reset_url}}` - Password reset URL
- `{{tracking_number}}` - Shipment tracking number

### Example Template
```html
<div style="font-family: Arial, sans-serif;">
  <h1>Welcome {{user_name}}!</h1>
  <p>Thank you for joining {{platform_name}}.</p>
  <p>Your account is now active and ready to use.</p>
</div>
```

## Database Schema

### notification_templates
- `id` - UUID primary key
- `name` - Unique template name
- `subject` - Email subject template
- `htmlContent` - HTML content template
- `textContent` - Plain text template (optional)
- `type` - Notification type enum
- `channels` - Supported channels array
- `variables` - Template variables schema
- `isActive` - Template status
- `createdAt` / `updatedAt` - Timestamps

### notification_logs
- `id` - UUID primary key
- `templateId` - Reference to template (optional)
- `recipientId` - User ID
- `recipientEmail` - Email address (optional)
- `recipientPhone` - Phone number (optional)
- `channel` - Delivery channel
- `status` - Delivery status (pending, sent, delivered, failed)
- `priority` - Message priority
- `subject` - Rendered subject
- `content` - Rendered content
- `metadata` - Additional data
- `externalId` - Provider message ID
- `errorMessage` - Error details (if failed)
- `sentAt` / `deliveredAt` - Status timestamps
- `retryCount` - Retry attempts
- `scheduledAt` - Scheduled delivery time
- `createdAt` / `updatedAt` - Timestamps

## Development

### Running the Service
```bash
# Development mode
npm run start:dev notification-service

# Production mode
npm run start:prod notification-service

# Debug mode
npm run start:debug notification-service
```

### Running Tests
```bash
# Unit tests
npm run test notification-service

# E2E tests
npm run test:e2e notification-service

# Test coverage
npm run test:cov notification-service
```

### Docker
```bash
# Build image
docker build -f infrastructure/docker/Dockerfile.notification-service -t notification-service .

# Run container
docker run -p 3004:3004 notification-service
```

## Monitoring

The service exposes metrics and health checks:

- **Health Check**: `GET /notifications/health`
- **Metrics**: Available via Prometheus endpoint
- **Logs**: Structured logging with correlation IDs

## Security

- JWT authentication for all API endpoints
- Role-based access control (RBAC)
- Input validation and sanitization
- Rate limiting on API endpoints
- Secure email template rendering
- Environment variable validation

## Error Handling

- Graceful error handling with proper HTTP status codes
- Retry mechanism for failed deliveries
- Dead letter queue for permanently failed messages
- Comprehensive error logging and monitoring

## Scalability

- Stateless design for horizontal scaling
- Database connection pooling
- Asynchronous message processing
- Template caching for performance
- Background job processing for scheduled notifications

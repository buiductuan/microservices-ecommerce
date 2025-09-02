# Microservices E-commerce Platform

A production-ready microservices e-commerce platform built with **NestJS**, **TypeScript**, **PostgreSQL**, **Kafka**, and **Kubernetes**.

## 🚀 Architecture Overview

This project implements a modern microservices architecture with the following components:

### Services
- **API Gateway** (`port: 3001`) - REST API gateway with authentication, rate limiting, and request routing
- **User Service** (`port: 3002`) - User management, authentication, and JWT validation
- **Product Service** (`port: 3003`) - Product catalog, search, and inventory management
- **Order Service** (`port: 3004`) - Order processing, lifecycle management, and statistics
- **Notification Service** (`port: 3005`) - Email/SMS notifications via SMTP and Twilio
- **Frontend** (`port: 3000`) - React Admin Dashboard with Ant Design Pro

### Technologies

#### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Ant Design Pro** - Enterprise-class UI components
- **Vite** - Fast build tool and development server
- **Redux Toolkit** - State management
- **React Router** - Client-side routing

#### Backend
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **TypeORM** - Database ORM with migrations
- **PostgreSQL** - Primary database for all services
- **Redis** - Caching layer for performance
- **Kafka** - Message broker for inter-service communication
- **JWT** - Authentication and authorization

#### Infrastructure
- **Docker** - Containerization with multi-stage builds
- **Kubernetes** - Container orchestration
- **Terraform** - Infrastructure as Code (AWS EKS, RDS, MSK)
- **Prometheus + Grafana** - Monitoring and observability
- **Nginx Ingress** - Load balancing and SSL termination

## 📁 Project Structure

```
microservices-ecommerce/
├── apps/                          # Microservices applications
│   ├── api-gateway/               # API Gateway service
│   ├── user-service/              # User management service
│   ├── product-service/           # Product catalog service
│   ├── order-service/             # Order processing service
│   ├── notification-service/      # Email/SMS notification service
│   └── frontend/                  # React Admin Dashboard
├── libs/                          # Shared libraries
│   ├── common/                    # DTOs, constants, guards, decorators
│   ├── database/                  # TypeORM entities and config
│   └── messaging/                 # Kafka/RabbitMQ setup
├── infrastructure/                # Infrastructure configurations
│   ├── docker/                    # Dockerfiles for each service
│   ├── kubernetes/                # K8s manifests
│   ├── monitoring/                # Prometheus, Grafana configs
│   └── terraform/                 # AWS infrastructure (EKS, RDS, MSK)
├── docker-compose.yml             # Local development
├── docker-compose.prod.yml        # Production setup
└── README.md
```

## 🛠️ Development Setup

### Prerequisites

- **Node.js** 22+ (LTS recommended)
- **Docker** & **Docker Compose**
- **kubectl** (for Kubernetes)
- **Terraform** (for cloud infrastructure)

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd microservices-ecommerce
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database
POSTGRES_PASSWORD=your-secure-password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecommerce
DB_USERNAME=postgres

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Redis
REDIS_URL=redis://localhost:6379

# Kafka
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=ecommerce-client
KAFKA_GROUP_ID=ecommerce-group

# SMTP (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Twilio (for SMS)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

### 3. Start Infrastructure Services

```bash
# Start PostgreSQL, Redis, Kafka, and Zookeeper
docker-compose up -d postgres redis kafka zookeeper

# Wait for services to be ready (check health status)
docker-compose ps
```

### 4. Database Migration

```bash
# Run database migrations
npm run typeorm:migration:run

# Or manually create tables using TypeORM synchronize
npm run start:dev user-service  # Will auto-create tables in dev mode
```

### 5. Start Microservices

Open separate terminals for each service:

```bash
# Terminal 1: User Service
npm run start:dev user-service

# Terminal 2: Product Service  
npm run start:dev product-service

# Terminal 3: Order Service
npm run start:dev order-service

# Terminal 4: Notification Service
npm run start:dev notification-service

# Terminal 5: API Gateway
npm run start:dev api-gateway

# Terminal 6: Frontend (React Admin Dashboard)
npm run start:frontend
```

### 6. Verify Setup

Visit the application:
- **Frontend Dashboard**: http://localhost:3000
- **API Documentation**: http://localhost:3001/api/docs

Test the health endpoints:
```bash
curl http://localhost:3001/health
curl http://localhost:3001/health  # User service
curl http://localhost:3002/health  # Product service
```

## 🐳 Docker Development

Use Docker Compose for easier development:

```bash
# Build and start all services
docker-compose up --build

# Start specific services
docker-compose up api-gateway user-service

# View logs
docker-compose logs -f api-gateway

# Stop all services
docker-compose down
```

## ☸️ Kubernetes Deployment

### Local Kubernetes (minikube/kind)

```bash
# Start minikube
minikube start

# Create namespace and deploy
kubectl apply -f infrastructure/kubernetes/

# Check deployment status
kubectl get pods -n ecommerce
kubectl get services -n ecommerce

# Access API Gateway
kubectl port-forward -n ecommerce svc/api-gateway-service 3000:80
```

### Production Kubernetes

```bash
# Build and push Docker images
docker build -f infrastructure/docker/Dockerfile.api-gateway -t your-registry/api-gateway:latest .
docker push your-registry/api-gateway:latest

# Update image references in K8s manifests
# Deploy to production cluster
kubectl apply -f infrastructure/kubernetes/
```

## 🏗️ AWS Infrastructure with Terraform

### Prerequisites

- **AWS CLI** configured
- **Terraform** installed
- **kubectl** installed

### Deploy Infrastructure

```bash
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Plan deployment
terraform plan -var="environment=production"

# Apply infrastructure
terraform apply

# Get cluster credentials
aws eks update-kubeconfig --region us-west-2 --name ecommerce-cluster

# Deploy applications to EKS
kubectl apply -f ../kubernetes/
```

### Infrastructure Components

- **EKS Cluster** - Managed Kubernetes cluster
- **RDS PostgreSQL** - Managed database with Multi-AZ
- **ElastiCache Redis** - Managed Redis cluster
- **MSK (Kafka)** - Managed Kafka cluster
- **VPC** - Isolated network with public/private subnets
- **ALB** - Application Load Balancer for traffic distribution
- **Route53** - DNS management
- **CloudWatch** - Logging and monitoring

## 📊 API Documentation

### Authentication Endpoints

```bash
# Register new user
POST /auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}

# Login
POST /auth/login
{
  "email": "user@example.com", 
  "password": "password123"
}
```

### Product Endpoints

```bash
# Get all products (with pagination)
GET /products?page=1&limit=10&category=electronics

# Get product by ID
GET /products/123

# Create product (requires authentication)
POST /products
{
  "name": "iPhone 15",
  "description": "Latest iPhone",
  "price": 999.99,
  "stock": 100,
  "category": "electronics"
}

# Search products
GET /products/search?search=iphone&minPrice=500&maxPrice=1500
```

### Order Endpoints

```bash
# Create order (requires authentication)
POST /orders
{
  "items": [
    {
      "productId": "123",
      "quantity": 2,
      "price": 999.99
    }
  ],
  "shippingAddress": "123 Main St, City, State",
  "paymentMethod": "credit_card"
}

# Get user orders
GET /orders?page=1&limit=10

# Get order by ID
GET /orders/123

# Update order status (admin only)
PUT /orders/123/status
{
  "status": "shipped",
  "trackingNumber": "TRACK123"
}
```

## 🔍 Monitoring & Observability

### Prometheus Metrics

Access Prometheus at http://localhost:9090

Key metrics to monitor:
- `http_requests_total` - Total HTTP requests
- `http_request_duration_seconds` - Request duration
- `nodejs_heap_size_used_bytes` - Memory usage
- `process_cpu_user_seconds_total` - CPU usage

### Grafana Dashboards  

Access Grafana at http://localhost:3001 (admin/admin)

Pre-configured dashboards:
- **API Gateway Overview** - Request rates, error rates, response times
- **Microservices Health** - Service availability and performance
- **Database Metrics** - PostgreSQL connection pool, query performance
- **Infrastructure Overview** - Node resource usage, network traffic

### Application Logs

```bash
# View logs in development
npm run logs

# View logs in Docker
docker-compose logs -f [service-name]

# View logs in Kubernetes
kubectl logs -f deployment/api-gateway -n ecommerce
kubectl logs -f deployment/user-service -n ecommerce
```

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
npm run test

# Run tests for specific service
npm run test user-service

# Run tests with coverage
npm run test:cov
```

### Integration Tests

```bash
# Run e2e tests
npm run test:e2e

# Run e2e tests for API Gateway
npm run test:e2e api-gateway
```

### API Testing

Use the provided Postman collection or test with curl:

```bash
# Health check
curl -X GET http://localhost:3000/health

# Register user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'

# Login and get token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 📈 Performance Optimization

### Database Optimization
- Connection pooling configured in TypeORM
- Database indexes on frequently queried fields
- Read replicas for scaling reads
- Query optimization with proper joins and pagination

### Caching Strategy
- Redis for session storage and frequently accessed data
- API response caching for product catalogs
- Database query result caching

### Horizontal Scaling
- Stateless service design for easy horizontal scaling
- Load balancing with Kubernetes services
- Auto-scaling based on CPU/memory metrics

## 🔒 Security Features

### Authentication & Authorization
- JWT tokens with configurable expiration
- Role-based access control (RBAC)
- Password hashing with bcrypt
- API rate limiting

### Data Protection
- Input validation with class-validator
- SQL injection prevention with TypeORM
- XSS protection with helmet middleware
- CORS configuration for cross-origin requests

### Infrastructure Security
- Private subnets for databases and internal services
- Security groups with minimal required access
- Encrypted data at rest and in transit
- Kubernetes network policies

## 📝 Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | No |
| `DB_HOST` | Database host | `localhost` | Yes |
| `DB_PORT` | Database port | `5432` | Yes |
| `DB_USERNAME` | Database username | `postgres` | Yes |
| `DB_PASSWORD` | Database password | - | Yes |
| `DB_NAME` | Database name | `ecommerce` | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `REDIS_URL` | Redis connection URL | - | Yes |
| `KAFKA_BROKERS` | Kafka broker list | `localhost:9092` | Yes |
| `SMTP_HOST` | SMTP server host | - | Yes |
| `SMTP_USER` | SMTP username | - | Yes |
| `SMTP_PASS` | SMTP password | - | Yes |
| `TWILIO_ACCOUNT_SID` | Twilio account SID | - | No |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | - | No |

## 🚀 Production Deployment Checklist

### Pre-deployment
- [ ] Update environment variables for production
- [ ] Build and test Docker images
- [ ] Run database migrations
- [ ] Update Kubernetes manifests with production images
- [ ] Configure SSL certificates
- [ ] Set up monitoring and alerting

### Infrastructure
- [ ] Deploy Terraform infrastructure
- [ ] Configure DNS records
- [ ] Set up backup strategies
- [ ] Configure log aggregation
- [ ] Test disaster recovery procedures

### Security
- [ ] Rotate all secrets and passwords
- [ ] Configure network policies
- [ ] Enable audit logging
- [ ] Set up vulnerability scanning
- [ ] Configure HTTPS everywhere

### Monitoring
- [ ] Set up Prometheus alerting rules
- [ ] Configure Grafana dashboards
- [ ] Set up log aggregation (ELK stack)
- [ ] Configure uptime monitoring
- [ ] Set up performance monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

#### Services won't start
```bash
# Check if ports are available
lsof -i :3000  # API Gateway
lsof -i :5432  # PostgreSQL
lsof -i :9092  # Kafka

# Check Docker container logs
docker-compose logs postgres
docker-compose logs kafka
```

#### Database connection errors
```bash
# Verify PostgreSQL is running
docker-compose ps postgres

# Check database connectivity
docker exec -it postgres_container_name psql -U postgres -d ecommerce

# Reset database
docker-compose down -v
docker-compose up -d postgres
```

#### Kafka connection issues
```bash
# Check Kafka is running
docker-compose ps kafka zookeeper

# Test Kafka connectivity
docker exec -it kafka_container_name kafka-topics --list --bootstrap-server localhost:9092
```

### Getting Help

- **Documentation**: Check the `/docs` folder for detailed documentation
- **Issues**: Open an issue on GitHub for bugs or questions
- **Discussions**: Use GitHub Discussions for general questions
- **Email**: Contact the team at [support@example.com](mailto:support@example.com)

## 🔄 Version History

- **v1.0.0** - Initial release with basic microservices architecture
- **v1.1.0** - Added monitoring and observability features
- **v1.2.0** - Enhanced security and authentication features
- **v2.0.0** - Production-ready with Kubernetes and Terraform support

---

**Happy Coding! 🎉**

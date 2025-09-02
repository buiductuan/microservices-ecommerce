#!/bin/bash

# Development helper script for NestJS Microservices
# This script provides convenient commands for local development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to show help
show_help() {
    echo "NestJS Microservices Development Helper"
    echo ""
    echo "Usage: ./dev.sh [command]"
    echo ""
    echo "Commands:"
    echo "  up         - Start all development services"
    echo "  down       - Stop all services"
    echo "  restart    - Restart all services"
    echo "  build      - Build all Docker images"
    echo "  rebuild    - Rebuild all Docker images from scratch"
    echo "  logs       - Show logs for all services"
    echo "  logs [service] - Show logs for specific service"
    echo "  status     - Show status of all services"
    echo "  clean      - Clean up Docker resources"
    echo "  shell [service] - Open shell in running service"
    echo "  install    - Install dependencies in all services"
    echo "  help       - Show this help message"
    echo ""
    echo "Services: api-gateway, user-service, product-service, order-service, notification-service, frontend"
}

# Function to start development services
start_services() {
    print_info "Starting development services..."
    check_docker
    
    # Create necessary directories if they don't exist
    mkdir -p logs
    
    # Start services with hot reload
    docker-compose -f docker-compose.dev.yml up -d
    
    print_success "Services started successfully!"
    print_info "Services will be available at:"
    echo "  - API Gateway: http://localhost:3000"
    echo "  - User Service: http://localhost:3001"
    echo "  - Product Service: http://localhost:3002"
    echo "  - Order Service: http://localhost:3003"
    echo "  - Notification Service: http://localhost:3004"
    echo "  - Frontend: http://localhost:3600"
    echo "  - PostgreSQL: localhost:5432"
    echo "  - Redis: localhost:6379"
    echo "  - Kafka: localhost:9092"
    echo ""
    print_info "Use './dev.sh logs' to view service logs"
}

# Function to stop services
stop_services() {
    print_info "Stopping development services..."
    docker-compose -f docker-compose.dev.yml down
    print_success "Services stopped successfully!"
}

# Function to restart services
restart_services() {
    print_info "Restarting development services..."
    stop_services
    start_services
}

# Function to build images
build_images() {
    print_info "Building Docker images..."
    check_docker
    docker-compose -f docker-compose.dev.yml build
    print_success "Images built successfully!"
}

# Function to rebuild images from scratch
rebuild_images() {
    print_info "Rebuilding Docker images from scratch..."
    check_docker
    docker-compose -f docker-compose.dev.yml build --no-cache
    print_success "Images rebuilt successfully!"
}

# Function to show logs
show_logs() {
    if [ -n "$1" ]; then
        print_info "Showing logs for $1..."
        docker-compose -f docker-compose.dev.yml logs -f "$1"
    else
        print_info "Showing logs for all services..."
        docker-compose -f docker-compose.dev.yml logs -f
    fi
}

# Function to show service status
show_status() {
    print_info "Service status:"
    docker-compose -f docker-compose.dev.yml ps
}

# Function to clean up Docker resources
clean_resources() {
    print_warning "This will remove all stopped containers, unused networks, and dangling images."
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Cleaning up Docker resources..."
        docker system prune -f
        print_success "Cleanup completed!"
    else
        print_info "Cleanup cancelled."
    fi
}

# Function to open shell in service
open_shell() {
    if [ -z "$1" ]; then
        print_error "Please specify a service name"
        exit 1
    fi
    
    print_info "Opening shell in $1..."
    docker-compose -f docker-compose.dev.yml exec "$1" sh
}

# Function to install dependencies
install_dependencies() {
    print_info "Installing dependencies in all services..."
    
    # Install root dependencies
    print_info "Installing root dependencies..."
    npm install
    
    # Install frontend dependencies
    print_info "Installing frontend dependencies..."
    cd apps/frontend && npm install && cd ../..
    
    # Rebuild Docker images to include new dependencies
    print_info "Rebuilding Docker images..."
    docker-compose -f docker-compose.dev.yml build
    
    print_success "Dependencies installed successfully!"
}

# Main script logic
case "$1" in
    "up"|"start")
        start_services
        ;;
    "down"|"stop")
        stop_services
        ;;
    "restart")
        restart_services
        ;;
    "build")
        build_images
        ;;
    "rebuild")
        rebuild_images
        ;;
    "logs")
        show_logs "$2"
        ;;
    "status"|"ps")
        show_status
        ;;
    "clean")
        clean_resources
        ;;
    "shell"|"exec")
        open_shell "$2"
        ;;
    "install")
        install_dependencies
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac

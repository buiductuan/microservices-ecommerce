#!/bin/bash

# Microservices E-commerce Setup Script
# This script helps set up the development environment

set -e

echo "🚀 Setting up Microservices E-commerce Platform"
echo "==============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
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

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    commands=("node" "npm" "docker" "docker-compose")
    
    for cmd in "${commands[@]}"; do
        if ! command -v $cmd &> /dev/null; then
            print_error "$cmd is not installed. Please install it first."
            exit 1
        fi
    done
    
    # Check Node.js version
    node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 20 ]; then
        print_error "Node.js version 20 or higher is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "All requirements satisfied"
}

# Install NPM dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed"
}

# Create environment file
setup_environment() {
    if [ ! -f .env ]; then
        print_status "Creating environment file..."
        cp .env.example .env
        print_success "Environment file created. Please update .env with your settings."
        print_warning "Don't forget to update database passwords and API keys!"
    else
        print_warning ".env file already exists. Skipping..."
    fi
}

# Start infrastructure services
start_infrastructure() {
    print_status "Starting infrastructure services (PostgreSQL, Redis, Kafka)..."
    
    # Create docker network if it doesn't exist
    docker network create ecommerce-network 2>/dev/null || true
    
    docker-compose up -d postgres redis kafka zookeeper
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 30
    
    # Check if services are healthy
    if docker-compose ps | grep -q "Up (healthy)"; then
        print_success "Infrastructure services started successfully"
    else
        print_warning "Some services might not be fully ready yet. Check with 'docker-compose ps'"
    fi
}

# Build the application
build_application() {
    print_status "Building the application..."
    npm run build
    print_success "Application built successfully"
}

# Display next steps
show_next_steps() {
    echo ""
    echo "🎉 Setup completed successfully!"
    echo "================================"
    echo ""
    echo "Next steps:"
    echo "1. Update your .env file with proper credentials"
    echo "2. Start the microservices:"
    echo "   npm run start:dev user-service      # Terminal 1"
    echo "   npm run start:dev product-service   # Terminal 2"  
    echo "   npm run start:dev order-service     # Terminal 3"
    echo "   npm run start:dev notification-service # Terminal 4"
    echo "   npm run start:dev api-gateway       # Terminal 5"
    echo ""
    echo "3. Or use Docker Compose:"
    echo "   docker-compose up --build"
    echo ""
    echo "4. Access the application:"
    echo "   API Gateway: http://localhost:3000"
    echo "   Swagger Docs: http://localhost:3000/api/docs"
    echo ""
    echo "5. Check service health:"
    echo "   docker-compose ps"
    echo "   curl http://localhost:3000/health"
    echo ""
    print_success "Happy coding! 🚀"
}

# Main execution
main() {
    check_requirements
    install_dependencies
    setup_environment
    start_infrastructure
    
    # Ask if user wants to build
    read -p "Do you want to build the application now? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        build_application
    fi
    
    show_next_steps
}

# Handle interruption
trap 'echo -e "\n${RED}Setup interrupted${NC}"; exit 1' INT

# Run main function
main "$@"

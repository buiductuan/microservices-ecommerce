# E-Commerce Frontend

A modern React frontend application built with Ant Design Pro for managing the e-commerce microservices platform.

## Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Ant Design Pro** - Enterprise-class UI components
- **Vite** - Fast build tool and development server
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Axios** - HTTP client for API requests

## Features

- 🏠 **Dashboard** - Overview of key metrics and statistics
- 👥 **User Management** - CRUD operations for users
- 📦 **Product Management** - Manage products and inventory
- 🛒 **Order Management** - Track and manage orders
- 📢 **Notifications** - Send and track notifications
- 🔐 **Authentication** - Secure login/logout
- 📱 **Responsive Design** - Mobile-friendly interface
- 🎨 **Modern UI** - Clean and intuitive design with Ant Design Pro

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd apps/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout/         # Main layout component
├── pages/              # Page components
│   ├── Dashboard/      # Dashboard page
│   ├── Users/          # User management
│   ├── Products/       # Product management
│   ├── Orders/         # Order management
│   ├── Notifications/  # Notification management
│   └── Login/          # Authentication
├── services/           # API service layer
├── store/              # Redux store and slices
│   └── slices/        # Redux toolkit slices
└── App.tsx            # Main app component
```

## API Integration

The frontend communicates with the backend microservices through the API Gateway at `http://localhost:3001`. All requests are proxied through Vite's development server.

### Available Endpoints

- `/api/auth/*` - Authentication endpoints
- `/api/users/*` - User management
- `/api/products/*` - Product management
- `/api/orders/*` - Order management
- `/api/notifications/*` - Notification management

## State Management

Using Redux Toolkit for state management with the following slices:

- **authSlice** - Authentication state
- **userSlice** - User management state
- **productSlice** - Product management state
- **orderSlice** - Order management state
- **notificationSlice** - Notification management state

## Styling

- Ant Design Pro components for consistent UI
- Custom CSS for additional styling
- Responsive design with CSS Grid and Flexbox
- Theme customization through Ant Design's ConfigProvider

## Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

Create a `.env` file in the frontend directory:

```
VITE_API_BASE_URL=http://localhost:3001/api
```

## Contributing

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Follow Ant Design Pro patterns
4. Write meaningful component names
5. Add proper error handling
6. Test your changes

## License

This project is part of the microservices e-commerce platform.

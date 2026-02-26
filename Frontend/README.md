# Police Case Management System - Frontend

A modern React + TypeScript frontend application for the Police Case Management System, built with Vite, TailwindCSS, and React Router.

## Features

- 🏠 **Home Page** - Landing page with system overview
- 🔐 **Authentication** - Login and registration with role-based access
- 📊 **Dashboard** - Overview of cases, complaints, and statistics
- 📁 **Case Management** - View, filter, and manage police cases
- 🚨 **Complaints** - Review and process citizen complaints
- 🕵️ **Detective Board** - Manage active investigations
- ⚡ **Under Intense UnderPursuit** - High-priority cases requiring immediate attention
- 📈 **Reports** - Analytics and statistics
- 📄 **Documents** - Document registration and review
- 👥 **Admin Panel** - User management (Chief/Captain only)

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Vitest** - Testing framework

## Getting Started

### Prerequisites

- Node.js 20+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env with your API URL
VITE_API_BASE_URL=http://localhost:8000/api
```

### Development

```bash
# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
wp-front/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/          # Page components
│   ├── contexts/       # React contexts (Auth)
│   ├── services/       # API services
│   ├── types/          # TypeScript types
│   ├── utils/          # Utility functions
│   ├── hooks/          # Custom React hooks
│   └── test/           # Test files
└── public/             # Static assets
```

## Environment Variables

- `VITE_API_BASE_URL` - Backend API base URL (default: http://localhost:8000/api)

## Testing

The project includes unit tests using Vitest and React Testing Library:

```bash
npm test
```

## License

This project is part of a web programming course assignment.

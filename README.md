# School Management System

A comprehensive school automation system built with Next.js 14, TypeScript, and Prisma. Designed for Persian language schools with full RTL support and modern web technologies.

## Features

- **Student Management** - Complete student information and enrollment tracking
- **Attendance System** - Real-time attendance marking and monitoring
- **Financial Management** - Payment tracking and overdue notifications
- **Teacher Administration** - Class assignments and teacher management
- **Analytics Dashboard** - Real-time statistics and reporting
- **Communication Tools** - Announcements and parent notifications

## Technology Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (configurable to PostgreSQL)
- **UI**: Responsive design with RTL support for Persian

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone repository
git clone <repository-url>
cd schoolaut

# Install dependencies
npm install

# Setup database
npm run db:generate
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
schoolaut/
├── app/                    # Next.js pages and API routes
├── components/             # Reusable UI components
├── lib/                   # Utilities and database configuration
├── prisma/               # Database schema and migrations
└── public/               # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:seed` - Seed with sample data

## Database Schema

The system includes comprehensive models for:
- Students and class assignments
- Teachers and class management
- Attendance tracking with status and notes
- Payment records and financial tracking
- Announcements and communications

## API Endpoints

RESTful API endpoints are available for all major operations:
- `/api/students` - Student management
- `/api/attendance` - Attendance operations
- `/api/classes` - Class and teacher management
- `/api/financial` - Payment and financial data

## Development

The application uses modern development practices:
- TypeScript for type safety
- Prisma for database operations
- Tailwind CSS for styling
- Component-based architecture
- RESTful API design

## License

MIT License
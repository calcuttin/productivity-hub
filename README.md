# ProductivityHub

A modern, full-stack productivity application built with Next.js, designed to help you manage your research, workouts, projects, and calendar events in one unified platform.

## 🌟 Features

- **Research Management**: Organize and manage research materials efficiently
- **Workout Tracking**: Log and monitor your fitness journey
- **Calendar Integration**: Keep track of important dates and events
- **Project Management**: Organize and track your projects
- **Modern Authentication**: Secure user authentication system
- **Responsive Design**: Beautiful UI that works on all devices

## 🛠️ Tech Stack

- **Frontend**: 
  - Next.js 14
  - React 18
  - TypeScript
  - Tailwind CSS
- **Backend**:
  - Next.js API Routes
  - PostgreSQL
  - Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS for modern, responsive design

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Git
- PostgreSQL 14 or later

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/calcuttin/productivity-hub
   cd productivity-hub
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up PostgreSQL:
   - Install PostgreSQL if you haven't already
   - Create a new database for the project
   - Note down your database credentials

4. Set up environment variables:
   Create a `.env` file in the root directory and add necessary environment variables:
   ```
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/productivity_hub"
   
   # Authentication
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```

5. Initialize the database:
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev
   ```

6. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📁 Project Structure

```
productivity-hub/
├── src/
│   ├── app/          # Next.js app directory
│   ├── components/   # Reusable React components
│   ├── lib/          # Utility functions and libraries
│   ├── types/        # TypeScript type definitions
│   ├── context/      # React context providers
│   ├── hooks/        # Custom React hooks
│   ├── services/     # API and external service integrations
│   └── styles/       # Global styles and Tailwind config
├── prisma/          # Database schema and migrations
└── public/          # Static assets
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Inspired by Notion's clean and intuitive interface
- Built with Next.js and the amazing React ecosystem 
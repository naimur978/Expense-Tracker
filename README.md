# Expense Tracker Application

A full-stack expense tracking application built with React (TypeScript) and Django REST Framework, featuring authentication, expense management, and data visualization.

## Features

- 🔐 User Authentication (JWT)
- 💰 Expense Management (CRUD operations)
- 📊 Data Visualization with Charts
- 🔍 Advanced Filtering and Search
- 📱 Responsive Material-UI Design
- 🐳 Docker Containerization
- 🧪 Comprehensive Testing
- 🔄 Automated CI/CD with GitHub Actions

## Tech Stack

### Frontend
- React 18 with TypeScript
- Material-UI (MUI) for styling
- Chart.js for data visualization
- React Router for navigation
- React Testing Library & Jest for testing
- Emotion for styled components

### Backend
- Django 4.2
- Django REST Framework
- PostgreSQL Database
- JWT Authentication
- Django Filters
- Django CORS Headers

### DevOps & CI/CD
- Docker & Docker Compose
- GitHub Actions for automated testing and deployment
  - Frontend CI: TypeScript checks, ESLint, Jest tests
  - Backend CI: Python tests, Flake8 linting
- Multiple environment configurations
- Volume mounting for development

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js (for local development)
- Python 3.9+ (for local development)

### Running with Docker

1. Clone the repository:
```bash
git clone <repository-url>
cd expense-tracker
```

2. Start the application using Docker Compose:
```bash
docker-compose up --build
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

### Local Development Setup

#### Frontend

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run tests:
```bash
npm test
```

5. Type checking:
```bash
npm run typescript
```

6. Linting:
```bash
npm run lint
```

#### Backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run migrations:
```bash
python manage.py migrate
```

5. Create a superuser (optional):
```bash
python manage.py createsuperuser
```

6. Run the development server:
```bash
python manage.py runserver
```

## Project Structure

### Frontend Structure
```
frontend/
├── src/
│   ├── components/     # React components
│   │   ├── auth/      # Authentication components
│   │   ├── expenses/  # Expense management components
│   │   ├── reports/   # Data visualization components
│   │   └── layout/    # Layout components
│   ├── contexts/      # React contexts
│   ├── services/      # API services
│   ├── types/         # TypeScript types
│   └── utils/         # Utility functions
├── public/            # Static files
└── tests/             # Test files
```

### Backend Structure
```
backend/
├── authentication/    # User authentication app
├── expenses/         # Expense management app
├── backend/          # Project settings
└── manage.py         # Django management script
```

## Testing

### Frontend Testing
- Unit Tests: Components and utilities using React Testing Library
- Integration Tests: User flows and component interactions
- Context Testing: State management testing
- Test Coverage: Jest coverage reporting

Test files are co-located with their components for better maintainability.

### Backend Testing
- Model Tests: Database models and relationships
- API Tests: Endpoint testing with Django REST Framework
- Authentication Tests: JWT authentication flows
- Integration Tests: Full request/response cycle

## Environment Variables

### Frontend
- `REACT_APP_API_HOST`: API host (default: localhost)
- `REACT_APP_API_PORT`: API port (default: 8000)

### Backend
- `POSTGRES_DB`: Database name
- `POSTGRES_USER`: Database user
- `POSTGRES_PASSWORD`: Database password
- `POSTGRES_HOST`: Database host
- `DEBUG`: Debug mode flag

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment:

### Frontend CI
- Triggers on pushes and pull requests to main/master branches
- Node.js setup with dependency caching
- Runs Jest tests in non-watch mode
- Performs ESLint checks
- Validates TypeScript types
- Builds the production bundle

### Backend CI
- Triggers on pushes and pull requests to main/master branches
- Python 3.9 environment setup
- Runs Django tests
- Performs Flake8 linting with:
  - Critical error checks
  - Code complexity validation
  - PEP 8 style guide compliance

## Contribution

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
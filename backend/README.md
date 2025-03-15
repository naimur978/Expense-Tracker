# Expense Tracker

A full-stack expense tracking application built with Django REST Framework and React TypeScript.

## Features

- Track expenses with categories, amounts, and dates
- Filter and search expenses
- Visual reports with charts and summaries
- Responsive Material UI design
- TypeScript for type safety
- Comprehensive test coverage

## Tech Stack

### Backend
- Python 3.8+
- Django 4.2
- Django REST Framework
- PostgreSQL
- django-filter
- django-cors-headers

### Frontend
- React 18
- TypeScript
- Material UI
- Chart.js
- React Router
- Context API for state management
- Jest & React Testing Library

## Setup

### Backend Setup

1. Create a virtual environment and activate it:
```bash
python -m venv env
source env/bin/activate  # On Windows use: env\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up PostgreSQL database:
```bash
createdb expense_tracker
```

4. Run migrations:
```bash
python manage.py migrate
```

5. (Optional) Load sample data:
```bash
python manage.py seed_expenses
```

6. Start the development server:
```bash
python manage.py runserver 8001
```

### Frontend Setup

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

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001

## Testing

### Backend Tests
```bash
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## API Documentation

### Endpoints

- `GET /api/expenses/` - List all expenses
- `POST /api/expenses/` - Create a new expense
- `GET /api/expenses/{id}/` - Retrieve an expense
- `PUT /api/expenses/{id}/` - Update an expense
- `DELETE /api/expenses/{id}/` - Delete an expense
- `GET /api/expenses/summary/` - Get expense summary and statistics

### Filtering

The expenses endpoint supports the following filters:
- `category` - Filter by expense category
- `min_date` & `max_date` - Filter by date range
- `min_amount` & `max_amount` - Filter by amount range
- `description` - Search in expense descriptions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
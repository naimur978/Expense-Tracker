from django.test import TestCase, Client
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Expense
from decimal import Decimal
from datetime import date

class ExpenseModelTests(TestCase):
    def test_create_expense(self):
        """Test creating an expense entry"""
        expense = Expense.objects.create(
            description="Test Expense",
            amount=Decimal("50.00"),
            category="Food & Dining",
            date=date.today()
        )
        
        self.assertEqual(expense.description, "Test Expense")
        self.assertEqual(expense.amount, Decimal("50.00"))
        self.assertEqual(expense.category, "Food & Dining")
        self.assertEqual(expense.date, date.today())
        
    def test_expense_str_representation(self):
        """Test the string representation of an expense"""
        expense = Expense.objects.create(
            description="Lunch",
            amount=Decimal("25.50"),
            category="Food & Dining",
            date=date.today()
        )
        self.assertEqual(str(expense), "Lunch - 25.50")

class ExpenseAPITests(APITestCase):
    def setUp(self):
        """Set up test data"""
        self.client = Client()
        self.expense_data = {
            "description": "Test API Expense",
            "amount": "100.00",
            "category": "Shopping",
            "date": "2024-01-01"
        }
        self.url = reverse('expense-list')

    def test_create_expense_api(self):
        """Test creating an expense through the API"""
        response = self.client.post(
            self.url,
            self.expense_data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Expense.objects.count(), 1)
        expense = Expense.objects.get()
        self.assertEqual(expense.description, "Test API Expense")
        self.assertEqual(expense.amount, Decimal("100.00"))
        
    def test_create_expense_invalid_data(self):
        """Test creating an expense with invalid data"""
        invalid_data = {
            "description": "",  # Empty description
            "amount": "-50.00",  # Negative amount
            "category": "Invalid Category",
            "date": "2024-01-01"
        }
        
        response = self.client.post(
            self.url,
            invalid_data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Expense.objects.count(), 0)
        
    def test_get_expense_list(self):
        """Test getting list of expenses"""
        # Create test expenses
        Expense.objects.create(
            description="First Expense",
            amount=Decimal("75.00"),
            category="Entertainment",
            date="2024-01-01"
        )
        Expense.objects.create(
            description="Second Expense",
            amount=Decimal("125.00"),
            category="Transportation",
            date="2024-01-02"
        )
        
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)  # Checking pagination

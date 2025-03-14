from django.core.management.base import BaseCommand
from expenses.models import Expense
from decimal import Decimal
from datetime import date, timedelta

class Command(BaseCommand):
    help = 'Seeds the database with demo expense data'

    def handle(self, *args, **options):
        # Clear existing expenses
        Expense.objects.all().delete()

        # Demo expense data
        expenses = [
            {
                'description': 'Monthly Rent',
                'amount': Decimal('1200.00'),
                'category': 'Housing',
                'date': date.today() - timedelta(days=2)
            },
            {
                'description': 'Grocery Shopping',
                'amount': Decimal('85.50'),
                'category': 'Food & Dining',
                'date': date.today() - timedelta(days=1)
            },
            {
                'description': 'Electric Bill',
                'amount': Decimal('75.20'),
                'category': 'Utilities',
                'date': date.today() - timedelta(days=3)
            },
            {
                'description': 'Movie Night',
                'amount': Decimal('30.00'),
                'category': 'Entertainment',
                'date': date.today()
            },
            {
                'description': 'Gas',
                'amount': Decimal('45.00'),
                'category': 'Transportation',
                'date': date.today() - timedelta(days=1)
            }
        ]

        # Create expenses
        for expense_data in expenses:
            Expense.objects.create(**expense_data)
            self.stdout.write(
                self.style.SUCCESS(f'Created expense: {expense_data["description"]}')
            )

        self.stdout.write(
            self.style.SUCCESS('Successfully seeded demo expense data')
        )
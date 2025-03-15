from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from django_filters import rest_framework as filters
from rest_framework.decorators import action
from django.db.models import Sum
from django.db.models.functions import TruncMonth, TruncWeek, TruncYear
from django.db.models import Prefetch
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from .models import Expense
from .serializers import ExpenseSerializer

class ExpenseFilter(filters.FilterSet):
    min_date = filters.DateFilter(field_name='date', lookup_expr='gte')
    max_date = filters.DateFilter(field_name='date', lookup_expr='lte')
    category = filters.CharFilter(field_name='category')
    min_amount = filters.NumberFilter(field_name='amount', lookup_expr='gte')
    max_amount = filters.NumberFilter(field_name='amount', lookup_expr='lte')
    description = filters.CharFilter(field_name='description', lookup_expr='icontains')

    class Meta:
        model = Expense
        fields = ['min_date', 'max_date', 'category', 'min_amount', 'max_amount', 'description']

class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all().order_by('-date')
    serializer_class = ExpenseSerializer
    filterset_class = ExpenseFilter
    pagination_class = None  # Disable pagination for this viewset
    
    def create(self, request, *args, **kwargs):
        # Fast create response
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        # Fast delete response
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @method_decorator(cache_page(60))  # Cache summary for 1 minute
    @action(detail=False, methods=['get'])
    def summary(self, request):
        timeframe = request.query_params.get('timeframe', 'monthly')
        queryset = self.get_queryset()

        if timeframe == 'weekly':
            expenses = queryset.annotate(period=TruncWeek('date'))\
                .values('period')\
                .annotate(total=Sum('amount'))\
                .order_by('period')
        elif timeframe == 'monthly':
            expenses = queryset.annotate(period=TruncMonth('date'))\
                .values('period')\
                .annotate(total=Sum('amount'))\
                .order_by('period')
        else:  # yearly
            expenses = queryset.annotate(period=TruncYear('date'))\
                .values('period')\
                .annotate(total=Sum('amount'))\
                .order_by('period')

        category_totals = queryset.values('category')\
            .annotate(total=Sum('amount'))\
            .order_by('-total')

        return Response({
            'time_series': expenses,
            'category_totals': category_totals
        })

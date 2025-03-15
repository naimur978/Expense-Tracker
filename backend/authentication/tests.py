from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from unittest.mock import patch

User = get_user_model()

class AuthenticationTests(APITestCase):
    def setUp(self):
        self.client = Client()
        self.register_url = reverse('register')
        self.token_url = reverse('token_obtain_pair')
        self.token_refresh_url = reverse('token_refresh')
        self.google_login_url = reverse('google_login')
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123'
        }

    def test_user_registration(self):
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue('tokens' in response.data)
        self.assertTrue('user' in response.data)
        self.assertEqual(response.data['user']['username'], self.user_data['username'])
        self.assertEqual(response.data['user']['email'], self.user_data['email'])

    def test_user_registration_invalid_data(self):
        # Test missing fields
        invalid_data = {'username': 'testuser'}
        response = self.client.post(self.register_url, invalid_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_jwt_token_obtain(self):
        # Create a user first
        user = User.objects.create_user(
            username=self.user_data['username'],
            email=self.user_data['email'],
            password=self.user_data['password']
        )
        
        # Try to get tokens
        response = self.client.post(self.token_url, {
            'username': self.user_data['username'],
            'password': self.user_data['password']
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue('access' in response.data)
        self.assertTrue('refresh' in response.data)

    def test_jwt_token_refresh(self):
        # Create a user and get refresh token
        user = User.objects.create_user(
            username=self.user_data['username'],
            email=self.user_data['email'],
            password=self.user_data['password']
        )
        refresh = RefreshToken.for_user(user)
        
        response = self.client.post(self.token_refresh_url, {
            'refresh': str(refresh)
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue('access' in response.data)

    @patch('authentication.views.load_strategy')
    @patch('authentication.views.load_backend')
    def test_google_login(self, mock_load_backend, mock_load_strategy):
        # Mock the OAuth2 backend response
        mock_backend = mock_load_backend.return_value
        mock_backend.auth_url.return_value = 'https://accounts.google.com/o/oauth2/auth'
        
        response = self.client.get(self.google_login_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue('auth_url' in response.data)

    def test_verify_token(self):
        # Create a user and get tokens
        user = User.objects.create_user(
            username=self.user_data['username'],
            email=self.user_data['email'],
            password=self.user_data['password']
        )
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        
        # Test token verification
        response = self.client.post(
            reverse('verify_token'),
            HTTP_AUTHORIZATION=f'Bearer {access_token}'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['valid'])

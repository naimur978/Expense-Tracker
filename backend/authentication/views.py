from django.contrib.auth import get_user_model
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.db import IntegrityError
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
            if response.status_code == 200:
                user = User.objects.get(username=request.data['username'])
                response.data = {
                    'tokens': {
                        'access': response.data['access'],
                        'refresh': response.data['refresh']
                    },
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email
                    }
                }
            return response
        except (TokenError, InvalidToken) as e:
            logger.error(f"Token error: {str(e)}")
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    try:
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not username or not email or not password:
            return Response(
                {'error': 'Please provide username, email and password'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if username exists
        if User.objects.filter(username=username).exists():
            return Response(
                {'error': 'Username already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Check if email exists
        if User.objects.filter(email=email).exists():
            return Response(
                {'error': 'Email already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password
            )
        except IntegrityError:
            return Response(
                {'error': 'Failed to create user. Please try again.'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        refresh = RefreshToken.for_user(user)
        tokens = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
        
        return Response({
            'tokens': tokens,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_token(request):
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return Response(
                {'error': 'No token provided'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        return Response({'valid': True}, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Token verification error: {str(e)}")
        return Response(
            {'error': 'Token verification failed'},
            status=status.HTTP_401_UNAUTHORIZED
        )

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def health_check(request):
    return Response({'status': 'ok'}, status=200)

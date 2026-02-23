from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from accounts.models import User
from accounts.serializers import (
    UserSerializer, UserRegistrationSerializer, UserDetailsSerializer
)
from accounts.permissions import IsPoliceChief, IsCaptainOrHigher

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['role', 'is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'badge_number', 'phone_number']

    def get_serializer_class(self):
        if self.action == 'register' or self.action == 'create':
            return UserRegistrationSerializer
        if self.action in ['retrieve', 'update', 'me']:
            return UserDetailsSerializer
        return UserSerializer

    def get_permissions(self):
        if self.action in ['register', 'login', 'create']:
            return [AllowAny()]
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsCaptainOrHigher()]
        return [IsAuthenticated()]

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        serializer = UserDetailsSerializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'user': UserSerializer(user).data,
                'token': token.key,
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if user:
                token, created = Token.objects.get_or_create(user=user)
                return Response({
                    'user': UserSerializer(user).data,
                    'token': token.key,
                }, status=status.HTTP_200_OK)
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
        return Response({
            'error': 'Username and password are required.'
        }, status=status.HTTP_400_BAD_REQUEST)
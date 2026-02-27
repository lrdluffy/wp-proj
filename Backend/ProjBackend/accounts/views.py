from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, status, viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from accounts.models import User
from accounts.serializers import (
    UserSerializer, UserRegistrationSerializer, UserDetailsSerializer,
    LoginSerializer, LoginResponseSerializer
)
from accounts.permissions import IsPoliceChief, IsCaptainOrHigher

from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiExample, OpenApiParameter, OpenApiResponse
from drf_spectacular.types import OpenApiTypes

@extend_schema_view(
    list=extend_schema(
        description='List users (paginated).',
        responses={200: OpenApiTypes.OBJECT},
        examples=[OpenApiExample('List example', value={'count': 1, 'next': None, 'previous': None, 'results': [{'id': 1, 'username': 'jdoe', 'email': 'jdoe@example.com'}]}, response_only=True)]
    ),
    retrieve=extend_schema(
        description='Retrieve details for a single user.',
        responses={200: UserDetailsSerializer, 404: OpenApiResponse(description='Not found')},
        examples=[
            OpenApiExample('Retrieve example', value={'id': 1, 'username': 'jdoe', 'email': 'jdoe@example.com', 'first_name': 'John', 'last_name': 'Doe'}, response_only=True),
            OpenApiExample('Retrieve not found', value={'detail': 'Not found.'}, response_only=True),
        ]
    ),
    create=extend_schema(
        description='Create a new user (registration-like).',
        request=UserRegistrationSerializer,
        responses={201: UserDetailsSerializer, 400: OpenApiResponse(description='Validation error')},
        examples=[
            OpenApiExample('Create request', value={'username': 'jdoe', 'password': 'strongpassword', 'email': 'jdoe@example.com'}, request_only=True),
            OpenApiExample('Create response', value={'id': 1, 'username': 'jdoe', 'email': 'jdoe@example.com'}, response_only=True),
            OpenApiExample('Create validation error', value={'username': ['This field is required.'], 'password': ['This field is required.']}, response_only=True),
        ]
    ),
    update=extend_schema(
        description='Replace an existing user.',
        request=UserDetailsSerializer,
        responses={200: UserDetailsSerializer, 400: OpenApiResponse(description='Validation error')},
        examples=[
            OpenApiExample('Update response example', value={'id': 1, 'username': 'jdoe', 'email': 'jdoe@example.com', 'first_name': 'John', 'last_name': 'Doe'}, response_only=True),
            OpenApiExample('Update validation error', value={'email': ['Enter a valid email address.']}, response_only=True),
        ],
    ),
    partial_update=extend_schema(
        description='Partially update an existing user.',
        request=UserDetailsSerializer,
        responses={200: UserDetailsSerializer, 400: OpenApiResponse(description='Validation error')},
        examples=[
            OpenApiExample('Partial update response example', value={'id': 1, 'username': 'jdoe', 'email': 'jdoe@example.com'}, response_only=True),
            OpenApiExample('Partial update validation error', value={'first_name': ['This field may not be blank.']}, response_only=True),
        ],
    ),
    destroy=extend_schema(
        description='Delete a user.',
        responses={204: None, 404: OpenApiResponse(description='Not found')},
        examples=[OpenApiExample('Destroy not found', value={'detail': 'Not found.'}, response_only=True)],
    ),
)
@extend_schema(tags=['Accounts'], description='Operations related to users (registration, login, profile, management)')
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

    @extend_schema(
        responses=UserDetailsSerializer,
        examples=[
            OpenApiExample(
                'Me response',
                value={
                    'id': 1,
                    'username': 'jdoe',
                    'email': 'jdoe@example.com',
                    'first_name': 'John',
                    'last_name': 'Doe',
                    'role': 'officer',
                    'is_active': True,
                },
                response_only=True,
            )
        ],
    )
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        serializer = UserDetailsSerializer(request.user)
        return Response(serializer.data)
    
    @extend_schema(
        request=UserRegistrationSerializer,
        responses={201: OpenApiTypes.OBJECT, 400: OpenApiResponse(description='Validation error')},
        examples=[
            OpenApiExample(
                'Register request',
                value={
                    'username': 'jdoe',
                    'password': 'strongpassword',
                    'email': 'jdoe@example.com',
                    'first_name': 'John',
                    'last_name': 'Doe',
                },
                request_only=True,
            ),
            OpenApiExample(
                'Register response',
                value={
                    'user': {
                        'id': 1,
                        'username': 'jdoe',
                        'email': 'jdoe@example.com',
                    },
                    'token': 'abcd1234token'
                },
                response_only=True,
            )
        ],
    )
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

    @extend_schema(
        request=LoginSerializer,
        responses={
            200: LoginResponseSerializer,
            400: OpenApiResponse(description='Validation error'),
            401: OpenApiResponse(description='Unauthorized'),
            404: OpenApiResponse(description='Not found'),
        },
        examples=[
            OpenApiExample(
                'Login request',
                value={'username': 'jdoe', 'password': 'strongpassword'},
                request_only=True,
            ),
            OpenApiExample(
                'Login success response',
                value={
                    'user': {
                        'id': 1,
                        'username': 'jdoe',
                        'email': 'jdoe@example.com',
                    },
                    'token': 'abcd1234token'
                },
                response_only=True,
            ),
            OpenApiExample(
                'Login error response',
                value={'error': 'Invalid credentials'},
                response_only=True,
            ),
        ],
    )
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
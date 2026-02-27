from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from witnesses.models import WitnessStatement
from witnesses.serializers import WitnessStatementSerializer
from accounts.permissions import IsOfficerOrHigher
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiExample, OpenApiResponse
from drf_spectacular.types import OpenApiTypes


@extend_schema_view(
    list=extend_schema(
        description='List witness statements (paginated).',
        responses={200: OpenApiTypes.OBJECT},
        examples=[OpenApiExample('List example', value={'count': 1, 'next': None, 'previous': None, 'results': [{ 'id': 1, 'witness_name': 'Jane Doe', 'statement': 'Saw a person running away', 'statement_date': '2026-02-26T12:00:00Z'}] }, response_only=True)]
    ),
    retrieve=extend_schema(
        description='Retrieve a single witness statement by id.',
        responses={200: WitnessStatementSerializer, 404: OpenApiResponse(description="Not found")},
        examples=[OpenApiExample('Retrieve example', value={ 'id': 1, 'witness_name': 'Jane Doe', 'statement': 'Saw a person running away', 'statement_date': '2026-02-26T12:00:00Z'}, response_only=True)]
    ),
    create=extend_schema(
        description='Create a new witness statement.',
        request=WitnessStatementSerializer,
        responses={201: WitnessStatementSerializer, 400: OpenApiResponse(description="Validation error")},
        examples=[
            OpenApiExample(
                'Create example',
                value={ 'witness_name': 'Jane Doe', 'witness_phone': '0712345678', 'statement': 'Saw a person running away'},
                request_only=True,
            ),
            OpenApiExample(
                'Create validation error',
                value={
                    'witness_name': ['This field is required.'],
                    'statement': ['This field may not be blank.']
                },
                response_only=True,
            ),
        ]
    ),
    update=extend_schema(
        description='Replace an existing witness statement.',
        request=WitnessStatementSerializer,
        responses={200: WitnessStatementSerializer, 400: OpenApiResponse(description="Validation error")},
        examples=[
            OpenApiExample(
                'Update response example',
                value={ 'id': 1, 'witness_name': 'Jane Doe', 'witness_phone': '0712345678', 'statement': 'Updated statement', 'statement_date': '2026-02-26T12:00:00Z'},
                response_only=True,
            ),
            OpenApiExample(
                'Update validation error',
                value={'detail': 'Invalid data provided', 'errors': {'statement': ['Too long.']}},
                response_only=True,
            )
        ]
    ),
    partial_update=extend_schema(
        description='Partially update fields on a witness statement.',
        request=WitnessStatementSerializer,
        responses={200: WitnessStatementSerializer, 400: OpenApiResponse(description="Validation error")},
        examples=[
            OpenApiExample(
                'Partial update response example',
                value={ 'id': 1, 'witness_name': 'Jane Doe', 'statement': 'Partially updated statement'},
                response_only=True,
            ),
            OpenApiExample(
                'Partial update validation error',
                value={'statement': ['This field may not be blank.']},
                response_only=True,
            )
        ]
    ),
    destroy=extend_schema(
        description='Delete a witness statement.',
        responses={204: None, 404: OpenApiResponse(description="Not found")},
        examples=[
            OpenApiExample(
                'Not found error',
                value={'detail': 'Not found.'},
                response_only=True,
            )
        ],
    ),
)
@extend_schema(tags=['Witnesses'], description='Manage witness statements and associated metadata')
class WitnessStatementViewSet(viewsets.ModelViewSet):
    queryset = WitnessStatement.objects.all()
    serializer_class = WitnessStatementSerializer
    permission_classes = [IsAuthenticated, IsOfficerOrHigher]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['case', 'recorded_by', 'is_confidential', 'follow_up_required']
    search_fields = ['witness_name', 'witness_phone', 'witness_email', 'statement']
    ordering_fields = ['statement_date', 'created_at']
    ordering = ['-statement_date']

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)
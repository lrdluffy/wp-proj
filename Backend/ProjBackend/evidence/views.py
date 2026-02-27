from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
import os
import uuid
from datetime import datetime
from evidence.models import Evidence, BiologicalEvidence, MedicalEvidence, VehicleEvidence, IdentificationEvidence
from evidence.serializers import (
    EvidenceSerializer, BiologicalEvidenceSerializer, MedicalEvidenceSerializer,
    VehicleEvidenceSerializer, IdentificationEvidenceSerializer
)
from accounts.permissions import IsOfficerOrHigher
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiExample, OpenApiResponse
from drf_spectacular.types import OpenApiTypes


@extend_schema_view(
    list=extend_schema(
        description='List evidence items (paginated).',
        responses={200: OpenApiTypes.OBJECT},
        examples=[OpenApiExample('List example', value={'count':1,'next':None,'previous':None,'results':[{'id':1,'evidence_number':'EVID-1','description':'Knife','status':'IN_STORAGE'}]}, response_only=True)]
    ),
    retrieve=extend_schema(
        description='Retrieve a single evidence item by id.',
        responses={200: EvidenceSerializer, 404: OpenApiResponse(description='Not found')},
        examples=[OpenApiExample('Retrieve example', value={'id':1,'evidence_number':'EVID-1','description':'Knife','status':'IN_STORAGE'}, response_only=True)]
    ),
    create=extend_schema(
        description='Create a new evidence record.',
        request=EvidenceSerializer,
        responses={201: EvidenceSerializer, 400: OpenApiResponse(description='Validation error')},
        examples=[OpenApiExample('Create request', value={'case':1,'evidence_number':'EVID-1','description':'Knife'}, request_only=True), OpenApiExample('Create response', value={'id':1,'case':1,'evidence_number':'EVID-1','description':'Knife','status':'COLLECTED'}, response_only=True)]
    ),
    update=extend_schema(
        description='Replace an existing evidence record.',
        request=EvidenceSerializer,
        responses={200: EvidenceSerializer, 400: OpenApiResponse(description='Validation error')},
    ),
    partial_update=extend_schema(
        description='Partially update an evidence record.',
        request=EvidenceSerializer,
        responses={200: EvidenceSerializer, 400: OpenApiResponse(description='Validation error')},
    ),
    destroy=extend_schema(
        description='Delete an evidence record.',
        responses={204: None, 404: OpenApiResponse(description='Not found')},
    ),
)
class EvidenceViewSet(viewsets.ModelViewSet):
    queryset = Evidence.objects.all()
    serializer_class = EvidenceSerializer
    permission_classes = [IsAuthenticated, IsOfficerOrHigher]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['case', 'evidence_type', 'status', 'collected_by']
    search_fields = ['evidence_number', 'description', 'location_found']
    ordering_fields = ['collected_at', 'created_at']
    ordering = ['-created_at']

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=['post'], url_path='upload-document')
    @extend_schema(
        description='Upload a document file and attach it to the evidence record.',
        request={
            'multipart/form-data': {
                'schema': {
                    'type': 'object',
                    'properties': {
                        'file': {'type': 'string', 'format': 'binary'}
                    },
                    'required': ['file']
                }
            }
        },
        responses={201: OpenApiTypes.OBJECT, 400: OpenApiResponse(description='Validation error')},
        examples=[
            OpenApiExample('Upload request', value={'file': '(binary file)'}, request_only=True),
            OpenApiExample('Upload response', value={'message': 'Document uploaded successfully', 'file': {'name': 'doc.pdf', 'path': 'evidence/documents/uuid.pdf', 'url': '/media/evidence/documents/uuid.pdf'}}, response_only=True),
            OpenApiExample('Upload error', value={'error': 'No file provided'}, response_only=True),
        ]
    )
    def upload_document(self, request, pk=None):
        """Upload a document file to evidence"""
        evidence = self.get_object()
        
        if 'file' not in request.FILES:
            return Response(
                {'error': 'No file provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        file = request.FILES['file']
        
        file_ext = os.path.splitext(file.name)[1]
        filename = f"{uuid.uuid4()}{file_ext}"
        upload_path = os.path.join('evidence/documents', filename)
        
        file_path = default_storage.save(upload_path, ContentFile(file.read()))
        
        file_url = os.path.join(settings.MEDIA_URL, file_path).replace('\\', '/')
        
        documents = evidence.documents or []
        documents.append({
            'name': file.name,
            'path': file_path,
            'url': file_url,
            'uploaded_at': datetime.now().isoformat(),
            'uploaded_by': request.user.id
        })
        evidence.documents = documents
        evidence.save()
        
        return Response({
            'message': 'Document uploaded successfully',
            'file': {
                'name': file.name,
                'path': file_path,
                'url': file_url
            }
        }, status=status.HTTP_201_CREATED)


@extend_schema_view(
    list=extend_schema(description='List biological evidence items.', responses={200: OpenApiTypes.OBJECT}),
    retrieve=extend_schema(description='Retrieve biological evidence.', responses={200: BiologicalEvidenceSerializer, 404: OpenApiResponse(description='Not found')}),
    create=extend_schema(request=BiologicalEvidenceSerializer, responses={201: BiologicalEvidenceSerializer, 400: OpenApiResponse(description='Validation error')}),
    update=extend_schema(request=BiologicalEvidenceSerializer, responses={200: BiologicalEvidenceSerializer, 400: OpenApiResponse(description='Validation error')}),
    partial_update=extend_schema(request=BiologicalEvidenceSerializer, responses={200: BiologicalEvidenceSerializer, 400: OpenApiResponse(description='Validation error')}),
    destroy=extend_schema(responses={204: None, 404: OpenApiResponse(description='Not found')}),
)
class BiologicalEvidenceViewSet(viewsets.ModelViewSet):
    queryset = BiologicalEvidence.objects.all()
    serializer_class = BiologicalEvidenceSerializer
    permission_classes = [IsAuthenticated, IsOfficerOrHigher]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['case', 'status']
    search_fields = ['evidence_number', 'sample_type', 'lab_reference_number']


@extend_schema_view(
    list=extend_schema(description='List medical evidence items.', responses={200: OpenApiTypes.OBJECT}),
    retrieve=extend_schema(description='Retrieve medical evidence.', responses={200: MedicalEvidenceSerializer, 404: OpenApiResponse(description='Not found')}),
    create=extend_schema(request=MedicalEvidenceSerializer, responses={201: MedicalEvidenceSerializer, 400: OpenApiResponse(description='Validation error')}),
    update=extend_schema(request=MedicalEvidenceSerializer, responses={200: MedicalEvidenceSerializer, 400: OpenApiResponse(description='Validation error')}),
    partial_update=extend_schema(request=MedicalEvidenceSerializer, responses={200: MedicalEvidenceSerializer, 400: OpenApiResponse(description='Validation error')}),
    destroy=extend_schema(responses={204: None, 404: OpenApiResponse(description='Not found')}),
)
class MedicalEvidenceViewSet(viewsets.ModelViewSet):
    queryset = MedicalEvidence.objects.all()
    serializer_class = MedicalEvidenceSerializer
    permission_classes = [IsAuthenticated, IsOfficerOrHigher]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['case', 'status', 'examiner']
    search_fields = ['evidence_number', 'description']


@extend_schema_view(
    list=extend_schema(description='List vehicle evidence items.', responses={200: OpenApiTypes.OBJECT}),
    retrieve=extend_schema(description='Retrieve vehicle evidence.', responses={200: VehicleEvidenceSerializer, 404: OpenApiResponse(description='Not found')}),
    create=extend_schema(request=VehicleEvidenceSerializer, responses={201: VehicleEvidenceSerializer, 400: OpenApiResponse(description='Validation error')}),
    update=extend_schema(request=VehicleEvidenceSerializer, responses={200: VehicleEvidenceSerializer, 400: OpenApiResponse(description='Validation error')}),
    partial_update=extend_schema(request=VehicleEvidenceSerializer, responses={200: VehicleEvidenceSerializer, 400: OpenApiResponse(description='Validation error')}),
    destroy=extend_schema(responses={204: None, 404: OpenApiResponse(description='Not found')}),
)
class VehicleEvidenceViewSet(viewsets.ModelViewSet):
    queryset = VehicleEvidence.objects.all()
    serializer_class = VehicleEvidenceSerializer
    permission_classes = [IsAuthenticated, IsOfficerOrHigher]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['case', 'status']
    search_fields = ['evidence_number', 'vehicle_license_plate', 'vin_number']


@extend_schema_view(
    list=extend_schema(description='List identification evidence items.', responses={200: OpenApiTypes.OBJECT}),
    retrieve=extend_schema(description='Retrieve identification evidence.', responses={200: IdentificationEvidenceSerializer, 404: OpenApiResponse(description='Not found')}),
    create=extend_schema(request=IdentificationEvidenceSerializer, responses={201: IdentificationEvidenceSerializer, 400: OpenApiResponse(description='Validation error')}),
    update=extend_schema(request=IdentificationEvidenceSerializer, responses={200: IdentificationEvidenceSerializer, 400: OpenApiResponse(description='Validation error')}),
    partial_update=extend_schema(request=IdentificationEvidenceSerializer, responses={200: IdentificationEvidenceSerializer, 400: OpenApiResponse(description='Validation error')}),
    destroy=extend_schema(responses={204: None, 404: OpenApiResponse(description='Not found')}),
)
class IdentificationEvidenceViewSet(viewsets.ModelViewSet):
    queryset = IdentificationEvidence.objects.all()
    serializer_class = IdentificationEvidenceSerializer
    permission_classes = [IsAuthenticated, IsOfficerOrHigher]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['case', 'status', 'document_type']
    search_fields = ['evidence_number', 'document_number']
from django.urls import path, include
from rest_framework.routers import SimpleRouter
from evidence.views import (
    EvidenceViewSet, BiologicalEvidenceViewSet, MedicalEvidenceViewSet,
    VehicleEvidenceViewSet, IdentificationEvidenceViewSet
)

router = SimpleRouter()
router.register(r'evidence', EvidenceViewSet, basename='evidence')
router.register(r'evidence/biological', BiologicalEvidenceViewSet, basename='biological-evidence')
router.register(r'evidence/medical', MedicalEvidenceViewSet, basename='medical-evidence')
router.register(r'evidence/vehicle', VehicleEvidenceViewSet, basename='vehicle-evidence')
router.register(r'evidence/identification', IdentificationEvidenceViewSet, basename='identification-evidence')

urlpatterns = [
    path('', include(router.urls)),
]

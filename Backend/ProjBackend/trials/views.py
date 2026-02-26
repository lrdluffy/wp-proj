from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from trials.models import Trial
from trials.serializers import TrialSerializer
from accounts.permissions import IsDetectiveOrHigher


class TrialViewSet(viewsets.ModelViewSet):
    queryset = Trial.objects.all()
    serializer_class = TrialSerializer
    permission_classes = [IsAuthenticated, IsDetectiveOrHigher]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['case', 'suspect', 'status', 'verdict', 'court_name']
    search_fields = ['trial_number', 'judge_name', 'prosecutor_name', 'defense_attorney_name']
    ordering_fields = ['scheduled_date', 'started_date', 'completed_date']
    ordering = ['-scheduled_date']

    def get_permissions(self):
        # اجازه مشاهده (List و Retrieve) برای همه نقش‌های پلیس (از جمله نیما)
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]

        # برای عملیات حساس (ایجاد، ویرایش، حذف) همان شرط قبلی کارآگاه به بالا
        return [IsAuthenticated(), IsDetectiveOrHigher()]
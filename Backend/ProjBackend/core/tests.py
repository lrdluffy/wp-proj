from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from accounts.models import Role
from core.models import Case, CrimeLevel, CaseStatus

User = get_user_model()


class CaseModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='detective',
            password='testpass',
            role=Role.DETECTIVE
        )
        self.case = Case.objects.create(
            case_number='CASE001',
            title='Test Case',
            description='Test description',
            crime_level=CrimeLevel.LEVEL_2,
            status=CaseStatus.PENDING,
            created_by=self.user,
            reported_at=timezone.now()
        )

    def test_case_creation(self):
        self.assertEqual(self.case.case_number, 'CASE001')
        self.assertEqual(self.case.crime_level, CrimeLevel.LEVEL_2)
        self.assertFalse(self.case.is_closed)

    def test_case_closed_status(self):
        self.case.status = CaseStatus.CLOSED
        self.case.save()
        self.assertTrue(self.case.is_closed)


class CaseAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='detective',
            password='testpass',
            role=Role.DETECTIVE
        )
        self.client.force_authenticate(user=self.user)

    def test_create_case(self):
        data = {
            'case_number': 'CASE002',
            'title': 'New Case',
            'description': 'Case description',
            'crime_level': CrimeLevel.LEVEL_3,
            'reported_at': timezone.now().isoformat()
        }
        response = self.client.post('/api/cases/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['case_number'], 'CASE002')

    def test_list_cases(self):
        Case.objects.create(
            case_number='CASE003',
            title='List Test',
            description='Test',
            created_by=self.user,
            reported_at=timezone.now()
        )
        response = self.client.get('/api/cases/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data['results']), 0)
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from complaints.models import Complaint, ComplaintStatus
from accounts.models import Role

User = get_user_model()


class ComplaintModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='officer',
            password='testpass',
            role=Role.POLICE_OFFICER
        )
        self.complaint = Complaint.objects.create(
            complaint_number='COMP001',
            complainant_name='John Doe',
            complainant_phone='1234567890',
            subject='Test Complaint',
            description='Complaint description',
            incident_date=timezone.now(),
            incident_location='Test Location',
            received_by=self.user
        )

    def test_complaint_creation(self):
        self.assertEqual(self.complaint.complaint_number, 'COMP001')
        self.assertEqual(self.complaint.status, ComplaintStatus.SUBMITTED)


class ComplaintAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='officer',
            password='testpass',
            role=Role.POLICE_OFFICER
        )
        self.client.force_authenticate(user=self.user)

    def test_create_complaint(self):
        data = {
            'complaint_number': 'COMP002',
            'complainant_name': 'Jane Doe',
            'complainant_phone': '0987654321',
            'subject': 'New Complaint',
            'description': 'Description',
            'incident_date': timezone.now().isoformat(),
            'incident_location': 'Location'
        }
        response = self.client.post('/api/complaints/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['complaint_number'], 'COMP002')
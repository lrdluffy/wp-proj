from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import Role

User = get_user_model()


class UserModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            role=Role.DETECTIVE,
            badge_number='BDG001'
        )

    def test_user_creation(self):
        self.assertEqual(self.user.username, 'testuser')
        self.assertEqual(self.user.role, Role.DETECTIVE)
        self.assertTrue(self.user.check_password('testpass123'))

    def test_user_role_methods(self):
        self.assertTrue(self.user.is_detective())
        self.assertFalse(self.user.is_chief())

    def test_user_can_handle_crime_level(self):
        self.assertTrue(self.user.can_handle_crime_level(2))
        self.assertTrue(self.user.can_handle_crime_level(3))
        self.assertFalse(self.user.can_handle_crime_level(1))


class UserApiTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            role=Role.DETECTIVE
        )

    def test_user_registration(self):
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newpass123',
            'password2': 'newpass123',
            'role': Role.POLICE_OFFICER
        }
        response = self.client.post('/api/auth/users/register/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)

    def test_user_login(self):
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post('/api/auth/users/login/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)

    def test_get_current_user(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/auth/users/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from accounts.models import User

class UserSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    full_name = serializers.CharField(source='get_full_name', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'role', 'role_display', 'badge_number',
            'phone_number', 'is_active', 'date_joined', 'created_at'
        ]
        read_only_fields = ['id', 'date_joined', 'created_at']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'role', 'badge_number', 'phone_number',
        ]

    def validate(self, attrs):
        if attrs.get('password') != attrs.get('password_confirm'):
            raise serializers.ValidationError({'password': "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserDetailsSerializer(UserSerializer):
    class Meta:
        model = User
        fields = UserSerializer.Meta.fields + ['last_login']


class LoginSerializer(serializers.Serializer):
    """Serializer for login requests."""
    username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)


class LoginResponseSerializer(serializers.Serializer):
    """Serializer for successful login responses."""
    user = UserSerializer()
    token = serializers.CharField(read_only=True)

from rest_framework import serializers

from .models import Trial


class TrialSerializer(serializers.ModelSerializer):
    """
    Serializer for Trial model used inside CaseSerializer.get_trials.
    """

    class Meta:
        model = Trial
        fields = "__all__"
from rest_framework import serializers
from models import User, Activity, Process


class UserSerializer(serializers.ModelSerializer):
     class Meta:
        model = User

class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity

class ProcessSerializer(serializers.ModelSerializer):
    participants = serializers.SlugRelatedField(many=True, read_only=True, slug_field='name')
    activity= serializers.SlugRelatedField(read_only=True, slug_field='name')
    class Meta:
        model = Process


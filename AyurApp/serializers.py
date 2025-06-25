from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import UserProfile, ChatHistory
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        validators=[
            UniqueValidator(
                queryset=User.objects.all(),
                message="A user with this email already exists."
            )
        ]
    )
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        UserProfile.objects.create(user=user)
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        # Use filter() instead of get() to handle multiple users with the same email
        users = User.objects.filter(email=data['email'])
        
        if not users.exists():
            raise serializers.ValidationError("No account found with this email.")
        
        # If multiple users have the same email, try to authenticate with each one
        for user in users:
            authenticated_user = authenticate(username=user.username, password=data['password'])
            if authenticated_user and authenticated_user.is_active:
                return authenticated_user
                
        # If no user authenticates successfully
        raise serializers.ValidationError("Incorrect Credentials")

class ChatHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatHistory
        fields = ('id', 'question', 'answer', 'timestamp') 
from django.contrib import admin
from .models import UserProfile, ChatHistory

# Register your models here.
admin.site.register(UserProfile)
admin.site.register(ChatHistory)

from django.contrib import admin
from aabill.models import User
class UserAdmin(admin.ModelAdmin):
        pass
admin.site.register(User,UserAdmin)

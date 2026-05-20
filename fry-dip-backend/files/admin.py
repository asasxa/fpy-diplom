from django.contrib import admin
from .models import File

@admin.register(File)
class FileAdmin(admin.ModelAdmin):

    list_display = ('id', 'original_name', 'owner', 'size', 'uploaded_at', 'special_link')
    list_filter = ('owner', 'uploaded_at')
    search_fields = ('original_name', 'comment', 'owner__username')
    readonly_fields = ('special_link', 'uploaded_at', 'last_downloaded_at')
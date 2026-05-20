from rest_framework import serializers
from .models import File

class FileSerializer(serializers.ModelSerializer):
    download_url = serializers.SerializerMethodField()
    special_link = serializers.ReadOnlyField()

    class Meta:
        model = File
        fields = ('id', 'original_name', 'comment', 'size', 'uploaded_at',
                  'last_downloaded_at', 'special_link', 'download_url')
        read_only_fields = ('size', 'uploaded_at', 'last_downloaded_at',
                            'special_link', 'download_url')

    def get_download_url(self, obj):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(f'/api/files/{obj.id}/download/')
        return None

class FileUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    comment = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_file(self, value):
        if value.size > 100 * 1024 * 1024:
            raise serializers.ValidationError("Файл слишком большой (макс. 100 МБ)")
        return value


class FileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ('id', 'original_name', 'comment')
        extra_kwargs = {
            'original_name': {'required': False},
            'comment': {'required': False}
        }
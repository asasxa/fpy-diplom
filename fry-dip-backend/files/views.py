import os
import uuid
import logging
import traceback
from django.conf import settings
from django.http import FileResponse
from django.utils import timezone
from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import File
from .serializers import FileSerializer, FileUploadSerializer, FileUpdateSerializer

logger = logging.getLogger(__name__)


class IsFileOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.is_authenticated and (obj.owner == request.user or request.user.is_admin)


class FileListView(generics.ListAPIView):
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = File.objects.select_related('owner')
        if self.request.user.is_admin:
            owner_id = self.request.query_params.get('owner_id')
            return qs.filter(owner_id=owner_id) if owner_id else qs
        return qs.filter(owner=self.request.user)

    def get_serializer_context(self):
        return {'request': self.request}


class FileUploadView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        try:
            serializer = FileUploadSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            uploaded_file = serializer.validated_data['file']
            comment = serializer.validated_data.get('comment', '')

            ext = os.path.splitext(uploaded_file.name)[1]
            unique_name = f"{uuid.uuid4()}{ext}"

            user_dir = os.path.join(settings.STORAGE_BASE_DIR, request.user.storage_path)
            os.makedirs(user_dir, exist_ok=True)

            full_path = os.path.join(user_dir, unique_name)
            with open(full_path, 'wb+') as dest:
                for chunk in uploaded_file.chunks():
                    dest.write(chunk)

            rel_path = os.path.relpath(full_path, settings.STORAGE_BASE_DIR)
            file_obj = File.objects.create(
                owner=request.user,
                original_name=uploaded_file.name,
                size=uploaded_file.size,
                comment=comment,
                file_path=rel_path
            )
            logger.info(f"Upload: пользователь {request.user.username} загрузил {uploaded_file.name}")
            return Response(FileSerializer(file_obj, context={'request': request}).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Ошибка загрузки файла: {e}\n{traceback.format_exc()}")
            error_response = {"error": "Ошибка сервера при загрузке", "error_type": type(e).__name__}
            if settings.DEBUG:
                error_response["details"] = str(e)
                error_response["traceback"] = traceback.format_exc().split('\n')
            return Response(error_response, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FileDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = File.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsFileOwnerOrAdmin]

    def get_serializer_class(self):
        return FileUpdateSerializer if self.request.method == 'PATCH' else FileSerializer

    def get_serializer_context(self):
        return {'request': self.request}

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            full_path = os.path.join(settings.STORAGE_BASE_DIR, instance.file_path)
            if os.path.exists(full_path):
                os.remove(full_path)
            instance.delete()
            logger.info(f"Delete: пользователь {request.user.username} удалил файл {instance.id}")
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            logger.error(f"Ошибка удаления файла {kwargs.get('pk')}: {e}\n{traceback.format_exc()}")
            error_response = {"error": "Ошибка при удалении файла", "error_type": type(e).__name__}
            if settings.DEBUG:
                error_response["details"] = str(e)
                error_response["traceback"] = traceback.format_exc().split('\n')
            return Response(error_response, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FileDownloadView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsFileOwnerOrAdmin]

    def get(self, request, pk):
        try:
            file_obj = File.objects.get(pk=pk)
        except File.DoesNotExist:
            return Response({"error": "Файл не найден"}, status=status.HTTP_404_NOT_FOUND)

        self.check_object_permissions(request, file_obj)

        full_path = os.path.join(settings.STORAGE_BASE_DIR, file_obj.file_path)
        full_path = os.path.normpath(full_path)

        if not os.path.isfile(full_path):
            return Response({"error": "Файл отсутствует на диске"}, status=status.HTTP_404_NOT_FOUND)

        try:
            file_obj.last_downloaded_at = timezone.now()
            file_obj.save()
            logger.info(f"Download: пользователь {request.user.username} скачал {file_obj.original_name}")

            is_preview = request.query_params.get('preview') == '1'
            content_type = file_obj.content_type or 'application/octet-stream'

            return FileResponse(
                open(full_path, 'rb'),
                as_attachment=not is_preview,
                filename=file_obj.original_name if not is_preview else None,
                content_type=content_type
            )
        except PermissionError:
            return Response({"error": "Нет прав доступа к файлу (PermissionError)", "error_type": "PermissionError"}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            logger.error(f"Ошибка скачивания файла {pk}: {e}\n{traceback.format_exc()}")
            error_response = {"error": "Ошибка при чтении файла", "error_type": type(e).__name__}
            if settings.DEBUG:
                error_response["details"] = str(e)
                error_response["traceback"] = traceback.format_exc().split('\n')
            return Response(error_response, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SpecialLinkDownloadView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, link):
        try:
            file_obj = File.objects.get(special_link=link)
        except File.DoesNotExist:
            return Response({"error": "Ссылка недействительна"}, status=status.HTTP_404_NOT_FOUND)

        full_path = os.path.join(settings.STORAGE_BASE_DIR, file_obj.file_path)
        full_path = os.path.normpath(full_path)

        if not os.path.isfile(full_path):
            return Response({"error": "Файл отсутствует на диске"}, status=status.HTTP_404_NOT_FOUND)

        try:
            file_obj.last_downloaded_at = timezone.now()
            file_obj.save()
            logger.info(f"Special Download: скачивание по ссылке {link} файла {file_obj.original_name}")
            return FileResponse(
                open(full_path, 'rb'),
                as_attachment=True,
                filename=file_obj.original_name
            )
        except PermissionError:
            return Response({"error": "Нет прав доступа к файлу (PermissionError)", "error_type": "PermissionError"}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            logger.error(f"Ошибка скачивания по спецссылке {link}: {e}\n{traceback.format_exc()}")
            error_response = {"error": "Ошибка при чтении файла", "error_type": type(e).__name__}
            if settings.DEBUG:
                error_response["details"] = str(e)
                error_response["traceback"] = traceback.format_exc().split('\n')
            return Response(error_response, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
from django.urls import path
from .views import (FileListView, FileUploadView, FileDetailView,
                    FileDownloadView, SpecialLinkDownloadView)

urlpatterns = [
    path('', FileListView.as_view(), name='file-list'),
    path('upload/', FileUploadView.as_view(), name='file-upload'),
    path('<int:pk>/', FileDetailView.as_view(), name='file-detail'),
    path('<int:pk>/download/', FileDownloadView.as_view(), name='file-download'),
    path('special/<uuid:link>/', SpecialLinkDownloadView.as_view(), name='file-special-download'),
]
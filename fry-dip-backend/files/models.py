import uuid
from django.db import models
from django.conf import settings

class File(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='files',
        verbose_name='владелец'
    )
    original_name = models.CharField('оригинальное имя файла', max_length=255, default='')
    size = models.PositiveBigIntegerField('размер файла (байты)')
    uploaded_at = models.DateTimeField('дата загрузки', auto_now_add=True)
    last_downloaded_at = models.DateTimeField('последнее скачивание', null=True, blank=True)
    comment = models.TextField('комментарий', blank=True, default='')
    file_path = models.CharField('путь к файлу в хранилище', max_length=500, default='')
    special_link = models.UUIDField('специальная ссылка', default=uuid.uuid4, unique=True, editable=False)

    def __str__(self):
        return f"{self.original_name} ({self.owner.username})"

    class Meta:
        verbose_name = 'Файл'
        verbose_name_plural = 'Файлы'
        ordering = ['-uploaded_at']
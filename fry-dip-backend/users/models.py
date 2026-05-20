import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator

class User(AbstractUser):
    username_validator = RegexValidator(
        regex=r'^[a-zA-Z][a-zA-Z0-9]{3,19}$',
        message='Логин: только латиница и цифры, начинается с буквы, длина 4-20 символов.'
    )

    username = models.CharField(
        'login', max_length=20, unique=True, validators=[username_validator],
        help_text='Логин (латиница, цифры, 4-20 символов)'
    )
    full_name = models.CharField('полное имя', max_length=100)
    is_admin = models.BooleanField('администратор', default=False)
    storage_path = models.CharField('путь к хранилищу', max_length=255, unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.storage_path:
            self.storage_path = str(uuid.uuid4())
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username
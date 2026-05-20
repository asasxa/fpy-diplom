import logging
from rest_framework import status, generics, views, permissions
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission
from django.contrib.auth import authenticate, login, logout
from .models import User
from .serializers import RegisterUserSerializer, UserSerializer

logger = logging.getLogger(__name__)


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_admin)


class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterUserSerializer

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        logger.info(f"Регистрация: пользователь {response.data.get('username')} успешно создан")
        return response


class LoginView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({"error": "Необходимо указать логин и пароль"}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            logger.info(f"Вход: пользователь {username} авторизован")
            return Response({"message": "Успешная аутентификация", "is_admin": user.is_admin},
                            status=status.HTTP_200_OK)

        logger.warning(f"Отказ во входе: неверные данные для {username}")
        return Response({"error": "Неверный логин или пароль"}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        logger.info(f"Выход: пользователь {request.user.username} завершил сессию")
        return Response({"message": "Успешный выход"}, status=status.HTTP_200_OK)


class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all()


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_admin:
            logger.warning(f"Попытка удаления без прав: {request.user.username}")
            return Response({"error": "Удаление доступно только администратору"}, status=status.HTTP_403_FORBIDDEN)
        instance = self.get_object()
        instance.delete()
        logger.info(f"Удаление: админ {request.user.username} удалил пользователя {instance.username}")
        return Response({"message": "Пользователь удален"}, status=status.HTTP_200_OK)

    def partial_update(self, request, *args, **kwargs):
        if not request.user.is_admin:
            return Response({"error": "Изменение прав доступно только администратору"},
                            status=status.HTTP_403_FORBIDDEN)
        return super().partial_update(request, *args, **kwargs)

class CurrentUserView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
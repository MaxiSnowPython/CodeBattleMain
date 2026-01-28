from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse, JsonResponse
from django.views import View
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from .models import UserProfile, Friendship

User = get_user_model()

# Create your views here.

class ProfileView(View):
    """Страница профиля"""
    
    def get(self, request):
        token_str = request.GET.get("token")
        if not token_str:
            return HttpResponse("No token pls go away", status=403)
        
        try:
            access = AccessToken(token_str)
            user_id = access["user_id"]
            username = access.get("username", f"user_{user_id}")
            
            # Получаем или создаем пользователя
            user, created = User.objects.get_or_create(id=user_id)
            if user.username != username:
                user.username = username
                user.save()
            
            # Получаем или создаем профиль
            profile, created = UserProfile.objects.get_or_create(user=user)
            
            # Получаем список друзей
            friends_sent = Friendship.objects.filter(
                from_user=user, 
                status='accepted'
            ).values_list('to_user', flat=True)
            
            friends_received = Friendship.objects.filter(
                to_user=user, 
                status='accepted'
            ).values_list('from_user', flat=True)
            
            friend_ids = list(friends_sent) + list(friends_received)
            friends = User.objects.filter(id__in=friend_ids)
            
            # Формируем список друзей с данными
            friends_data = []
            for friend in friends:
                friend_profile, _ = UserProfile.objects.get_or_create(user=friend)
                friends_data.append({
                    'id': friend.id,
                    'username': friend.username,
                    # ИСПОЛЬЗУЕМ свойство avatar_url
                    'avatar': friend_profile.avatar_url, 
                    'is_online': friend_profile.is_online,
                })
            
            # Получаем входящие запросы на дружбу
            friend_requests = Friendship.objects.filter(
                to_user=user, 
                status='pending'
            )
            
            context = {
                'token': token_str,
                'username': user.username,
                'email': user.email if user.email else '',
                # ИСПОЛЬЗУЕМ свойство avatar_url
                'avatar_url': profile.avatar_url, 
                'bio': profile.bio,
                'games_played': profile.games_played,
                'games_won': profile.games_won,
                'friends_count': len(friends_data),
                'friends': friends_data,
                'friend_requests': friend_requests,
                'friend_requests_count': friend_requests.count(),
            }
            
            return render(request, 'profile.html', context)
        
        except Exception as e:
            # Важно: выводим ошибку в консоль сервера, чтобы вы видели детали
            import traceback
            traceback.print_exc()
            return HttpResponse(f"Ошибка авторизации: {e}", status=403)

class AddFriendView(View):
    """Добавить друга"""
    
    def post(self, request):
        token_str = request.GET.get("token")
        if not token_str:
            return HttpResponse("No token pls go away", status=403)
        
        try:
            access = AccessToken(token_str)
            user_id = access["user_id"]
            user = User.objects.get(id=user_id)
            
            username = request.POST.get('username')
            
            # Находим пользователя
            try:
                to_user = User.objects.get(username=username)
            except User.DoesNotExist:
                return redirect(f'/profile/?token={token_str}')
            
            # Проверяем что не добавляем себя
            if to_user == user:
                return redirect(f'/profile/?token={token_str}')
            
            # Проверяем нет ли уже запроса
            existing = Friendship.objects.filter(
                from_user=user,
                to_user=to_user
            ).first()
            
            if not existing:
                # Проверяем не друзья ли уже
                already_friends = Friendship.objects.filter(
                    from_user=to_user,
                    to_user=user,
                    status='accepted'
                ).exists()
                
                if not already_friends:
                    # Создаем запрос
                    Friendship.objects.create(
                        from_user=user,
                        to_user=to_user
                    )
            
            return redirect(f'/profile/?token={token_str}')
        
        except Exception as e:
            return HttpResponse(f"Ошибка: {e}", status=403)


class AcceptFriendView(View):
    """Принять запрос в друзья"""
    
    def post(self, request, friendship_id):
        token_str = request.GET.get("token")
        if not token_str:
            return HttpResponse("No token pls go away", status=403)
        
        try:
            access = AccessToken(token_str)
            user_id = access["user_id"]
            user = User.objects.get(id=user_id)
            
            friendship = get_object_or_404(
                Friendship, 
                id=friendship_id, 
                to_user=user
            )
            
            friendship.status = 'accepted'
            friendship.save()
            
            return redirect(f'/profile/?token={token_str}')
        
        except Exception as e:
            return HttpResponse(f"Ошибка: {e}", status=403)


class RejectFriendView(View):
    """Отклонить запрос"""
    
    def post(self, request, friendship_id):
        token_str = request.GET.get("token")
        if not token_str:
            return HttpResponse("No token pls go away", status=403)
        
        try:
            access = AccessToken(token_str)
            user_id = access["user_id"]
            user = User.objects.get(id=user_id)
            
            friendship = get_object_or_404(
                Friendship, 
                id=friendship_id, 
                to_user=user
            )
            
            friendship.delete()
            
            return redirect(f'/profile/?token={token_str}')
        
        except Exception as e:
            return HttpResponse(f"Ошибка: {e}", status=403)


class RemoveFriendView(View):
    """Удалить из друзей"""
    
    def post(self, request, user_id):
        token_str = request.GET.get("token")
        if not token_str:
            return HttpResponse("No token pls go away", status=403)
        
        try:
            access = AccessToken(token_str)
            current_user_id = access["user_id"]
            user = User.objects.get(id=current_user_id)
            
            friend = get_object_or_404(User, id=user_id)
            
            # Удаляем дружбу в обе стороны
            Friendship.objects.filter(
                from_user=user,
                to_user=friend
            ).delete()
            
            Friendship.objects.filter(
                from_user=friend,
                to_user=user
            ).delete()
            
            return redirect(f'/profile/?token={token_str}')
        
        except Exception as e:
            return HttpResponse(f"Ошибка: {e}", status=403)


class UpdateProfileView(View):
    """Обновить профиль"""
    
    def post(self, request):
        token_str = request.GET.get("token")
        if not token_str:
            return HttpResponse("No token pls go away", status=403)
        
        try:
            access = AccessToken(token_str)
            user_id = access["user_id"]
            user = User.objects.get(id=user_id)
            
            profile, created = UserProfile.objects.get_or_create(user=user)
            
            # Обновляем аватар если загружен
            if 'avatar' in request.FILES:
                profile.avatar = request.FILES['avatar']
                profile.save()
            
            # Обновляем био если есть
            bio = request.POST.get('bio')
            if bio is not None:
                profile.bio = bio
                profile.save()
            
            return redirect(f'/profile/?token={token_str}')
        
        except Exception as e:
            return HttpResponse(f"Ошибка: {e}", status=403)
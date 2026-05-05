import os
from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse, JsonResponse, HttpResponseRedirect
from django.views import View
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from .models import *

User = get_user_model()


class ProfileView(View):

    def get(self, request):
        token_str = request.COOKIES.get("access_token")
        if not token_str:
            return HttpResponse("No token pls go away", status=403)

        try:
            access = AccessToken(token_str)
            user_id = access["user_id"]
            username = access.get("username", f"user_{user_id}")

            user, created = User.objects.get_or_create(id=user_id)
            if user.username != username:
                user.username = username
                user.save()

            profile, created = UserProfile.objects.get_or_create(user=user)

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

            friends_data = []
            for friend in friends:
                friend_profile, _ = UserProfile.objects.get_or_create(user=friend)
                friends_data.append({
                    'id': friend.id,
                    'username': friend.username,
                    'avatar': friend_profile.avatar_url,
                    'is_online': friend_profile.is_online,
                })

            friend_requests = Friendship.objects.filter(
                to_user=user,
                status='pending'
            )

            context = {
                'token': token_str,
                'username': user.username,
                'email': user.email if user.email else '',
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
            import traceback
            traceback.print_exc()
            return HttpResponse(f"Ошибка авторизации: {e}", status=403)


class AddFriendView(View):

    def post(self, request):
        token_str = request.COOKIES.get("access_token")
        if not token_str:
            return HttpResponse("No token pls go away", status=403)

        try:
            access = AccessToken(token_str)
            user_id = access["user_id"]
            user = User.objects.get(id=user_id)

            username = request.POST.get('username')

            try:
                to_user = User.objects.get(username=username)
            except User.DoesNotExist:
                return redirect(f'/profile/')

            if to_user == user:
                return redirect(f'/profile/')

            existing = Friendship.objects.filter(
                from_user=user,
                to_user=to_user
            ).first()

            if not existing:
                already_friends = Friendship.objects.filter(
                    from_user=to_user,
                    to_user=user,
                    status='accepted'
                ).exists()

                if not already_friends:
                    Friendship.objects.create(
                        from_user=user,
                        to_user=to_user
                    )

            return redirect(f'/profile/')

        except Exception as e:
            return HttpResponse(f"Ошибка: {e}", status=403)


class AcceptFriendView(View):

    def post(self, request, friendship_id):
        token_str = request.COOKIES.get("access_token")
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

            return redirect(f'/profile/')

        except Exception as e:
            return HttpResponse(f"Ошибка: {e}", status=403)


class RejectFriendView(View):

    def post(self, request, friendship_id):
        token_str = request.COOKIES.get("access_token")
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

            return redirect(f'/profile/')

        except Exception as e:
            return HttpResponse(f"Ошибка: {e}", status=403)


class RemoveFriendView(View):

    def post(self, request, user_id):
        token_str = request.COOKIES.get("access_token")
        if not token_str:
            return HttpResponse("No token pls go away", status=403)

        try:
            access = AccessToken(token_str)
            current_user_id = access["user_id"]
            user = User.objects.get(id=current_user_id)

            friend = get_object_or_404(User, id=user_id)

            Friendship.objects.filter(
                from_user=user,
                to_user=friend
            ).delete()

            Friendship.objects.filter(
                from_user=friend,
                to_user=user
            ).delete()

            return redirect(f'/profile/')

        except Exception as e:
            return HttpResponse(f"Ошибка: {e}", status=403)


class UpdateProfileView(View):

    def post(self, request):
        token_str = request.COOKIES.get("access_token")
        if not token_str:
            return HttpResponse("No token pls go away", status=403)

        try:
            access = AccessToken(token_str)
            user_id = access["user_id"]
            user = User.objects.get(id=user_id)

            profile, created = UserProfile.objects.get_or_create(user=user)

            if 'avatar' in request.FILES:
                if profile.avatar:
                    profile.avatar.delete(save=False)
                profile.avatar = request.FILES['avatar']
                profile.save()

            bio = request.POST.get('bio')
            if bio is not None:
                profile.bio = bio
                profile.save()

            return redirect(f'/profile/')

        except Exception as e:
            return HttpResponse(f"Ошибка: {e}", status=403)


class ChatHistoryView(View):
    def get(self, request, username):
        token_str = request.COOKIES.get("access_token")
        try:
            access = AccessToken(token_str)
            user = User.objects.get(id=access["user_id"])
            other_user = User.objects.get(username=username)

            messages = Message.objects.filter(
                (models.Q(sender=user, receiver=other_user) |
                 models.Q(sender=other_user, receiver=user))
            ).order_by('timestamp')[:50]

            data = [{
                'sender': m.sender.username,
                'content': m.content,
                'timestamp': m.timestamp.strftime('%H:%M')
            } for m in messages]

            return JsonResponse({'messages': data})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=403)


class LogoutView(View):
    def get(self, request):
        token_str = request.COOKIES.get("access_token")

        if token_str:
            try:
                access = AccessToken(token_str)
                user_id = access["user_id"]
                username = access["username"]
                profile = UserProfile.objects.get(user_id=user_id)
                profile.is_online = False
                profile.save()
            except Exception:
                pass

        response = HttpResponseRedirect(os.environ.get("AUTH_URL", "") + "/auth/login/")
        print(f"ydalen{username}")
        response.delete_cookie('access_token')

        return response


class RatingView(View):

    def get(self, request):
        token_str = request.COOKIES.get("access_token")
        if not token_str:
            return HttpResponse("No token pls go away", status=403)

        try:
            access = AccessToken(token_str)
            user_id = access["user_id"]
            current_user = User.objects.get(id=user_id)

            current_profile, _ = UserProfile.objects.get_or_create(user=current_user)

            all_profiles = UserProfile.objects.select_related('user').all()

            top_players = sorted(
                all_profiles,
                key=lambda p: (p.games_won, p.win_rate),
                reverse=True
            )

            rating_data = []
            for index, profile in enumerate(top_players, start=1):
                rating_data.append({
                    'rank': index,
                    'user': profile.user,
                    'avatar': profile.avatar.url if profile.avatar else None,
                    'games_played': profile.games_played,
                    'games_won': profile.games_won,
                    'win_rate': profile.win_rate,
                    'is_current_user': profile.user.id == current_user.id,
                    'is_online': profile.is_online,
                })

            current_user_rank = None
            for item in rating_data:
                if item['is_current_user']:
                    current_user_rank = item['rank']
                    break

            context = {
                'current_user': current_user,
                'current_profile': current_profile,
                'current_user_rank': current_user_rank,
                'total_players': len(rating_data),
                'rating_data': rating_data,
            }

            return render(request, 'rating.html', context)

        except Exception as e:
            import traceback
            traceback.print_exc()
            return HttpResponse(f"Ошибка: {e}", status=403)

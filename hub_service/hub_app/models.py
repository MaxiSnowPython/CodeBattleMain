from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class UserProfile(models.Model):

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    
    # Статистика
    games_played = models.IntegerField(default=0)
    games_won = models.IntegerField(default=0)
    
    # Статус
    is_online = models.BooleanField(default=False)
    @property
    def avatar_url(self):
        if self.avatar and hasattr(self.avatar, 'url'):
            return self.avatar.url
        return None
    def __str__(self):
        return f"Profile - {self.user.username}"


class Friendship(models.Model):

    from_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_requests')
    to_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_requests')
    status = models.CharField(
        max_length=10,
        choices=[
            ('pending', 'Ожидание'),
            ('accepted', 'Принято'),
        ],
        default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.from_user.username} -> {self.to_user.username}"
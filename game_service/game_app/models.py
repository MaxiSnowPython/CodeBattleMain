from django.db import models
from django.contrib.auth import get_user_model

# Create your models here

User = get_user_model()

class Task(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    initial_code = models.TextField(
        blank=True, 
        null=True,
        default="# Входные данные: a, b\n# Сохраните результат в переменную result\n\nresult = a + b"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    tests = models.JSONField(
        help_text='Формат: [{"variables": {"a": 1, "b": 2}, "expected": 3}]'
    )
    
    def __str__(self):
        return self.title

class GameRoom(models.Model):
    match_id = models.CharField(max_length=255, unique=True)
    player1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player1_rooms',null=True,blank=True)
    player2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player2_rooms',null=True,blank=True)

    task = models.ForeignKey(Task, on_delete=models.CASCADE,related_name="Task", null=True,blank=True)     

    is_active = models.BooleanField(default=True)
    is_finished = models.BooleanField(default=False)

    winner_name = models.CharField(max_length=100, null=True, blank=True)


class TaskSubmission(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    code = models.TextField()
    is_correct = models.BooleanField(default=False)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-submitted_at"]

# game_app/models.py
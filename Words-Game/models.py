from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    email = models.EmailField(unique=True)        
    timestamp = models.DateTimeField(auto_now_add=True)

class Date(models.Model):
    month = models.IntegerField()
    day = models.IntegerField()
    year = models.IntegerField()
    word = models.TextField(max_length=5) # will change if team decides to add more letters

    class Meta:
        unique_together = ['month', 'day', 'year']

    def __str__(self):
        return f"{self.month}/{self.day}/{self.year}"

class Game(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='games')
    date = models.ForeignKey(Date, on_delete=models.CASCADE, related_name='games')
    date_completed = models.DateTimeField(auto_now_add=True)
    right_or_wrong = models.BooleanField()
    score = models.IntegerField(blank=True, null=True) 

    def __str__(self):
        return f"Game by {self.user.username} on {self.date}"

class Guess(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='guesses')
    guess_number = models.IntegerField()  # should be 1-6
    guessed_word = models.TextField(max_length=5)

    def __str__(self):
        return f"Guess {self.guess_number} in {self.game}"

from django.db import models

# Create your models here.


class CalendarEvent(models.Model):
    username = models.CharField(max_length=10)
    title = models.CharField(max_length=60)
    start = models.DateTimeField()
    end = models.DateTimeField()
    isDraggable = models.BooleanField()
    isResizable = models.BooleanField()

from django.db import models
# Create your models here.

from django.contrib.auth.models import User

from courses.models import Year, Course


class ARiProfile(models.Model):
    user = models.OneToOneField(User, unique=True)
    year = models.ForeignKey(Year)
    courses = models.ManyToManyField(Course)

    def __str__(self):
        return "ARi Profile: " + self.user.username

    class Meta:
        verbose_name = 'ARi Profile'
        verbose_name_plural = 'ARi Profiles'

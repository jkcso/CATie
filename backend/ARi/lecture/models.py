from django.core.validators import RegexValidator
from django.db import models

from courses.models import Course
from lecture.utils import reformat_for_url
from login.models import ARiProfile


class Lecture(models.Model):
    urlSafe = RegexValidator(r'^[a-zA-Z0-9]*$', 'Only alphanumeric characters '
                                                'and \'-\' are allowed.')

    name = models.CharField(max_length=60)
    urlName = models.CharField(max_length=60, validators=[urlSafe],
                               default="", editable=False)
    course = models.ForeignKey(Course)
    video = models.URLField(blank=True)
    slides = models.URLField(blank=True)

    def __str__(self):
        return str(self.course.code) + ' Lecture: ' + self.name

    def save(self, *args, **kwargs):
        if not self.urlName:
            self.urlName = reformat_for_url(self.name)
        super(Lecture, self).save(*args, **kwargs)

    class Meta:
        unique_together = (("urlName", "course"),)


class UserNotes(models.Model):
    profile = models.ForeignKey(ARiProfile)
    lecture = models.ForeignKey(Lecture)
    notes = models.TextField()

    unique_together = (("profile", "lecture"),)

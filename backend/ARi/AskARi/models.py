from django.core.validators import validate_comma_separated_integer_list
from django.utils import timezone

from django.contrib.contenttypes.models import ContentType
from django.db import models

# Create your models here.
from django.db.transaction import atomic

from AskARi.utils import next_id
from lecture.models import Lecture
from login.models import ARiProfile


class Question(models.Model):
    title = models.CharField(max_length=100)
    body = models.TextField(max_length=4000)
    parent = models.ForeignKey(Lecture)
    poster = models.ForeignKey(ARiProfile)
    id_per_lecture = models.PositiveIntegerField(editable=False)
    last_interaction = models.DateTimeField(default=timezone.now,
                                            editable=False)

    def __str__(self):
        return 'Question ' + str(self.id_per_lecture) + ' by ' + \
               self.poster.user.username + ': ' + self.title

    def save(self, *args, **kwargs):
        if not self.pk:
            self.id_per_lecture = next_id(self.__class__, self.parent,
                                          'id_per_lecture')
        self.last_interaction = timezone.now()
        super(Question, self).save(*args, **kwargs)

    class Meta:
        unique_together = (('parent', 'id_per_lecture'),)


class Comment(models.Model):
    content = models.TextField(max_length=4000)
    poster = models.ForeignKey(ARiProfile, related_name='poster_set')
    score = models.IntegerField(default=0)
    id_per_question = models.PositiveIntegerField(editable=False)
    parent = models.ForeignKey(Question, verbose_name='Question',
                               on_delete=models.CASCADE)
    upvoters = models.ManyToManyField(ARiProfile, related_name='upvoted_set',
                                      editable=False)
    downvoters = models.ManyToManyField(ARiProfile, related_name='downvoted_set',
                                        editable=False)

    # Direct parent, null if top-level comment
    parent_comment = models.ForeignKey("Comment", blank=True,
                                       related_name='children',
                                       null=True, default=None,
                                       on_delete=models.CASCADE)

    def __str__(self):
        return 'Comment ' + str(self.id_per_question) + ' by ' + \
               self.poster.user.username + ' on question: ' + \
               str(self.parent_id)

    def save(self, *args, **kwargs):
        if not self.pk:
            self.id_per_question = next_id(self.__class__, self.parent,
                                           'id_per_question')
        super(Comment, self).save(*args, **kwargs)

    def rate(self, profile, rating):
        if rating < -1 or rating > 1:
            raise ValueError('Attempting to apply a score > |1|.')
        previous_vote = 0
        with atomic():
            if profile.upvoted_set.filter(
                    parent=self.parent,
                    id_per_question=self.id_per_question).exists():
                previous_vote = 1
                # ARiProfile.objects.get(user=profile.user,
                #                        upvoted__parent=self.parent,
                #                        upvoted__id_per_question=
                #                        self.id_per_question)
                # previous_vote = 1
            elif profile.downvoted_set.filter(
                    parent=self.parent,
                    id_per_question=self.id_per_question).exists():
                previous_vote = -1
                    # ARiProfile.objects.get(user=profile.user,
                    #                        downvoted__parent=self.parent,
                    #                        downvoted__id_per_question=
                    #                        self.id_per_question)
                    # previous_vote = -1
            if previous_vote == rating:
                raise AssertionError('User has already voted this way.')
            else:
                if previous_vote == 1:
                    self.upvoters.remove(profile)
                    self.score -= 1
                elif previous_vote == -1:
                    self.downvoters.remove(profile)
                    self.score += 1
                if rating == 1:
                    self.upvoters.add(profile)
                elif rating == -1:
                    self.downvoters.add(profile)
                self.score += rating
                self.save()

    class Meta:
        unique_together = (('parent', 'id_per_question'),)


class QuestionAndCurrentUser(models.Model):
    question = models.ForeignKey(Question)
    profile = models.ForeignKey(ARiProfile)
    relevant_comment_ids = models.TextField(
            validators=[validate_comma_separated_integer_list])

    def __init__(self, *args, **kwargs):
        super(QuestionAndCurrentUser, self).__init__(*args, **kwargs)
        relevant_comments = self.profile.upvoted_set.filter(
            parent=self.question)
        id_string = ''
        for comment in relevant_comments:
            id_string += str(comment.id_per_question) + ','
        self.relevant_comment_ids = id_string[:-1]

    class Meta:
        managed = False

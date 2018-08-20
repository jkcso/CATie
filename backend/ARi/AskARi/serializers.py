from rest_framework import serializers

from AskARi.models import Question, Comment, QuestionAndCurrentUser
from login.models import ARiProfile


class CommentSerializer(serializers.ModelSerializer):
    poster = serializers.SlugRelatedField(source='poster.user',
                                          read_only=True,
                                          slug_field='username')
    questionId = serializers.SlugRelatedField(source='parent',
                                            read_only=True,
                                            slug_field='id_per_lecture')
    parentId = serializers.SlugRelatedField(source='parent_comment',
                                          read_only=True,
                                          slug_field='id_per_question')
    commentId = serializers.IntegerField(source='id_per_question', min_value=1)

    class Meta:
        model = Comment
        fields = ('content', 'poster', 'score', 'questionId', 'commentId',
                  'parentId', 'children')


class QuestionSerializer(serializers.ModelSerializer):
    lecture = serializers.SlugRelatedField(source='parent',
                                           read_only=True,
                                           slug_field='urlName')
    lectureTitle = serializers.SlugRelatedField(source='parent',
                                                read_only=True,
                                                slug_field='name')
    course = serializers.SlugRelatedField(source='parent.course',
                                          read_only=True,
                                          slug_field='code')
    poster = serializers.SlugRelatedField(source='poster.user',
                                          read_only=True,
                                          slug_field='username')
    id = serializers.IntegerField(source='id_per_lecture', min_value=1)

    class Meta:
        model = Question
        fields = ('title', 'body', 'lecture', 'lectureTitle', 'course',
                  'poster', 'id')


class QuestionFullSerializer(QuestionSerializer):
    comment_set = CommentSerializer(many=True)

    class Meta:
        model = Question
        fields = QuestionSerializer.Meta.fields + ('comment_set',)


class QuestionAndCurrentUserSerializer(serializers.ModelSerializer):
    upvotes = serializers.CharField(source='relevant_comment_ids')

    def to_representation(self, instance):
        ret = super(QuestionAndCurrentUserSerializer,
                    self).to_representation(instance)
        q_serializer = QuestionFullSerializer(instance.question,
                                              context=self.context)
        q_ret = q_serializer.to_representation(instance.question)

        for key in q_ret:
            ret[key] = q_ret[key]

        return ret

    class Meta:
        model = QuestionAndCurrentUser
        fields = ('upvotes',)

# class ReplySerializer(serializers.ModelSerializer):
#     poster = serializers.SlugRelatedField(source='poster.user',
#                                           read_only=True,
#                                           slug_field='username')
#
#     class Meta:
#         abstract = True
#         model = Reply
#         fields = ('content', 'poster', 'score')
#
#
# class FollowUpSerializer(ReplySerializer):
#     comment = serializers.SlugRelatedField(source='parent',
#                                            read_only=True,
#                                            slug_field='id_per_parent')
#
#     class Meta:
#         model = Comment
#         fields = ReplySerializer.Meta.fields + ('comment',)

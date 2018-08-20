from rest_framework import serializers

from lecture.models import Lecture, UserNotes


class LectureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lecture
        fields = ('name', 'video', 'slides')


class LectureManySerializer(serializers.ModelSerializer):
    class Meta:
        model = Lecture
        fields = ('name', 'urlName')


class LectureAndNotesSerializer(serializers.ModelSerializer):

    def to_representation(self, instance):
        ret = super(LectureAndNotesSerializer, self).to_representation(instance)
        l_serializer = LectureSerializer(instance.lecture,
                                         context=self.context)
        l_ret = l_serializer.to_representation(instance.lecture)

        for key in l_ret:
            ret[key] = l_ret[key]

        return ret

    class Meta:
        model = UserNotes
        fields = ('notes',)

from rest_framework import serializers

from login.models import ARiProfile


# Unused and broken
# class ARiProfileSerializer(serializers.ModelSerializer):
#     user = serializers.SlugRelatedField(slug_field='username')
#
#     class Meta:
#         model = ARiProfile
#         fields = ('user',)

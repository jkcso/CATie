from django.http import HttpResponseNotFound, HttpResponseForbidden

from courses.models import Course
from login.models import ARiProfile


def can_access_course(user, code):
    try:
        profile = ARiProfile.objects.get(user=user)
        course = Course.objects.get(code=code)
    except ARiProfile.DoesNotExist:
        return False, HttpResponseNotFound("User does not have an ARiProfile.")
    except Course.DoesNotExist:
        return False, HttpResponseNotFound("Invalid course code.")

    return course in profile.courses.all(), \
        HttpResponseForbidden(user.username + ' does not take course ' + code)

from django.conf.urls import url

from courses import views

urlpatterns = [
    url(r'^courses/$', views.get_courses),
    url(r'^courses/(?P<code>[0-9]{3})/$', views.get_lectures),
]

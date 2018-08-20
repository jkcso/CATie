from django.conf.urls import url
from planner import views

urlpatterns = [
    url(r'^calendar/$', views.CalendarEventList.as_view()),
    url(r'^calendar/(?P<code>[0-9]+)/$', views.CalendarEventDetail.as_view()),
]
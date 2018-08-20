from django.conf.urls import url

from AskARi import views

base = r'^AskARi/'

urlpatterns = [
    url(base + 'question/create/$', views.create_question),
    url(base + 'question/(?P<code>[0-9]{3})/(?P<lectureURL>[a-zA-Z0-9-]{1,'
        r'60})/(?P<q_id>[0-9]+)/$', views.get_question),
    url(base + 'question/(?P<code>[0-9]{3})/(?P<lectureURL>[a-zA-Z0-9-]{1,'
        r'60})/(?P<q_id>[0-9]+)/reply/$', views.post_comment),
    url(base + 'question/(?P<code>[0-9]{3})/(?P<lectureURL>[a-zA-Z0-9-]{1,'
               r'60})/(?P<q_id>[0-9]+)/(?P<c_id>[0-9]+)/rate/$',
        views.rate_comment),
    url(base + '$', views.get_questions),
    url(base + '#(?P<pg_no>[0-9]+)$', views.get_questions),
    url(base + '(?P<code>[0-9]{3})/$', views.get_questions),
    url(base + '(?P<code>[0-9]{3})/#(?P<pg_no>[0-9]+)$', views.get_questions),
    url(base + '(?P<code>[0-9]{3})/(?P<lectureURL>[a-zA-Z0-9-]{1,60})/$',
        views.get_questions),
    url(base + '(?P<code>[0-9]{3})/(?P<lectureURL>[a-zA-Z0-9-]{1,60})/#('
        r'?P<pg_no>[0-9]+)$', views.get_questions),
]

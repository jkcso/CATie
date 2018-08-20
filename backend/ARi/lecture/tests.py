# Create your tests here.
import json

from django.contrib.auth.models import User, Group
from django.test import Client, TestCase
from rest_framework import status
from rest_framework_jwt.utils import jwt_decode_handler

from courses.models import Year, Course
from lecture.models import Lecture
from lecture.utils import reformat_for_url
from login.models import ARiProfile


class LectureTests(TestCase):
    dummy_lecture = None
    username = "admin"
    password = "fakepassword"
    token = None
    name = "Concurrent Execution"
    conc_crse = None
    video = "https://imperial.cloud.panopto.eu/Panopto/Pages/Embed.aspx?id" \
            "=5154e0fc-84a3-4747-92fa-38c6db73d920"
    create_name = "Shared Objects & Mutual Exclusion"

    def setUpData(self):
        User.objects.create_superuser(username=self.username,
                                      email="admin@admin.com",
                                      password=self.password)
        c2 = Group.objects.create(name='c2')
        year2 = Year.objects.create(number=2, group=c2)
        conc_grp = Group.objects.create(name='Concurrency')
        self.conc_crse = Course.objects.create(name='Concurrency', code=223,
                                               ofYear=year2,
                                               group=conc_grp)
        self.dummy_lecture = Lecture.objects.create(name=self.name,
                                                    course=self.conc_crse,
                                                    video=self.video)

    def loginAdmin(self):
        c = Client()
        resp = c.post('/login/', data={'username': self.username,
                                       'password': self.password})
        resp_content_str = resp.content.decode('utf-8')
        resp_content_json = json.loads(resp_content_str)
        self.token = resp_content_json['token']

    def test_get_lecture(self):
        self.setUpData()
        self.loginAdmin()
        c = Client()
        url = '/courses/' + str(self.conc_crse.code) + '/' + \
              reformat_for_url(self.name) + '/'
        resp = c.get(url, HTTP_AUTHORIZATION=self.token)
        resp_content_str = resp.content.decode('utf-8')
        resp_content_json = json.loads(resp_content_str)
        self.assertEqual(resp_content_json['name'], self.name)
        self.assertEqual(resp_content_json['video'], self.video)

    def test_create_lecture(self):
        self.setUpData()
        self.loginAdmin()
        c = Client()
        resp = c.post('/lectures/create/',
                      data={'name': self.create_name,
                            'code': self.conc_crse.code,
                            'video': self.video},
                      HTTP_AUTHORIZATION=self.token)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        url = '/courses/' + str(self.conc_crse.code) + '/' + \
              reformat_for_url(self.create_name) + '/'
        resp = c.get(url, HTTP_AUTHORIZATION=self.token)
        resp_content_str = resp.content.decode('utf-8')
        resp_content_json = json.loads(resp_content_str)
        self.assertEqual(resp_content_json['name'], self.create_name)
        self.assertEqual(resp_content_json['video'], self.video)

    def test_general_exists_but_cannot_be_directly_accessed(self):
        self.setUpData()
        self.loginAdmin()
        url = '/courses/' + str(self.conc_crse.code) + '/general/'
        c = Client()
        resp = c.get(url, HTTP_AUTHORIZATION=self.token)
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)
        raised = False
        try:
            general = self.conc_crse.lecture_set.get(name="General")
            self.assertTrue(general)
        except:
            raised = True
        self.assertFalse(raised)


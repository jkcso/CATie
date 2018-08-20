import json

from django.contrib.auth.models import Group, User
from django.test import TestCase, Client

# Create your tests here.
from rest_framework_jwt.utils import jwt_decode_handler

from courses.models import Year, Course
from lecture.models import Lecture
from login.models import ARiProfile


class CourseTests(TestCase):
    c = None

    username = 'arc13'
    password = 'shoutout2allthePears'
    token = None
    c1 = None
    c2 = None
    conc_grp = None
    arch_grp = None
    year1 = None
    year2 = None
    conc_crse = None
    arch_crse = None
    sesh = None

    ruhi_course_list = [{'code': 210, 'name': 'Architecture'},
                        {'code': 223, 'name': 'Concurrency'}]

    def setUpGroups(self):
        self.c2 = Group.objects.create(name='c2')
        self.c1 = Group.objects.create(name='c1')
        self.conc_grp = Group.objects.create(name='Concurrency')
        self.arch_grp = Group.objects.create(name='Architecture')
        self.year1 = Year.objects.create(number=1, group=self.c1)
        self.year2 = Year.objects.create(number=2, group=self.c2)
        self.conc_crse = Course.objects.create(name="Concurrency", code=223,
                                               ofYear=self.year2,
                                               group=self.conc_grp)
        self.arch_crse = Course.objects.create(name="Architecture", code=210,
                                               ofYear=self.year2,
                                               group=self.arch_grp)
        self.sesh = Lecture.objects.create(name="Concurrent Execution",
                                           course=self.conc_crse)

    def setUpAndLogin(self):
        self.setUpGroups()
        self.c = Client()
        resp = self.c.post('/login/', data={'username': self.username,
                                            'password': self.password})
        resp_content_str = resp.content.decode('utf-8')
        resp_content_json = json.loads(resp_content_str)
        self.token = resp_content_json['token']
        username = jwt_decode_handler(self.token)['username']
        user = User.objects.get(username=username)
        return ARiProfile.objects.get(user=user)

    # Not really necessary, this was originally to test my understanding
    # but I may as well leave it in
    def test_set_up_works(self):
        self.setUpGroups()
        c1_retrieved = Group.objects.get(name='c1')
        c2_retrieved = Group.objects.get(name='c2')
        conc = Group.objects.get(name='Concurrency')
        arch = Group.objects.get(name='Architecture')
        year = Year.objects.get(number=2)
        conc_crse = Course.objects.get(name="Concurrency")
        sesh = Lecture.objects.get(name="Concurrent Execution")
        arch_crse = Course.objects.get(code=210)
        self.assertEqual(self.c1, c1_retrieved)
        self.assertEqual(self.c2, c2_retrieved)
        self.assertEqual(self.conc_grp, conc)
        self.assertEqual(self.arch_grp, arch)
        self.assertEqual(self.year2, year)
        self.assertEqual(self.conc_crse, conc_crse)
        self.assertEqual(self.arch_crse, arch_crse)
        self.assertEqual(self.sesh, sesh)

    def test_login_sets_groups_correctly(self):
        ari_profile = self.setUpAndLogin()
        self.assertTrue(ari_profile.user.groups.filter(
            name='Concurrency').count())

    def test_ruhi_is_in_second_year(self):
        ari_profile = self.setUpAndLogin()
        self.assertEqual(ari_profile.year.number, 2)

    def test_ruhi_is_not_in_first_year(self):
        ari_profile = self.setUpAndLogin()
        self.assertNotEqual(ari_profile.year.number, 1)

    def test_ruhi_does_concurrency(self):
        ari_profile = self.setUpAndLogin()
        self.assertTrue(ari_profile.courses.get(code=223))

    def test_get_courses_ruhi(self):
        self.setUpAndLogin()
        resp = self.c.get('/courses/',
                          HTTP_AUTHORIZATION=self.token)
        resp_content_str = resp.content.decode('utf-8')
        courses = json.loads(resp_content_str)
        pairs = zip(self.ruhi_course_list, courses)

        self.assertFalse(any(x != y for x, y in pairs))

    def test_get_lectures_does_not_return_general(self):
        self.setUpAndLogin()
        resp = self.c.get('/courses/223/', HTTP_AUTHORIZATION=self.token)
        resp_content_str = resp.content.decode('utf-8')
        lectures = json.loads(resp_content_str)
        no_general = False
        try:
            lectures.get(urlName='general')
        except:
            no_general = True
        self.assertTrue(no_general)

from django.contrib.auth.models import User
from django.http import HttpResponseNotFound, JsonResponse, HttpResponse, \
    HttpResponseForbidden, HttpResponseBadRequest

# Create your views here.
from django.views.decorators.csrf import csrf_exempt
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_jwt.utils import jwt_decode_handler
from django.utils import timezone

from AskARi.models import Question, Comment, QuestionAndCurrentUser
from AskARi.serializers import QuestionSerializer, QuestionFullSerializer, \
    QuestionAndCurrentUserSerializer
from courses.models import Course
from lecture.models import Lecture
from login.models import ARiProfile
from login.utils import can_access_course

pg_size = 25


@permission_classes((IsAuthenticated,))
@authentication_classes((TokenAuthentication,))
def get_question(request, code, lectureURL, q_id):
    token = request.environ['HTTP_AUTHORIZATION']
    username = jwt_decode_handler(token)['username']
    user = User.objects.get(username=username)
    access, resp = can_access_course(user, code)
    if not access:
        return resp
    course = Course.objects.get(code=code)
    try:
        lecture = Lecture.objects.get(urlName=lectureURL, course=course)
        question = Question.objects.get(parent=lecture, id_per_lecture=q_id)
    except Lecture.DoesNotExist:
        return HttpResponseNotFound('Lecture ' + lectureURL +
                                    'not found for course ' + code)
    except Question.DoesNotExist:
        return HttpResponseNotFound('Lecture ' + lectureURL + ' in course ' +
                                    code + ' does not have a question with id: '
                                    + q_id)
    profile = ARiProfile.objects.get(user=user)
    qAndCurrUser = QuestionAndCurrentUser(question=question, profile=profile)
    serializer = QuestionAndCurrentUserSerializer(qAndCurrUser, many=False)
    data = serializer.data

    return JsonResponse(data, safe=False)


# PRE: lectureURL cannot be provided unless a corresponding (course) code is
#      also provided.
@permission_classes((IsAuthenticated,))
@authentication_classes((TokenAuthentication,))
def get_questions(request, code=None, lectureURL=None, pg_no=0):
    # Get username from token
    token = request.environ['HTTP_AUTHORIZATION']
    username = jwt_decode_handler(token)['username']
    user = User.objects.get(username=username)

    if code:
        # Check if user can access provided course, access is true if so
        access, resp = can_access_course(user, code)
        if not access:
            return resp

        # Get appropriate course object
        try:
            course = Course.objects.get(code=code)
        except Course.DoesNotExist:
            return HttpResponseNotFound('Course ' + code + 'not found.')
        if lectureURL:
            # Try to get appropriate lecture object
            try:
                lecture = Lecture.objects.get(urlName=lectureURL, course=course)
            except Lecture.DoesNotExist:
                return HttpResponseNotFound('Lecture ' + lectureURL +
                                            'not found for course ' + code)
            # Get all questions for specified lecture
            questions = Question.objects.filter(parent=lecture)
        else:
            questions = Question.objects.none()
            lectures = Lecture.objects.filter(course=course)
            for lecture in lectures:
                questions = questions | Question.objects.filter(parent=lecture)
    else:
        # Get all questions when course not specified
        questions = Question.objects.none()

        # Get courses that user has access to
        ari_profile = ARiProfile.objects.get(user=user)
        courses = ari_profile.courses.all()

        for course in courses:
            lectures = Lecture.objects.filter(course=course)
            for lecture in lectures:
                questions = questions | Question.objects.filter(parent=lecture)

    # Order questions by id
    questions = questions.order_by('-last_interaction')

    # Retrieve only questions on page "pg_no"
    questions = questions[pg_size * pg_no: pg_size * (pg_no + 1)]
    serializer = QuestionSerializer(questions, many=True)

    return JsonResponse(serializer.data, safe=False)


@csrf_exempt
@permission_classes((IsAuthenticated,))
@authentication_classes((TokenAuthentication,))
def create_question(request):
    token = request.environ['HTTP_AUTHORIZATION']
    username = jwt_decode_handler(token)['username']
    user = User.objects.get(username=username)
    profile = ARiProfile.objects.get(user=user)
    course_code = request.POST.get('code', None)
    access, resp = can_access_course(user, course_code)
    if not access:
        return resp
    course = Course.objects.get(code=course_code)
    lectureURL = request.POST.get('lecture', None)
    try:
        lecture = Lecture.objects.get(course=course, urlName=lectureURL)
    except Lecture.DoesNotExist:
        return HttpResponseNotFound("Course " + course_code + " does not have a"
                                    " lecture at " + str(lectureURL))
    title = request.POST.get('title', None)
    body = request.POST.get('body', None)
    Question.objects.create(title=title, body=body, parent=lecture,
                            poster=profile)

    return HttpResponse("Question created successfully")


@csrf_exempt
@permission_classes((IsAuthenticated,))
@authentication_classes((TokenAuthentication,))
def post_comment(request, code, lectureURL, q_id):
    token = request.environ['HTTP_AUTHORIZATION']
    username = jwt_decode_handler(token)['username']
    user = User.objects.get(username=username)
    profile = ARiProfile.objects.get(user=user)
    access, resp = can_access_course(user, code)
    if not access:
        return resp
    course = Course.objects.get(code=code)
    try:
        lecture = Lecture.objects.get(urlName=lectureURL, course=course)
        question = Question.objects.get(parent=lecture, id_per_lecture=q_id)
    except Lecture.DoesNotExist:
        return HttpResponseNotFound('Lecture ' + lectureURL +
                                    'not found for course ' + code)
    except Question.DoesNotExist:
        return HttpResponseNotFound('Lecture ' + lectureURL + ' in course ' +
                                    code + ' does not have a question with id: '
                                    + q_id)
    content = request.POST.get('content', None)
    parent_id = request.POST.get('parent', None)
    parent_comment = None
    if parent_id:
        try:
            parent_comment = Comment.objects.get(parent=question,
                                                 id_per_question=parent_id)
        except Comment.DoesNotExist:
            return HttpResponseNotFound('Question ' + question + ' does not '
                                        'have a comment with id ' + parent_id)
    Comment.objects.create(content=content, poster=profile, parent=question,
                           parent_comment=parent_comment)

    # Update last_interaction field of question
    question.last_interaction = timezone.now()
    question.save()

    return HttpResponse("Comment created successfully.")

@csrf_exempt
@permission_classes((IsAuthenticated,))
@authentication_classes((TokenAuthentication,))
def rate_comment(request, code, lectureURL, q_id, c_id):
    token = request.environ['HTTP_AUTHORIZATION']
    username = jwt_decode_handler(token)['username']
    user = User.objects.get(username=username)
    profile = ARiProfile.objects.get(user=user)
    access, resp = can_access_course(user, code)
    if not access:
        return resp
    course = Course.objects.get(code=code)
    try:
        lecture = Lecture.objects.get(urlName=lectureURL, course=course)
        question = Question.objects.get(parent=lecture, id_per_lecture=q_id)
        comment = Comment.objects.get(parent=question, id_per_question=c_id)
    except Lecture.DoesNotExist:
        return HttpResponseNotFound('Lecture ' + lectureURL +
                                    'not found for course ' + code)
    except Question.DoesNotExist:
        return HttpResponseNotFound('Lecture ' + lectureURL + ' in course ' +
                                    code + ' has no question with id: ' + q_id)
    except Comment.DoesNotExist:
        return HttpResponseNotFound('Question ' + q_id + ' on lecture ' +
                                    lectureURL + ' has no comment with id ' +
                                    c_id)
    try:
        rating = int(request.POST.get('rating', None))
    except ValueError:
        return HttpResponseBadRequest('rating is not an int')
    try:
        comment.rate(profile, rating)
        return HttpResponse('Voted')
    except (ValueError, AssertionError) as e:
        return HttpResponseForbidden(str(e))


import {Component, OnInit, OnDestroy} from '@angular/core';
import {AskAriService} from "../_services/askari.service";
import {ActivatedRoute, Router} from '@angular/router';
import {AuthenticationService} from "../_services/auth.service";
import {FormBuilder} from '@angular/forms';
import {Course, Lecture} from '../courses/courses.component';
import {CoursesService} from "../_services/courses.service";
import {Subscription} from "rxjs/Subscription";

@Component({
    styleUrls: ['askari.component.scss'],
    templateUrl: 'askari.component.html',
})

export class AskAriComponent implements OnInit, OnDestroy {
    viewQuestionModal: boolean = false;
    isStaff: boolean;
    firstName: string;
    lastName: string;
    model: any = {};
    localStorage;
    askingQuestion: boolean;
    validQuestionTitle: boolean = true;
    validQuestionBody: boolean = true;
    questionRetrieved: boolean;
    commentsRetrieved: boolean = false;
    replyToComment: boolean = false;

    parentId: number = 0;
    replyingTo: string = 'Question';

    questionSubscription: Subscription;

    questions: Question[] = [];
    comments: Comment[] = [];
    courses: Course[] = [];
    lectures: Lecture[] = [];

    /* A property for our submitted form */
    post: any;
    description: string = '';
    name: string = '';
    titleAlert: string = 'This field is required';

    selectedQuestion: Question;
    selectedCourse: Course = null;
    selectedLecture: Lecture = null;

    upvotedComments: number[] = [];

    constructor(private fb: FormBuilder, private askAriService: AskAriService, private router: Router,
                private authenticationService: AuthenticationService,
                private coursesService: CoursesService,
                private route: ActivatedRoute) {
        this.localStorage = localStorage;
        this.askingQuestion = false;
        this.questionRetrieved = false;
        this.isStaff = JSON.parse(localStorage['currentUser']).is_staff;
        this.firstName = JSON.parse(localStorage['currentUser']).first_name;
        this.lastName = JSON.parse(localStorage['currentUser']).last_name;
    }

    logout(): void {
        this.authenticationService.logout();
    }

    ngOnInit() {
        this.getCourses();
        this.askAriService.getAllQuestions().subscribe(
            questions => {
                this.questions = questions;
                this.route.params.subscribe(params => {
                    this.getQuestion(params['qTitle']);
                });
            },
            function(error) { console.log(error); },
            function() { console.log("completed askari loading"); }
        );
    }

    ngOnDestroy() {
        if (this.questionSubscription !== undefined) {
            this.questionSubscription.unsubscribe();
        }
    }

    getQuestion(questionTitle: string) {
        if (questionTitle == null) {
            return;
        }
        this.questionRetrieved = true;
        this.comments = [];
        this.selectedQuestion = this.questions.find(question => question.title === questionTitle);
        console.log(this.selectedQuestion.course);
        if (this.questionSubscription !== undefined) {
            this.questionSubscription.unsubscribe();
        }
        this.questionSubscription = this.askAriService.getQuestion(this.selectedQuestion.course, this.selectedQuestion.lecture,
                this.selectedQuestion.id).subscribe(
            question => {
                this.selectedQuestion = question;
                this.comments.length = 0;
                for (let comment of this.selectedQuestion.comment_set) {
                    if (!this.comments.some(x => x === comment)) {
                        console.log("Adding");
                        this.comments.push(comment);
                    }
                }

                // Set up hashArr
                let hashArr = {};
                for (let i = 0; i < this.comments.length; i++) {
                    let parentId: number;
                    if (this.comments[i].parentId == null) {
                        parentId = 0;
                    } else {
                        parentId = this.comments[i].parentId;
                    }
                    if (hashArr[parentId] === undefined) {
                        hashArr[parentId] = [];
                    }
                    hashArr[parentId].push(this.comments[i]);
                }
                this.comments = this.commentSort(hashArr, 0, []);
                this.upvotedComments = [];
                if (question.upvotes) {
                    let upvotedCommentsString: string[] = question.upvotes.split(",");
                    for (let numStr of upvotedCommentsString) {
                        this.upvotedComments.push(parseInt(numStr, 10));
                    }
                }
            },
            function(error) { console.log(error); },
            function() { console.log("completed comment loading"); }
        );
        this.commentsRetrieved = true;
        this.selectedCourse = this.courses.find(course => course.code === this.selectedQuestion.course);
        this.selectedLecture = this.lectures.find(lecture => lecture.name === this.selectedQuestion.lectureTitle);
    }

    commentSortFunc(c1: Comment, c2: Comment) {
        return c1.score < c2.score;
    }

    commentSort(hashArr, key: number, result: Comment[]) {
        if (hashArr[key] === undefined) {
            return;
        }
        let arr = hashArr[key].sort(this.commentSortFunc);
        for (let i = 0; i < arr.length; i++) {
            result.push(arr[i]);
            this.commentSort(hashArr, arr[i].commentId, result);
        }
        return result;
    }

    addComment() {
        if (this.parentId === 0) {
            let status = this.askAriService.addComment(this.model.commentBody, this.selectedQuestion.id,
                this.selectedQuestion.course, this.selectedQuestion.lecture).subscribe(result => {
                console.log(result);
                this.getQuestion(this.selectedQuestion.title);
                this.onLectureChange();
            });
            console.log("status on AskAri page: ");
            console.log(status);
        } else {
            let status = this.askAriService.addCommentReply(this.model.commentBody, this.selectedQuestion.id,
                this.selectedQuestion.course, this.selectedQuestion.lecture, this.parentId).subscribe(result => {
                console.log(result);
                this.getQuestion(this.selectedQuestion.title);
                this.onLectureChange();
            });
            console.log("status on AskAri page: ");
            console.log(status);
        }
    }

    askQuestion() {
        this.askingQuestion = true;
    }

    questionAsked() {
        this.askingQuestion = false;
    }

    createQuestion() {
        this.askAriService.createQuestion(this.model.title, this.selectedCourse.code,
            this.selectedLecture.urlName, this.model.body).subscribe(result => {
            console.log(result);
        });
        this.questionAsked();
        this.hideQuestionModal();
    }

    upvoteComment(commentId: number, isUpvote: boolean) {
        let code = this.selectedQuestion.course;
        let lecture = this.selectedQuestion.lecture;
        let questionId = this.selectedQuestion.id;
        this.askAriService.upvoteComment(code, lecture, questionId, commentId, isUpvote).subscribe(status => {
            // Update display
            this.getQuestion(this.selectedQuestion.title);
        });
    }

    getCourses() {
        this.coursesService.getCourses().subscribe(
            courses => this.courses = courses,
            function(error) { console.log(error); },
            function() { console.log("completed course loading"); }
        );
    }

    getLectures() {
        let courseCode = this.selectedCourse.code;
        this.coursesService.getLectures(courseCode).subscribe(
            lectures => this.lectures = lectures,
            function(error) { console.log(error); },
            function() { console.log("completed lecture loading"); }
        );
    }

    // This function gets called when a new course is selected from the drop down menu
    // Updates lectures drop-down menu
    // Filters questions
    onCourseChange() {
        if (this.selectedCourse == null) {this.askAriService.getAllQuestions().subscribe(
                questions => this.questions = questions,
                function(error) { console.log(error); },
                function() { console.log("reloaded all course questions"); }
            );
            return;
        }
        let courseCode = this.selectedCourse.code;
        console.log('getting lectures!!!');
        this.getLectures();
        this.askAriService.getQuestionsForCourse(courseCode).subscribe(
            questions => this.questions = questions,
            function(error) { console.log(error); },
            function() { console.log("got all questions with course code " + String(courseCode)); }
        );
    }

    // This function gets called when a new lecture is selected from the drop down menu
    // Filters questions
    onLectureChange() {
        if (this.selectedCourse == null) {
            this.askAriService.getAllQuestions().subscribe(
                questions => this.questions = questions,
                function(error) { console.log(error); },
                function() { console.log("reloaded all course questions"); }
            );
            return;
        }
        let courseCode = this.selectedCourse.code;

        if (this.selectedLecture == null) {
            this.onCourseChange();
            return;
        }

        let lectureUrlName = this.selectedLecture.urlName;
        this.askAriService.getQuestionsForCourseAndLecture(courseCode, lectureUrlName).subscribe(
            questions => this.questions = questions,
            function(error) { console.log(error); },
            function() { console.log("got all questions with lecture name " + lectureUrlName); }
        );
    }

    evaluateQuestionTitle() {
        if (this.model.title !== undefined) {
            let title = this.model.title;
            let len = title.length;
            this.validQuestionTitle = len > 0;
        }
    }

    evaluateQuestionBody() {
        if (this.model.body !== undefined) {
            let body = this.model.body;
            let len = body.length;
            this.validQuestionBody = len >= 10 && len <= 500;
        }
    }

    setParentComment(id: number, poster: string) {
        this.parentId = id;
        this.replyingTo = poster;
    }

    getComments() {
        let arr: Comment[] = [];
        for (let comment of this.comments) {
            if (comment.parentId == null) {
                arr.push(comment);
            }
        }
        return arr;
    }

    getCommentReplies(id: number) {
        let arr: Comment[] = [];
        for (let comment of this.comments) {
            if (comment.parentId === id) {
                arr.push(comment);
            }
        }
        return arr;
    }

    showQuestionModal() {
        this.viewQuestionModal = true;
    }

    hideQuestionModal() {
        this.viewQuestionModal = false;
    }
}

export class Question {
    constructor(
        public id: number,
        public title: string,
        public course: number,
        public lecture: string,
        public lectureTitle: string,
        public courseName: string,
        public body: string,
        public poster: string,
        public score: number,
        public comment_set: Comment[],
        public upvotes: any) { }
}

export class Comment {
    constructor(public content: string,
                public poster: string,
                public score: number,
                public questionId: number,
                public commentId: number,
                public parentId: number) { }
}

/*  Replies to replies:
    same as posting a reply for url, pass a field called parent in the post (ID of the direct parent comment)
 */

import {ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit, Pipe, PipeTransform} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {CoursesService} from "../_services/courses.service";
import {DomSanitizer} from "@angular/platform-browser";
import {Router} from '@angular/router';
import {AuthenticationService} from "../_services/auth.service";
import {Question} from "../askari/askari.component";
import {AskAriService} from "../_services/askari.service";


@Component({
    styleUrls: ['./ariviewer.component.scss'],
    templateUrl: './ariviewer.component.html'
})

export class AriViewerComponent implements OnInit, OnDestroy {
    headerName: string;
    videoHidden: boolean;
    videoUrl: string;
    loadedNotes: boolean;
    slidesHidden: boolean;
    slidesUrl: string;
    isStaff: boolean;
    firstName: string;
    lastName: string;
    questions: Question[];
    model: any = {};

    courseCode: number;
    lectureName: string;
    urlsLoaded: boolean;
    component = this;

    validQuestionTitle: boolean = true;
    validQuestionBody: boolean = true;

    loadedTitle: boolean = false;

    lectureDetails: LectureDetails;
    private sub: any;


    constructor(private route: ActivatedRoute, private coursesService: CoursesService,
                private cd: ChangeDetectorRef, private router: Router,
                private authenticationService: AuthenticationService,
                private askAriService: AskAriService) {
        this.videoHidden = false;
        this.slidesHidden = false;
        this.urlsLoaded = false;
        this.getParams();
        this.getUrls();
        this.isStaff = JSON.parse(localStorage['currentUser']).is_staff;
        this.firstName = JSON.parse(localStorage['currentUser']).first_name;
        this.lastName = JSON.parse(localStorage['currentUser']).last_name;
        this.loadQuestions();
        this.loadedTitle = true;
    }

    logout(): void {
        this.authenticationService.logout();
    }

    getParams() {
        this.sub = this.route.params.subscribe(params => {
            this.courseCode = params['courseCode'];
            this.lectureName = params['lectureName'];
        });
    }

    getUrls() {
        let component = this;
        this.coursesService.getUrls(String(this.courseCode) + '/' + this.lectureName).subscribe(
            lectureDetails => {
                this.lectureDetails = lectureDetails;
                this.model.notes = lectureDetails.notes;
                this.loadedNotes = true;
            },
            function(error) { console.log(error); },
            function() {
                console.log("completed url loading");
                component.headerName = component.lectureDetails.name;
                component.videoUrl = component.lectureDetails.video;
                component.slidesUrl = component.lectureDetails.slides;
                component.urlsLoaded = true;
            }
        );
        console.log(this.videoUrl);
        console.log(this.slidesUrl);
    }

    ngOnInit() {

    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    hideVideoPress() {
        this.videoHidden = !this.videoHidden;
    }

    hideSlidesPress() {
        this.slidesHidden = !this.slidesHidden;
    }

    loadQuestions() {
        let courseCode = this.courseCode;
        let lectureUrlName = this.lectureName;
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
            console.log('Title: ' + this.validQuestionTitle);
        }
    }

    evaluateQuestionBody() {
        if (this.model.body !== undefined) {
            let body = this.model.body;
            let len = body.length;
            this.validQuestionBody = len >= 10 && len <= 500;
        }
    }

    createQuestion() {
        let status = this.askAriService.createQuestion(this.model.title, this.courseCode,
            this.lectureName, this.model.body).subscribe(result => {
            console.log(result);
        });
        console.log("status on ari viewer page:");
        console.log(status);
    }

    saveNotes() {
        let status = this.coursesService.saveNotes(this.model.notes, this.courseCode, this.lectureName).subscribe(result => {
            console.log(result);
        });
        console.log("status on ari viewer for saving notes:");
        console.log(status);
    }
}

export class LectureDetails {
    constructor(
        public name: string,
        public slides: string,
        public video: string,
        public notes: string) { }
}

@Pipe({ name: 'safe' })
export class SafePipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) {}
    transform(url) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
}

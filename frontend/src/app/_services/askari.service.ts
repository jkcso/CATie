import {Injectable} from '@angular/core';
import {Http, Headers, Response, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import * as Globals from '../globals';

import {LectureDetails} from "../ariviewer/ariviewer.component";
import {Question} from "../askari/askari.component";

@Injectable()
export class AskAriService {
    public token: string;

    private allQuestionsUrl: string = Globals.hostURL + 'AskARi/';
    private allQuestionsByPageUrl: string = Globals.hostURL + 'AskARi/#page_number'; // page_number is a variable
    private allQuestionsByCourseUrl: string = Globals.hostURL + 'AskARi/course_number'; // course_number is a variable
    private allQuestionsByCourseAndPageUrl: string = Globals.hostURL + 'AskARi/course_number/#page_number'; // course_number and page_number are variables
    private allQuestionsByCourseAndLectureUrl: string = Globals.hostURL + 'AskARi/course_number/lecture_name'; // course_number and lecture_name are variables
    private allQuestionsByCourseAndLectureAndPageUrl: string = Globals.hostURL + 'AskARi/course_number/lecture_name/#page_number'; // course_number, page_number and lecture_name are variables

    private questionAndCommentsUrl: string = Globals.hostURL + 'AskARi/question/';
    private addCommentUrl: string = Globals.hostURL + 'AskARi/question/'; // question/'code'/'urlname'/'questionid'/reply/

    private createQuestionUrl: string = Globals.hostURL + 'AskARi/question/create/';

    constructor(private http: Http) {
        // set token if saved in local storage
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
    }

    getAllQuestions(): Observable<Question[]> {
        let headers = new Headers();
        headers.append('Authorization', this.token);
        let options = new RequestOptions({ headers: headers });
        return this.http.get(this.allQuestionsUrl, options).map(this.extractData);
    }

    getQuestionsForCourse(courseCode: number): Observable<Question[]> {
        let headers = new Headers();
        headers.append('Authorization', this.token);
        let options = new RequestOptions({ headers: headers });
        return this.http.get(this.allQuestionsUrl + String(courseCode) + '/', options).map(this.extractData);
    }

    getQuestionsForCourseAndLecture(courseCode: number, lectureUrl: string): Observable<Question[]> {
        let headers = new Headers();
        headers.append('Authorization', this.token);
        let options = new RequestOptions({ headers: headers });
        return this.http.get(this.allQuestionsUrl + String(courseCode) + '/' + lectureUrl + '/', options)
                .map(this.extractData);
    }

    getQuestion(code: number, lectureUrl: string, questionID: number): Observable<Question> {
        let headers = new Headers();
        headers.append('Authorization', this.token);
        let options = new RequestOptions({ headers: headers });
        let url = this.questionAndCommentsUrl + code + '/' + lectureUrl + '/' + questionID + '/';
        return Observable.timer(0, 2000)
            .switchMap(() => this.http.get(url, options).map(this.extractData));
    }

    addComment(content: string, question: number, code: number, urlname: string) {
        let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded'});
        headers.append('Authorization', this.token);
        let options = new RequestOptions({ headers: headers });
        let body = 'content=' + content;
        console.log(body);
        let url = this.addCommentUrl + code + '/' + urlname + '/' + question + '/reply/';

        return this.http.post(url, body, options).map((res: Response) => {
            if (res) {
                return res.status;
            }
        });
    }

    addCommentReply(content: string, question: number, code: number, urlname: string, parent: number) {
        let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded'});
        headers.append('Authorization', this.token);
        let options = new RequestOptions({ headers: headers });
        let body = 'content=' + content + '&parent=' + parent;
        console.log(body);
        let url = this.addCommentUrl + code + '/' + urlname + '/' + question + '/reply/';

        return this.http.post(url, body, options).map((res: Response) => {
            if (res) {
                return res.status;
            }
        });
    }

    // This function is used to TOGGLE the upvote on a comment depending on the boolean
    upvoteComment(code: number, lecture: string, questionId: number, commentId: number, isUpvote: boolean): Observable<number> {
        let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded'});
        headers.append('Authorization', this.token);
        let options = new RequestOptions({ headers: headers });
        let rating: number = isUpvote ? 1 : 0;
        let body = 'rating=' + String(rating);

        let url = this.questionAndCommentsUrl + String(code) + '/' +
            lecture + '/' + String(questionId) + '/' + String(commentId) + '/rate/';

        return this.http.post(url, body, options).map((res: Response) => {
            if (res) {
                return res.status;
            }
        });
    }

    /*
    getAllQuestionsByPage(code: number): Observable<Lecture[]> {
        let headers = new Headers();
        headers.append('Authorization', this.token);
        let options = new RequestOptions({ headers: headers });
        let url = this.fetchCoursesUrl + code + '/';
        return this.http.get(url, options).map(this.extractData);
    }
    */

    createQuestion(title: string, code: number, lecture: string, body: string): Observable<number>  {
        let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded'});
        headers.append('Authorization', this.token);
        let options = new RequestOptions({ headers: headers });
        let params = 'title=' + title + '&code=' + code + '&lecture=' + lecture + '&body=' + body;

        return this.http.post(this.createQuestionUrl, params, options).map((res: Response) => {
            if (res) {
                return res.status;
            }
        });
    }

    private extractData(res: Response) {
        let body = res.json();
        console.log('ExtractData: ' + body);
        return body || [];
    }

    getUrls(urlname: string): Observable<LectureDetails> {
        let headers = new Headers();
        headers.append('Authorization', this.token);
        let options = new RequestOptions({ headers: headers });
        let url = this.allQuestionsUrl + urlname + '/';
        return this.http.get(url, options).map(this.extractData);
    }
}

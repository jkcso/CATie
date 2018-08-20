import { Injectable } from '@angular/core';
import {Http, Headers, Response, RequestOptions} from '@angular/http';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/operator/map';
import * as Globals from '../globals';

import {Course, Lecture} from '../courses/courses.component';
import {LectureDetails} from "../ariviewer/ariviewer.component";

@Injectable()
export class CoursesService {
    public token: string;

    private fetchCoursesUrl: string = Globals.hostURL + 'courses/';
    private addUrl: string = Globals.hostURL + 'lectures/create/';


    constructor(private http: Http) {
        // set token if saved in local storage
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
    }

    getCourses(): Observable<Course[]> {
        let headers = new Headers();
        headers.append('Authorization', this.token);
        let options = new RequestOptions({ headers: headers });
        return this.http.get(this.fetchCoursesUrl, options).map(this.extractData);
    }

    getLectures(code: number): Observable<Lecture[]> {
        let headers = new Headers();
        headers.append('Authorization', this.token);
        let options = new RequestOptions({ headers: headers });
        let url = this.fetchCoursesUrl + code + '/';
        return this.http.get(url, options).map(this.extractData);
    }

    addSession(name: string, code: string, video: string, slides: string): Observable<number>  {
        let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded'});
        headers.append('Authorization', this.token);
        let options = new RequestOptions({ headers: headers });
        let body = 'name=' + name + '&code=' + code + '&video=' + video + '&slides=' + slides;

        return this.http.post(this.addUrl, body, options).map((res: Response) => {
            if (res) {
                return res.status;
            }
        });
    }

    saveNotes(content: string, code: number, urlName: string) {
        let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded'});
        headers.append('Authorization', this.token);
        let options = new RequestOptions({ headers: headers});
        let body = 'content=' + content;

        return this.http.post(this.fetchCoursesUrl + code + '/' + urlName + '/save/', body, options).map((res: Response) => {
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
        let url = this.fetchCoursesUrl + urlname + '/';
        return this.http.get(url, options).map(this.extractData);
    }
}

// /save/

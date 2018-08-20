import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { CalendarEvent } from './calendar.event';
import * as Globals from '../globals';


@Injectable()
export class CalendarService {
    private calendarUrl = Globals.hostURL + 'calendar/';  // URL to web API
    constructor(private http: Http) {
    }

    getEvents(): Observable<CalendarEvent[]> {
        return this.http.get(this.calendarUrl)
            .map(this.extractData)
            .catch(this.handleError);
    }

    create(username: string,
           title: string,
           start: Date,
           end: Date,
           isDraggable: boolean,
           isResizable: boolean): Observable<CalendarEvent> {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.calendarUrl, { username, title, start, end, isDraggable, isResizable  }, options)
            .map(this.extractData)
            .catch(this.handleError);
    }

    // TODO: create a CalendarEvent object from this method?
    private extractData(res: Response) {
        let body = res.json();
        return body.data || {}; // .data because JSON is wrapped by an object
    }

    private handleError(error: Response | any) {
        // TODO: do actual error handling
        return Observable.throw("Database failed.");
    }
}

import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/of';
import * as Globals from '../globals';

@Injectable()
export class LoginGuard implements CanActivate {

    private verifyUrl: string = Globals.hostURL + 'api-token-verify/';
    private refreshUrl: string = Globals.hostURL +  'api-token-refresh/';

    constructor(private router: Router, private http: Http) { }

    canActivate(): Observable<boolean> {
        if (localStorage.getItem('currentUser')) {
            // has token so check if valid

            // Get header fields
            let options = this.getOptions();

            // Retrieve token from localStorage
            let currentUser = JSON.parse(localStorage.getItem('currentUser'));
            let token = currentUser && currentUser.token;

            let body = 'token=' + token;
            let loggedIn: boolean;
            return this.getResponseStatus(options, body).map(
                status => {
                    if (status === 200) {
                        // have valid token
                        this.refreshToken(options, body);
                        this.router.navigate(['/home']);
                        loggedIn = true;
                    } else {
                        // have expired token
                        localStorage.removeItem('currentUser');
                        loggedIn = false;
                    }
                    return !loggedIn;
                }
            );
        }

        // have no token
        return Observable.of(true);
    }

    getOptions(): RequestOptions {
        let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded'});
        return new RequestOptions({ headers: headers });
    }

    // Sends a (POST) request to the back-end to determine whether currently stored token is valid
    // Returns (an Observable of) the status code from the HTTP response
    private getResponseStatus(options, body): Observable<number> {
        return this.http.post(this.verifyUrl, body, options).map((res: Response) => {
            if (res) {
                return res.status;
            }
        });
    }

    // PRECONDITION: Can only be called if currently stored token is valid
    // Sends a (POST) request to the back-end to refresh currently stored token
    private refreshToken(options, body): Observable<boolean> {
        return this.http.post(this.refreshUrl, body, options)
            .map((response: Response) => {
                // login successful if there's a jwt token in the response
                let token = response.json() && response.json().token;
                if (token) {
                    // store jwt token in local storage to keep user logged in between page refreshes
                    let username = JSON.parse(localStorage['currentUser']).username;
                    let isStaff = JSON.parse(localStorage['currentUser']).is_staff;
                    let firstName = JSON.parse(localStorage['currentUser']).first_name;
                    let lastName = JSON.parse(localStorage['currentUser']).last_name;
                    localStorage.removeItem('currentUser');
                    localStorage.setItem('currentUser',
                        JSON.stringify({ username: username,
                            token: token,
                            is_staff: isStaff,
                            first_name: firstName,
                            last_name: lastName
                        }));
                    return true;
                } else {
                    return false; // if precondition is satisfied, this should never be hit
                }
            });
    }
}

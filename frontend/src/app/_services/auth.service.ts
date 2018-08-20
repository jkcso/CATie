import { Injectable } from '@angular/core';
import {Http, Headers, Response, RequestOptions} from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import * as Globals from '../globals';

@Injectable()
export class AuthenticationService {
    public token: string;
    private apiUrl: string = Globals.hostURL + 'login/';

    constructor(private http: Http) {
        // set token if saved in local storage
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
    }

    // Output: True if login successful, false otherwise
    login(username: string, password: string): Observable<boolean> {
        /* let urlSearchParams = new URLSearchParams();
        urlSearchParams.append('username', username);
        urlSearchParams.append('password', password);
        let body = urlSearchParams.toString();
        console.log("username: " + username);
        console.log("password: " + password);
        console.log(body); */

        let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded'});
        let options = new RequestOptions({ headers: headers });
        let body = 'username=' + username + '&password=' + password;

        return this.http.post(this.apiUrl, body, options)
            .map((response: Response) => {
                // login successful if there's a jwt token in the response
                let token = response.json() && response.json().token;
                let staff = response.json() && response.json().is_staff;
                let firstName = response.json() && response.json().first_name;
                let lastName = response.json() && response.json().last_name;
                if (token) {
                    // set token property
                    this.token = token;
                    // store username and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser',
                        JSON.stringify({ username: username,
                            token: token,
                            is_staff: staff,
                            first_name: firstName,
                            last_name: lastName
                        }));

                    return true;
                } else {
                    return false;
                }
            });
    }

    logout(): void {
        // clear token remove user from local storage to log user out
        this.token = null;
        localStorage.removeItem('currentUser');
    }
}

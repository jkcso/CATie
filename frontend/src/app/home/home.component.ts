/*
 * Copyright (c) 2016 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */
import {Component} from "@angular/core";
import {Router} from '@angular/router';
import {AuthenticationService} from "../_services/auth.service";
import {AskAriService} from "../_services/askari.service";
import {Question} from "../askari/askari.component";

@Component({
    styleUrls: ['./home.component.scss'],
    templateUrl: './home.component.html',
})
export class HomeComponent {
    isStaff: boolean;
    firstName: string;
    lastName: string;
    questions: Question[];

    constructor(private router: Router, private authenticationService: AuthenticationService,
                private askAriService: AskAriService) {
        this.isStaff = JSON.parse(localStorage['currentUser']).is_staff;
        this.firstName = JSON.parse(localStorage['currentUser']).first_name;
        this.lastName = JSON.parse(localStorage['currentUser']).last_name;
        this.loadQuestions();
    }

    logout(): void {
        this.authenticationService.logout();
    }

    loadQuestions() {
        this.askAriService.getAllQuestions().subscribe(
            questions => this.questions = questions,
            function(error) { console.log(error); },
            function() { console.log("got all questions"); }
        );
    }
}

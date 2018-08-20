import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {AuthenticationService} from "../_services/auth.service";

@Component({
    styleUrls: ['./grades.component.scss'],
    templateUrl: './grades.component.html'
})

export class GradesComponent {
    isStaff: boolean;
    allExpanded: boolean;
    showFeedback: boolean;
    firstName: string;
    lastName: string;

    constructor(private router: Router, private authenticationService: AuthenticationService) {
        this.allExpanded = false;
        this.showFeedback = false;
        this.isStaff = JSON.parse(localStorage['currentUser']).is_staff;
        this.firstName = JSON.parse(localStorage['currentUser']).first_name;
        this.lastName = JSON.parse(localStorage['currentUser']).last_name;
    }

    expandButtonPress() {
        this.allExpanded = !this.allExpanded;
    }

    showFeedbackModal() {
        this.showFeedback = true;
    }

    hideFeedbackModal() {
        this.showFeedback = false;
    }

    logout(): void {
        this.authenticationService.logout();
    }
}

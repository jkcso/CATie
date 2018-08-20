import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from "./_services/auth.service";

@Component({
    selector: 'my-app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    constructor(private router: Router, private authenticationService: AuthenticationService) {
    }

    logout(): void {
        this.authenticationService.logout();
    }
}

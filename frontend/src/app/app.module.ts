import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule, JsonpModule } from '@angular/http';
import { ClarityModule } from 'clarity-angular';
import { AppComponent } from './app.component';
import { ROUTING } from "./app.routing";
import { HomeComponent } from "./home/home.component";
import { AboutComponent } from "./about/about.component";
import { CalendarModule } from 'angular-calendar';

import { CalendarComponent } from './calendar/calendar.component';
import { CoursesComponent } from "./courses/courses.component";
import { GradesComponent } from "./grades/grades.component";
import { AriViewerComponent, SafePipe } from "./ariviewer/ariviewer.component";
import { AskAriComponent } from "./askari/askari.component";
import { LoginComponent } from "./login/login.component";
import { AskAriQuestionComponent } from "./askariquestion/askariquestion.component";
import { AssignmentsComponent } from "./assignments/assignments.component";
import { AuthGuard } from "./_guards/auth.guard";
import { LoginGuard } from "./_guards/login.guard";
import { AuthenticationService } from "./_services/auth.service";
import { CoursesService } from "./_services/courses.service";
import { AskAriService } from "./_services/askari.service";

@NgModule({
    declarations: [
        AppComponent,
        AboutComponent,
        HomeComponent,
        CalendarComponent,
        CoursesComponent,
        GradesComponent,
        AriViewerComponent,
        LoginComponent,
        AskAriComponent,
        AskAriQuestionComponent,
        AssignmentsComponent,
        SafePipe
    ],
    imports: [
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpModule,
        JsonpModule,
        ClarityModule.forRoot(),
        CalendarModule.forRoot(),
        ROUTING,
        ReactiveFormsModule
    ],
    providers: [
        AuthGuard,
        LoginGuard,
        AuthenticationService,
        CoursesService,
        AskAriService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}

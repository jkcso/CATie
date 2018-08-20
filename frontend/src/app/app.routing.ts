/*
 * Copyright (c) 2016 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */
import { ModuleWithProviders } from '@angular/core/src/metadata/ng_module';
import { Routes, RouterModule } from '@angular/router';

import { AboutComponent } from './about/about.component';
import { HomeComponent } from './home/home.component';
import { CalendarComponent } from "./calendar/calendar.component";
import { CoursesComponent } from "./courses/courses.component";
import { GradesComponent } from "./grades/grades.component";
import { AriViewerComponent } from "./ariviewer/ariviewer.component";
import { AskAriComponent } from "./askari/askari.component";
import { AssignmentsComponent } from "./assignments/assignments.component";
import { LoginGuard } from "./_guards/login.guard";
import { AuthGuard } from "./_guards/auth.guard";
import { LoginComponent } from "./login/login.component";
import { AskAriQuestionComponent } from "./askariquestion/askariquestion.component";

export const ROUTES: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'login', component: LoginComponent, canActivate: [LoginGuard]},
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'about', component: AboutComponent, canActivate: [AuthGuard] },
    { path: 'cal', component: CalendarComponent, canActivate: [false] },
    { path: 'courses', component: CoursesComponent, canActivate: [AuthGuard] },
    { path: 'grades', component: GradesComponent, canActivate: [AuthGuard] },
    { path: 'ariviewer', component: AriViewerComponent, canActivate: [AuthGuard] },
    { path: 'ariviewer/:courseCode/:lectureName', component: AriViewerComponent, canActivate: [AuthGuard] },
    { path: 'askari', component: AskAriComponent, canActivate: [AuthGuard] },
    { path: 'assignments', component: AssignmentsComponent, canActivate: [AuthGuard] },
    { path: 'askariquestion', component: AskAriQuestionComponent, canActivate: [AuthGuard] }
];

export const ROUTING: ModuleWithProviders = RouterModule.forRoot(ROUTES);

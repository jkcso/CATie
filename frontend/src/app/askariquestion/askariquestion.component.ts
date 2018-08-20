import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    styleUrls: ['./askariquestion.component.scss'],
    templateUrl: './askariquestion.component.html'
})

export class AskAriQuestionComponent {

    rForm: FormGroup;
    /* A property for our submitted form */
    post: any;
    description: string = '';
    name: string = '';
    titleAlert: string = 'This field is required';

    constructor(private fb: FormBuilder) {

        this.rForm = fb.group({
            'name': [null, Validators.required],
            'description': [null, Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(500)])],
        });

    }

    addPost(post) {
        this.description = post.description;
        this.name = post.name;
    }

}

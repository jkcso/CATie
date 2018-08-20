import {
    Component, ChangeDetectionStrategy, ViewChild, TemplateRef,
    Input, OnChanges, Inject, LOCALE_ID, OnInit
} from '@angular/core';
import {
    startOfDay,
    endOfDay,
    subDays,
    addDays,
    endOfMonth,
    isSameDay,
    isSameMonth,
    addHours
} from 'date-fns';
import { Subject } from 'rxjs/Subject';
import {
    CalendarEvent,
    CalendarEventTimesChangedEvent,
    CalendarUtils,
    CalendarEventAction,
} from 'angular-calendar';
import { WeekDay } from "calendar-utils/dist/calendarUtils";
import {Router} from '@angular/router';
import {AuthenticationService} from "../_services/auth.service";

const colors: any = {
    red: {
        primary: '#ad2121',
        secondary: '#FAE3E3'
    },
    blue: {
        primary: '#1e90ff',
        secondary: '#D1E8FF'
    },
    yellow: {
        primary: '#e3bc08',
        secondary: '#FDF1BA'
    }
};

@Component({
  selector: 'app-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})

export class CalendarComponent implements OnChanges, OnInit {

  @ViewChild('modalContent') modalContent: TemplateRef<any>;

    /**
     * The locale used to format dates
     */
    @Input() locale: string;

    /**
     * The start number of the week
     */
    @Input() weekStartsOn: number = 1;

    /**
     * An array of day indexes (0 = sunday, 1 = monday etc) that will be hidden on the view
     */
    @Input() excludeDays: number[] = [];

    public showAddEvent = false;

    isStaff: boolean;
    firstName: string;
    lastName: string;
    view: string = 'month';
    today: Date = new Date();
    weekStart: Date = new Date(this.today.getDate() - this.today.getDay());
    weekEnd: Date = new Date(this.today.getDate() - this.today.getDay() + 6);

    viewDate: Date = new Date();

    dayStart: number = 9;
    dayEnd: number = 18;

    showEventModal() {
        this.showAddEvent = true;
    }

    hideEventModal() {
        this.showAddEvent = false;
    }

    actions: CalendarEventAction[] = [{
        label: '<i class="fa fa-fw fa-pencil"></i>',
        onClick: ({event}: {event: CalendarEvent}): void => {
            this.handleEvent('Edited', event);
        }
    }, {
        label: '<i class="fa fa-fw fa-times"></i>',
        onClick: ({event}: {event: CalendarEvent}): void => {
            this.events = this.events.filter(iEvent => iEvent !== event);
            this.handleEvent('Deleted', event);
        }
    }];

    refresh: Subject<any> = new Subject();

    /**
     * @hidden
     */
    days: WeekDay[];

    events: CalendarEvent[] = [{
        start: startOfDay(this.weekStart),
        end: endOfDay(this.weekStart),
        title: 'MONDAY',
        color: colors.red,
        actions: this.actions
    }, {
        start: addHours(startOfDay(new Date()), 10),
        end: addHours(startOfDay(new Date()), 12),
        title: 'CO Principles of Copyright in Software',
        color: colors.yellow,
        actions: this.actions,
    }, {
        start: addHours(startOfDay(new Date()), 12),
        end: addHours(startOfDay(new Date()), 13),
        title: 'Lunch',
        color: colors.blue,
        actions: this.actions,
    }, {
        start: addHours(startOfDay(new Date()), 13),
        end: addHours(startOfDay(new Date()), 15),
        title: 'CO Principles of Copyright in Software',
        color: colors.yellow,
        actions: this.actions,
    }];

    activeDayIsOpen: boolean = true;

    constructor(private utils: CalendarUtils, @Inject(LOCALE_ID) locale: string, private router: Router, private authenticationService: AuthenticationService) {
        this.locale = locale;
        this.isStaff = JSON.parse(localStorage['currentUser']).is_staff;
        this.firstName = JSON.parse(localStorage['currentUser']).first_name;
        this.lastName = JSON.parse(localStorage['currentUser']).last_name;
    }

    logout(): void {
        this.authenticationService.logout();
    }

    /**
     * @hidden
     */
    ngOnInit(): void {
        this.refreshAll();
    }

    ngOnChanges(changes: any): void {

        if (changes.viewDate) {
            this.refreshHeader();
        }
    }

    dayClicked({date, events}: {date: Date, events: CalendarEvent[]}): void {

        if (isSameMonth(date, this.viewDate)) {
            if (
                (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
                events.length === 0
            ) {
                this.activeDayIsOpen = false;
            } else {
                this.activeDayIsOpen = true;
                this.viewDate = date;
            }
        }
    }

    eventTimesChanged({event, newStart, newEnd}: CalendarEventTimesChangedEvent): void {
        event.start = newStart;
        event.end = newEnd;
        this.handleEvent('Dropped or resized', event);
        this.refresh.next();
    }

    handleEvent(action: string, event: CalendarEvent): void {

    }

    private refreshHeader(): void {
        this.days = this.utils.getWeekViewHeader({
            viewDate: this.viewDate,
            weekStartsOn: this.weekStartsOn,
            excluded: this.excludeDays
        });
    }

    private refreshAll(): void {
        this.refreshHeader();
    }

    // addEvent(): void {
    //     this.events.push({
    //         title: 'New event',
    //         start: startOfDay(new Date()),
    //         end: endOfDay(new Date()),
    //         color: colors.red,
    //         draggable: true,
    //         resizable: {
    //             beforeStart: true,
    //             afterEnd: true
    //         }
    //     });
    //     this.refresh.next();
    // }

}

/*

const colors: any = {
    red: {
        primary: '#ad2121',
        secondary: '#FAE3E3'
    },
    blue: {
        primary: '#1e90ff',
        secondary: '#D1E8FF'
    },
    yellow: {
        primary: '#e3bc08',
        secondary: '#FDF1BA'
    }
};

export class DemoComponent {

    @ViewChild('modalContent') modalContent: TemplateRef<any>;

    view: string = 'month';

    viewDate: Date = new Date();

    modalData: {
        action: string,
        event: CalendarEvent
    };

    actions: CalendarEventAction[] = [{
        label: '<i class="fa fa-fw fa-pencil"></i>',
        onClick: ({event}: {event: CalendarEvent}): void => {
            this.handleEvent('Edited', event);
        }
    }, {
        label: '<i class="fa fa-fw fa-times"></i>',
        onClick: ({event}: {event: CalendarEvent}): void => {
            this.events = this.events.filter(iEvent => iEvent !== event);
            this.handleEvent('Deleted', event);
        }
    }];

    refresh: Subject<any> = new Subject();

    events: CalendarEvent[] = [{
        start: subDays(startOfDay(new Date()), 1),
        end: addDays(new Date(), 1),
        title: 'A 3 day event',
        color: colors.red,
        actions: this.actions
    }, {
        start: startOfDay(new Date()),
        title: 'An event with no end date',
        color: colors.yellow,
        actions: this.actions
    }, {
        start: subDays(endOfMonth(new Date()), 3),
        end: addDays(endOfMonth(new Date()), 3),
        title: 'A long event that spans 2 months',
        color: colors.blue
    }, {
        start: addHours(startOfDay(new Date()), 2),
        end: new Date(),
        title: 'A draggable and resizable event',
        color: colors.yellow,
        actions: this.actions,
        resizable: {
            beforeStart: true,
            afterEnd: true
        },
        draggable: true
    }];

    activeDayIsOpen: boolean = true;

    constructor(private modal: NgbModal) {}

    dayClicked({date, events}: {date: Date, events: CalendarEvent[]}): void {

        if (isSameMonth(date, this.viewDate)) {
            if (
                (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
                events.length === 0
            ) {
                this.activeDayIsOpen = false;
            } else {
                this.activeDayIsOpen = true;
                this.viewDate = date;
            }
        }
    }

    eventTimesChanged({event, newStart, newEnd}: CalendarEventTimesChangedEvent): void {
        event.start = newStart;
        event.end = newEnd;
        this.handleEvent('Dropped or resized', event);
        this.refresh.next();
    }

    handleEvent(action: string, event: CalendarEvent): void {
        this.modalData = {event, action};
        this.modal.open(this.modalContent, {size: 'lg'});
    }

    addEvent(): void {
        this.events.push({
            title: 'New event',
            start: startOfDay(new Date()),
            end: endOfDay(new Date()),
            color: colors.red,
            draggable: true,
            resizable: {
                beforeStart: true,
                afterEnd: true
            }
        });
        this.refresh.next();
    }

} */

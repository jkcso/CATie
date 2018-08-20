export class CalendarEvent {
    constructor(
        public title: string,
        public start: Date,
        public end: Date,
        public isDraggable: boolean,
        public isResizable: boolean) { }
}

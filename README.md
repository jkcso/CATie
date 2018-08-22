# CATie
Smart, Human-Centered Education Platform for Imperial College, Team of Six.  This latest version of this software is closed source and currently maintained from the university.  In this repo I have posted an old iteration (which even includes a package vulnerability) to demonstrate part of my work.  This version is not maintained any more.

## Motivation
Continuous Assessment Tracking Engine (CATE) has been used at the department of Computing, Imperial College London for 16 years. It contains various features such as a timetable, coursework submissions serving both lecturers and students and notes upload.  However, CATe was written in old technology (Perl) and consequently it is difficult to maintain or extend because of bad software principles followed.  In addition, mobile and tablet devices are not supported and the user experience is not friendly.

## Achievements
Replaced the previous 16-year-old system and improved user experience through iterative feedback from students and staff.  Personally, I have developed and tested 33% of Back End using Django including Scheduling with Google and Outlook Calendar integration.

## BackEnd
Implemented feature-wise in Python's Django along with a PostgreSQL database.  A subset of features follows:
* Ask: a dedicated page for each course where students can post questions and get responses from classmates or lecturers.
* Planner: Integrates with Outlook and Google Calendar in the same website.  The goal is to then synchronise automatically with scheduling apps such as Wunderlist, Trello and others.  By this, we expect the user to ideally organise her or his day in our website and get mobile notifications about it while on the go.
* Courses: A collection of courses a student is able to pick including details on pre-requisites, timetables, courseworks and exam info.
* Lecture: An on-site functionality to watch recorded lectures from Panopto website without the need of redirection.
* Login: The login feature for students and staff.

## FrontEnd
Built on Angular and TypeScript, please find more information from the README.md file inside /frontend directory.

## License
The copyright of this project belongs to Imperial College London.

## Note
Part of my work is intentionally broken or misleading to avoid disrespectful people from copying and pasting.

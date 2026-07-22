# Scholaris Modern Web Suite 🎓

Scholaris is a premium, custom educational management platform engineered to replace generic school ERPs with a tailored, modern web experience. By moving away from Odoo, Scholaris provides 100% control over the user experience, lightning-fast rendering, and a robust relational architecture.

---

## 🛠️ Technology Stack
* **Frontend**: React (Vite) + Vanilla CSS (Premium Glassmorphism Design System)
* **Backend**: Node.js (Express) + Prisma ORM
* **Database**: PostgreSQL (Docker-orchestrated)
* **Authentication**: Token-based Sessions (manual backend routes)

---

## 🗺️ Master Blueprint & Functional Requirements
The following specifications have been compiled from the legacy Odoo implementation. They serve as the functional blueprint for Scholaris, which will be built out phase-by-phase.

---

### 1. Core Academics
The foundation of the entire system, managing basic records of the institution:
* **Students**:
  * Fields: First Name, Middle Name, Last Name, Registration Number (`gr_no`), Birth Date, Gender, Blood Group, Nationality, ID Card Number, Visa Details, Emergency Contact, and active Portal User account.
  * Student Course Details: Links a student to a Course, Intake Batch, Roll Number, Term, active/finished status, and a list of enrolled subjects.
* **Faculty**:
  * Fields: First Name, Middle Name, Last Name, Birth Date, Blood Group, Gender, Nationality, ID Card Number, Main Department, Allowed Departments, and associated HR Employee record.
  * Taught Subjects: Many-to-many relationship mapping courses/subjects the faculty is certified to teach.
* **Courses**:
  * Fields: Course Name, Course Code, Parent/Child Hierarchical Course relationships, Evaluation Type (Normal, GPA, CWA, CCE), Minimum/Maximum Unit Loads, Department, and related Subjects.
* **Intake Batches**:
  * Fields: Code, Name, Start Date, End Date, Course Reference, and active status.
* **Subjects**:
  * Fields: Name, Code, Grade Weightage, Type (Theory, Practical, Both, Other), Subject Type (Compulsory, Elective), and Department.
* **Subject Registration**:
  * Workflow: Enables students to apply for elective courses within unit load constraints. Includes a state workflow: `Draft` ➔ `Submitted` ➔ `Approved` (automatically appends selected electives to student's course record) or `Rejected`.
* **Academic Years & Terms**:
  * Structure: Configures academic cycles (e.g. Years, Semesters, or Quarters) with start/end bounds and term structures.
* **Departments**:
  * Structure: Hierarchical departments (Name, Code, Parent Department).

---

### 2. Admissions Registry
Manages prospective applicants and the enrollment pipeline:
* **Admission Registers**:
  * Fields: Campaign Name, Start/End Dates, Minimum/Maximum capacities, Minimum Age Criteria, target Course/Program, and associated Application Fee.
  * States: `Draft` ➔ `Confirmed` ➔ `Application Gathering` (accepting applicants) ➔ `Admission Process` (reviewing candidates) ➔ `Done`.
* **Applications**:
  * Fields: Application Number, First/Middle/Last Name, Birth Date, Target Course/Batch, Contact Info (Street, City, Zip, Phone, Email, Country), Gender, Previous Education History (Institute, Course, Result), Family Income, Application Fee Term, and enrollment status.
  * Workflow: `Draft` ➔ `Submitted` ➔ `Confirmed` ➔ `Admission Confirm` (generates the `Student` record and links details automatically) ➔ `Done` or `Rejected` / `Cancelled`.

---

### 3. Finance & Fees
Handles billing installment plans and invoices:
* **Fees Terms**:
  * Structure: Installment structures divided by days (e.g., net 30) or specific dates. Percentages across terms must sum to exactly 100%.
  * Fees Elements: Breaks down the fee lines into categories (e.g., Tuition, Library Fee, Lab Fee, Sports Fee).
* **Student Fees Details**:
  * Fields: Student Reference, Course, Batch, Amount, Installment Term Line, Discount (%), calculated Total, Payment Submission Date, and Billing State (`Draft` ➔ `Invoice Created` ➔ `Cancelled`).
  * Workflow: Generates line-item invoice records calculating the fractional split of installment fees across respective accounts.

---

### 4. Timetables & Sessions
Schedules academic periods and prevents scheduling resource conflicts:
* **Periods (Timings)**:
  * Fields: Name, Hour/Minute (AM/PM), Duration (hours), and Sequence.
* **Sessions**:
  * Fields: Session Title, Course, Batch, Subject, Assigned Faculty, Classroom/Room, Start Datetime, End Datetime, and state (`Draft` ➔ `Confirmed` ➔ `Done` ➔ `Cancelled`).
  * Constraints: Prevents booking overlaps for:
    * Faculty (same faculty cannot teach two classes at once).
    * Classrooms (same room cannot host two sessions at once).
    * Batches (a student intake batch cannot attend two sessions at once).

---

### 5. Daily Attendance
Manages student check-in lists:
* **Attendance Sheets**:
  * Fields: Sheet Code, Date, Register Reference, Course, Batch, Session link, and Supervisor Faculty.
  * States: `Draft` ➔ `Attendance Start` (enables check sheets) ➔ `Attendance Taken` (locked check sheet) ➔ `Cancelled`.
* **Attendance Lines**:
  * Fields: Student Reference, Date, Present/Absent-Excused/Absent-Unexcused/Late status, remark field, and optional custom Attendance Types. Toggling present/absent/late automatically updates associated flags.

---

### 6. Exam Evaluations
Manages student test scheduling and grading marksheets:
* **Exams**:
  * Fields: Exam Name, Code, Session, Subject, Course, Batch, Start/End time, Total Marks, Passing Marks, and Responsible Faculty.
  * States: `Draft` ➔ `Scheduled` ➔ `Held` ➔ `Result Updated` ➔ `Done`.
  * Constraints: Prevents exam session timing overlap.
* **Exam Attendees**:
  * Fields: Student, Status (Present/Absent), Marks, and Exam Room.
  * Validation: Present student marks must be between 0 and Total Marks. Absent student marks are automatically forced to 0.
* **Marksheet Registers**:
  * Fields: Exam Session, Generated Date, Author, Result Template, Total Pass, Total Fail, and state (`Draft` ➔ `Validated` ➔ `Cancelled`). Holds individual sheet results for validating grading boundaries.

---

### 7. Assignment Posts
Manages homework task workflows:
* **Assignments**:
  * Fields: Title, Description, Course, Batch, Subject, Issued Date, Submission Date (Deadline), Max Points/Marks, Assigned Faculty, and publishing state (`Draft` ➔ `Published` ➔ `Finished` ➔ `Cancelled`).
* **Submissions**:
  * Fields: Student, Submission Date, description text/response, state (`Draft` ➔ `Submitted` ➔ `Rejected` ➔ `Change Required` ➔ `Accepted`), Marks awarded, and Reviewer feedback.

---

### 8. Library Management
Cataloging, reservation, and checkout system:
* **Media & Units**:
  * Catalog: Media titles, Authors, Publishers, ISBN/ISSN, Media Type, and tags.
  * Physical Copies: Media Units tracked by individual barcodes and status (`Available`, `Issued`, `Reserved`, `Lost`).
* **Library Cards**:
  * Rules: Card type mappings detailing borrowing limits (e.g., maximum borrowable items and duration limits per student or faculty user).
* **Media Movements**:
  * Details: Borrower (Student/Faculty), Card details, Copy Barcode, Issued Date, Due Date, Actual Return Date, and status (`Available` ➔ `Reserved` ➔ `Issued` ➔ `Returned`).
  * Fines: Automatically calculates penalty fees for late returns based on overdue days.

---

### 9. Supporting Modules
* **Parent Portal**: Connects parent contacts to student profiles with relationship tags (Father, Mother, Guardian).
* **Classroom Allocation**: Manages classroom capacities (seating size) and registers mapped room facilities (projectors, lab kits, desks).
* **Co-curricular Activities**: Logs co-curricular activities and athletic records linking students, dates, supervisor faculty, and activity details.

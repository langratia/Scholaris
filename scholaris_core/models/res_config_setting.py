###############################################################################
#
#    Scholaris Inc
#    Copyright (C) 2009-TODAY Scholaris Inc(<https://www.scholaris.org>).
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Lesser General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Lesser General Public License for more details.
#
#    You should have received a copy of the GNU Lesser General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
###############################################################################

from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    module_scholaris_activity = fields.Boolean(string="Activity")
    module_scholaris_facility = fields.Boolean(string="Facility")
    module_scholaris_parent = fields.Boolean(string="Parent")
    module_scholaris_assignment = fields.Boolean(string="Assignment")
    module_scholaris_classroom = fields.Boolean(string="Classroom")
    module_scholaris_fees = fields.Boolean(string="Fees")
    module_scholaris_admission = fields.Boolean(string="Admission")
    module_scholaris_timetable = fields.Boolean(string="Timetable")
    module_scholaris_exam = fields.Boolean(string="Exam")
    module_scholaris_library = fields.Boolean(string="Library")
    module_scholaris_attendance = fields.Boolean(string="Attendance")
    module_scholaris_quiz = fields.Boolean(string="Quiz Enterprise")
    module_scholaris_discipline = fields.Boolean(
        string="Discipline Enterprise")
    module_scholaris_health_enterprise = fields.Boolean(
        string="Health Enterprise")
    module_scholaris_achievement_enterprise = fields.Boolean(
        string="Achievement Enterprise")
    module_scholaris_activity_enterprise = fields.Boolean(
        string="Activity Enterprise")
    module_scholaris_admission_enterprise = fields.Boolean(
        string="Admission Enterprise")
    module_scholaris_alumni_enterprise = fields.Boolean(
        string="Alumni Enterprise")
    module_scholaris_alumni_blog_enterprise = fields.Boolean(
        string="Alumni Blog Enterprise")
    module_scholaris_alumni_event_enterprise = fields.Boolean(
        string="Alumni Event Enterprise")
    module_scholaris_alumni_job_enterprise = fields.Boolean(
        string="Alumni Job Enterprise")
    module_scholaris_job_enterprise = fields.Boolean(
        string="Job Enterprise")
    module_scholaris_assignment_enterprise = fields.Boolean(
        string="Assignment Enterprise")
    module_scholaris_assignment_rubrics = fields.Boolean(
        string="Assignment Rubrics")
    module_scholaris_attendance_enterprise = fields.Boolean(
        string="Attendance Enterprise")
    module_scholaris_student_attendance_enterprise = fields.Boolean(
        string="Student Attendance Kiosk")
    module_bigbluebutton = fields.Boolean(
        string="Bigbluebutton Enterprise")
    module_scholaris_campus_enterprise = fields.Boolean(
        string="Campus Enterprise")
    module_scholaris_classroom_enterprise = fields.Boolean(
        string="Classroom Enterprise")
    module_scholaris_exam_enterprise = fields.Boolean(
        string="Exam Enterprise")
    module_scholaris_facility_enterprise = fields.Boolean(
        string="Facility Enterprise")
    module_scholaris_fees_plan = fields.Boolean(
        string="Fees Plan")
    module_scholaris_fees_parent_bridge = fields.Boolean(
        string="Fees Parent Bridge")
    module_scholaris_library_barcode = fields.Boolean(
        string="Library Barcode Enterprise")
    module_scholaris_library_enterprise = fields.Boolean(
        string="Library Enterprise")
    module_scholaris_lms = fields.Boolean(
        string="LMS Enterprise")
    module_scholaris_lms_blog = fields.Boolean(
        string="LMS Blog Enterprise")
    module_scholaris_lms_forum = fields.Boolean(
        string="LMS Forum Enterprise")
    module_scholaris_lms_gamification = fields.Boolean(
        string="LMS Gamification Enterprise")
    module_scholaris_lms_sale = fields.Boolean(
        string="LMS Sale Enterprise")
    module_scholaris_lms_survey = fields.Boolean(
        string="LMS Survey Enterprise")
    module_scholaris_meeting_enterprise = fields.Boolean(
        string="Meeting Enterprise")
    module_scholaris_dynamic_admission = fields.Boolean(
        string="Dynamic Admission")
    module_scholaris_parent_enterprise = fields.Boolean(
        string="Parent Enterprise")
    module_scholaris_placement_enterprise = fields.Boolean(
        string="Placement Enterprise")
    module_scholaris_placement_job_enterprise = fields.Boolean(
        string="Placement Job Enterprise")
    module_scholaris_scholarship_enterprise = fields.Boolean(
        string="Scholarship Enterprise")
    module_scholaris_timetable_enterprise = fields.Boolean(
        string="Timetable Enterprise")
    module_scholaris_transportation_enterprise = fields.Boolean(
        string="Transportation Enterprise")
    module_scholaris_lesson = fields.Boolean(
        string="Lesson Enterprise")
    module_scholaris_skill_enterprise = fields.Boolean(
        string="Skill Enterprise")
    module_scholaris_assignment_grading_enterprise = fields.Boolean(
        string="Assignment Grading Enterprise")
    module_scholaris_assignment_grading_bridge = fields.Boolean(
        string="Assignment Gradebook Bridge")
    module_scholaris_lms_admission = fields.Boolean(
        string="LMS Admission")
    module_backend_theme = fields.Boolean(
        string="Backend Theme")
    module_scholaris_crm_enterprise = fields.Boolean(
        string="CRM Enterprise")
    module_scholaris_dashboard_kpi = fields.Boolean(
        string="Dashboard KPI")
    module_scholaris_digital_library = fields.Boolean(
        string="Digital Library")
    module_scholaris_event_enterprise = fields.Boolean(
        string="Event Enterprise")
    module_scholaris_exam_gpa_enterprise = fields.Boolean(
        string="Exam GPA Enterprise")
    module_scholaris_exam_grading_bridge = fields.Boolean(
        string="Exam Grading Bridge")
    module_googlemeet = fields.Boolean(
        string="Google Meet")
    module_scholaris_grading = fields.Boolean(
        string="Grading")
    module_scholaris_jitsi_enterprise = fields.Boolean(
        string="Jitsi Enterprise")
    module_scholaris_quiz_anti_cheating = fields.Boolean(
        string="Quiz Anti Cheating")
    module_scholaris_skypemeet = fields.Boolean(
        string="Skype Meet")
    module_scholaris_student_progress_enterprise = fields.Boolean(
        string="Student Progress Enterprise")
    module_scholaris_subject_material_allocation = fields.Boolean(
        string="Subject Material Allocation")
    module_teams = fields.Boolean(
        string="Teams")
    module_zoom = fields.Boolean(
        string="Zoom")
    module_scholaris_student_leave_enterprise = fields.Boolean(
        string="Student Leave")
    module_scholaris_notice_board_enterprise = fields.Boolean(
        string="Notice Board Enterprise")
    module_scholaris_student_skill_assessment = fields.Boolean(
        string="Skill Assessment Enterprise")
    module_scholaris_lms_h5p = fields.Boolean(
        string="LMS H5P Enterprise")
    module_online_appointment = fields.Boolean(
        string="Online Appointment Enterprise")
    module_scholaris_grievance_enterprise = fields.Boolean(
        string="Grievance")
    module_scholaris_secure = fields.Boolean(
        string="Secure QR")
    module_scholaris_mass_subject_registration = fields.Boolean(
        string="Mass Subject Registration")
    module_scholaris_attendance_report_xlsx = fields.Boolean(
        string="Attendance Xlsx Report")
    module_scholaris_asset_request_enterprise = fields.Boolean(
        string="Asset Request Enterprise")
    module_scholaris_live = fields.Boolean(
        string="Live Meeting")
    module_scholaris_live_assignment = fields.Boolean(
        string="Live Meeting Assignment")
    module_scholaris_live_attendance = fields.Boolean(
        string="Live Meeting Attendance")
    module_scholaris_live_attentiveness = fields.Boolean(
        string="Live Meeting Attentiveness")
    module_scholaris_attendance_face_recognition = fields.Boolean(
        string="Attendance Face Recognition")
    module_scholaris_omr = fields.Boolean(
        string="OMR")
    module_auto_database_backup = fields.Boolean(
        string="Database Backup to Local Server")
    module_auto_database_backup_dropbox = fields.Boolean(
        string="Database Backup to Dropbox")
    module_auto_database_backup_ftp = fields.Boolean(
        string="Database Backup to Remote FTP Server")
    module_auto_database_backup_google_drive = fields.Boolean(
        string="Database Backup to Google Drive")
    module_auto_database_backup_onedrive = fields.Boolean(
        string="Database Backup to Onedrive")
    module_auto_database_backup_sftp = fields.Boolean(
        string="Database Backup to Remote SFTP Server")
    attendance_subject_generic = fields.Selection(
        [('subject', 'Subject Wise'), ('generic', 'Generic')],
        help=(
            "Subject-specific attendance will be gathered during a "
            "particular session, whereas general attendance will be "
            "collected by one responsible faculty member for the "
            "entire day."
        ),
        config_parameter="attendance_subject_generic_parameter",
        default='subject'
    )
    module_scholaris_thesis = fields.Boolean(string='Thesis')
    module_scholaris_convocation = fields.Boolean(string='Convocation')
    module_scholaris_grading_migration_bridge = fields.Boolean(
        string="Student Migration Grading Bridge")
    module_scholaris_exam_migration_bridge = fields.Boolean(
        string="Student Migration Exam Bridge")
    module_scholaris_student_feedback_management = fields.Boolean(
        string="Student Feedback")
    module_scholaris_student_withdrawal_mgmt = fields.Boolean(
        string="Student Withdrawal Management")
    module_scholaris_admission_grading_bridge = fields.Boolean(string="Admission Grading Bridge")
    module_scholaris_student_mentor = fields.Boolean(
        string="Student Mentor")

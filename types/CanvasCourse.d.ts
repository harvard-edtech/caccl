import CanvasEnrollment from './CanvasEnrollment';
import CanvasTerm from './CanvasTerm';
interface CanvasCourse {
    id: number;
    sis_course_id?: string | null;
    uuid: string;
    integration_id?: any | null;
    sis_import_id?: number | null;
    name: string;
    course_code: string;
    workflow_state: ('unpublished' | 'available' | 'completed' | 'deleted');
    account_id: number;
    root_account_id: number;
    enrollment_term_id: number;
    grading_periods?: any[] | null;
    grading_standard_id?: number | null;
    grade_passback_setting?: string | null;
    created_at: string;
    start_at?: string | null;
    end_at?: string | null;
    locale?: string | null;
    enrollments?: CanvasEnrollment[] | null;
    total_students?: number | null;
    calendar?: any | null;
    default_view: ('feed' | 'wiki' | 'modules' | 'assignments' | 'syllabus' | string);
    syllabus_body?: string | null;
    needs_grading_count?: number | null;
    term?: CanvasTerm | null;
    course_progress?: {
        requirement_count: number;
        requirement_completed_count: number;
        next_requirement_url?: (string | null);
        completed_at?: (string | null);
    } | null;
    apply_assignment_group_weights: boolean;
    permissions?: {
        create_discussion_topic: boolean;
        create_announcement: boolean;
    } | null;
    is_public: boolean;
    is_public_to_auth_users: boolean;
    public_syllabus: boolean;
    public_syllabus_to_auth: boolean;
    public_description: string;
    storage_quota_mb: number;
    storage_quota_used_mb: number;
    hide_final_grades: boolean;
    license: string;
    allow_student_assignment_edits: boolean;
    allow_wiki_comments: boolean;
    allow_student_forum_attachments: boolean;
    open_enrollment: boolean;
    self_enrollment: boolean;
    restrict_enrollments_to_course_dates: boolean;
    course_format: string;
    access_restricted_by_date?: boolean;
    time_zone: string;
    blueprint?: any | null;
    blueprint_restrictions?: {
        content: boolean;
        points: boolean;
        due_dates: boolean;
        availability_dates: boolean;
    } | null;
    blueprint_restrictions_by_object_type?: {
        assignment: {
            content: boolean;
            points: boolean;
        };
        wiki_page: {
            content: boolean;
        };
    } | null;
    template?: boolean | null;
}
export default CanvasCourse;

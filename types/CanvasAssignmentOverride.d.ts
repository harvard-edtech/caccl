interface CanvasAssignmentOverride {
    id: number;
    assignment_id: number;
    student_ids?: number[] | null;
    group_id?: number | null;
    course_section_id?: number | null;
    title?: string | null;
    due_at?: string | null;
    all_day?: boolean | null;
    all_day_date?: string | null;
    unlock_at?: string | null;
    lock_at?: string | null;
}
export default CanvasAssignmentOverride;

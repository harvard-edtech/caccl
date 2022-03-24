interface CanvasSection {
    id: number;
    name: string;
    sis_section_id: string;
    integration_id?: string | null;
    sis_import_id?: number | null;
    course_id: number;
    sis_course_id?: string | null;
    start_at?: string | null;
    end_at?: string | null;
    restrict_enrollments_to_section_dates?: any | null;
    nonxlist_course_id?: number | null;
    total_students?: number | null;
}
export default CanvasSection;

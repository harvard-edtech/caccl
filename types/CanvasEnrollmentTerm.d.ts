interface CanvasEnrollmentTerm {
    id: number;
    sis_term_id?: string | null;
    sis_import_id?: number | null;
    name: string;
    created_at: string;
    start_at?: string | null;
    end_at?: string | null;
    workflow_state: ('active' | 'deleted');
    overrides: {
        [k: string]: {
            start_at?: string;
            end_at?: string;
        };
    };
}
export default CanvasEnrollmentTerm;

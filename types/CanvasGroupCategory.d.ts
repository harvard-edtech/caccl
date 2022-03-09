import CanvasProgress from './CanvasProgress';
interface CanvasGroupCategory {
    id: number;
    name: string;
    role: ('communities' | 'student_organized' | 'imported');
    self_signup?: ('restricted' | 'enabled' | null);
    auto_leader?: ('random' | 'first' | null);
    context_type: string;
    account_id: number;
    course_id?: number | null;
    group_limit?: number | null;
    sis_group_category_id?: string | null;
    sis_import_id?: number | null;
    progress?: CanvasProgress | null;
}
export default CanvasGroupCategory;

import CanvasUser from './CanvasUser';
interface CanvasGroup {
    id: number;
    name: string;
    description?: string;
    is_public?: boolean | null;
    followed_by_user?: boolean | null;
    join_level: ('invitation_only' | 'parent_context_auto_join' | 'parent_context_request');
    members_count: number;
    avatar_url?: string | null;
    context_type?: string | null;
    course_id?: number | null;
    account_id?: number | null;
    role?: ('communities' | 'student_organized' | 'imported') | null;
    group_category_id?: number | null;
    sis_group_id?: string | null;
    sis_import_id?: number | null;
    storage_quota_mb: number;
    permissions?: {
        create_discussion_topic: boolean;
        create_announcement: boolean;
    } | null;
    users?: CanvasUser[] | null;
}
export default CanvasGroup;

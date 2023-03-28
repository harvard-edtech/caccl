interface CanvasPage {
    page_id: number;
    url: string;
    title: string;
    created_at: string;
    updated_at?: string | null;
    hide_from_students?: boolean | null;
    editing_roles?: string | null;
    last_edited_by?: any | null;
    body?: string | null;
    published?: boolean | null;
    front_page?: boolean | null;
    locked_for_user?: boolean | null;
    lock_info?: any | null;
    lock_explanation?: string | null;
}
export default CanvasPage;

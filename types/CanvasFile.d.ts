interface CanvasFile {
    id: number;
    uuid: string;
    folder_id: number;
    display_name: string;
    filename: string;
    'content-type': string;
    url: string;
    size: number;
    created_at: string;
    updated_at: string;
    unlock_at: string | null;
    locked: boolean;
    hidden: boolean;
    lock_at: string | null;
    hidden_for_user: boolean;
    thumbnail_url: string | null;
    modified_at: string;
    mime_class: string;
    media_entry_id: string;
    locked_for_user: boolean;
    lock_info: any;
    lock_explanation?: string;
    preview_url?: null | string;
}
export default CanvasFile;

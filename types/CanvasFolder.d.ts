interface CanvasFolder {
    context_type: string;
    context_id: number;
    files_count: number;
    position: number;
    updated_at: string;
    folders_url: string;
    files_url: string;
    full_name: string;
    lock_at: string;
    id: number;
    folders_count: number;
    name: string;
    parent_folder_id: number;
    created_at: string;
    unlock_at: string | null;
    hidden: boolean;
    hidden_for_user: boolean;
    locked: boolean;
    locked_for_user: boolean;
    for_submissions: boolean;
}
export default CanvasFolder;

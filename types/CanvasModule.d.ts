interface CanvasModule {
    id: number;
    workflow_state: ('active' | 'deleted');
    position: number;
    name: string;
    unlock_at: string | null;
    require_sequential_progress: boolean;
    prerequisite_module_ids: number[];
    items_count: number;
    items_url: string;
    items?: number[];
    state?: ('locked' | 'unlocked' | 'started' | 'completed');
    completion_date?: string;
    publish_final_grade: boolean;
    published?: boolean;
}
export default CanvasModule;

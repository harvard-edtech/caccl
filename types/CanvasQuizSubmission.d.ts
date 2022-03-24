interface CanvasQuizSubmission {
    id: number;
    quiz_id: number;
    user_id: number;
    submission_id: number;
    started_at: string;
    finished_at?: string | null;
    end_at?: string | null;
    attempt?: number | null;
    extra_attempts?: number | null;
    extra_time?: number | null;
    manually_unlocked?: boolean | null;
    time_spent: number;
    score?: number | null;
    score_before_regrade?: number | null;
    kept_score?: number | null;
    fudge_points?: number | null;
    has_seen_results?: boolean | null;
    workflow_state: ('untaken' | 'pending_review' | 'complete' | 'settings_only' | 'preview');
    overdue_and_needs_submission?: boolean | null;
}
export default CanvasQuizSubmission;

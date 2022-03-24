declare type CanvasCourseLevelAssignmentData = ({
    assignment_id: number;
    title: string;
    points_possible?: number | null;
    due_at?: string | null;
    lock_at?: string | null;
    unlock_at?: string | null;
    muted?: boolean | null;
    min_score?: number | null;
    max_score?: number | null;
    median?: number | null;
    first_quartile?: number | null;
    third_quartile?: number | null;
    tardiness_breakdown: {
        on_time?: number | null;
        missing?: number | null;
        late?: number | null;
        total?: number | null;
    };
})[];
export default CanvasCourseLevelAssignmentData;

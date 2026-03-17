type CanvasCourseLevelStudentSummaries = ({
    id: number;
    page_views?: number | null;
    page_views_level?: string | null;
    max_page_view?: number | null;
    participations?: number | null;
    participations_level?: string | null;
    max_participations?: number | null;
    tardiness_breakdown: {
        total?: number | null;
        on_time?: number | null;
        late?: number | null;
        missing?: number | null;
        floating?: number | null;
    };
})[];
export default CanvasCourseLevelStudentSummaries;

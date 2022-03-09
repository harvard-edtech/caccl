interface CanvasRubricAssociation {
    id: number;
    rubric_id: number;
    association_id: number;
    association_type: string;
    use_for_grading?: boolean | null;
    summary_data?: string | null;
    purpose?: string | null;
    hide_score_total: boolean;
    hide_points: boolean;
    hide_outcome_results: boolean;
}
export default CanvasRubricAssociation;

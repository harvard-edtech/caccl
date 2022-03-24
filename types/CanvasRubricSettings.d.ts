import CanvasRubricCriterion from './CanvasRubricCriterion';
interface CanvasRubricSettings {
    id: number;
    title: string;
    context_id: number;
    context_type: string;
    points_possible: number;
    reusable?: boolean | null;
    read_only?: boolean | null;
    free_form_criterion_comments?: boolean | null;
    hide_score_total?: boolean | null;
    data: CanvasRubricCriterion[];
    assessments?: null | null;
    associations: null;
}
export default CanvasRubricSettings;

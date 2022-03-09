import CanvasRubricAssessment from './CanvasRubricAssessment';
import CanvasRubricAssociation from './CanvasRubricAssociation';
import CanvasRubricCriterion from './CanvasRubricCriterion';
interface CanvasRubric {
    id: number;
    title: string;
    context_id: number;
    context_type: string;
    points_possible: number;
    reusable?: boolean | null;
    read_only?: boolean | null;
    free_form_criterion_comments: boolean;
    hide_score_total?: boolean | null;
    data?: CanvasRubricCriterion[] | null;
    assessments?: CanvasRubricAssessment[] | null;
    associations?: CanvasRubricAssociation[] | null;
}
export default CanvasRubric;

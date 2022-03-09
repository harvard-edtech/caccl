import CanvasQuizAnswer from './CanvasQuizAnswer';
import CanvasQuizQuestionType from './CanvasQuizQuestionType';
interface CanvasQuizQuestion {
    id: number;
    quiz_id: number;
    position: number;
    question_name: string;
    question_type: CanvasQuizQuestionType;
    question_text: string;
    points_possible: number;
    correct_comments?: string | null;
    incorrect_comments?: string | null;
    neutral_comments?: string | null;
    answers?: CanvasQuizAnswer[] | null;
}
export default CanvasQuizQuestion;

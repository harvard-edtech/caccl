interface CanvasQuizAnswer {
    id: number;
    answer_text: string;
    answer_weight?: number | null;
    answer_comments?: string | null;
    text_after_answers?: string | null;
    answer_match_left?: string | null;
    answer_match_right?: string | null;
    matching_answer_incorrect_matches?: string | null;
    numerical_answer_type?: ('exact_answer' | 'range_answer' | 'precision_answer') | null;
    exact?: number | null;
    margin?: number | null;
    approximate?: number | null;
    precision?: number | null;
    start?: number | null;
    end?: number | null;
    blank_id?: number | null;
}
export default CanvasQuizAnswer;

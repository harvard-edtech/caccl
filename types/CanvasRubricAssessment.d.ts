interface CanvasRubricAssessment {
    [k: string]: {
        points: number;
        rating_id: string;
        comments: string;
    };
}
export default CanvasRubricAssessment;

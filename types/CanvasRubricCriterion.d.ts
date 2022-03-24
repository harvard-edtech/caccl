interface CanvasRubricCriterion {
    id: string;
    description?: string | null;
    long_description?: string | null;
    points: number;
    criterion_use_range?: boolean | null;
    ratings?: ({
        id: string;
        criterion_id: string;
        description?: string | null;
        long_description?: string | null;
        points: number;
    })[] | null;
}
export default CanvasRubricCriterion;

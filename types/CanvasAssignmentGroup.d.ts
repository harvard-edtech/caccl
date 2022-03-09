import CanvasAssignment from './CanvasAssignment';
interface CanvasAssignmentGroup {
    id: number;
    name: string;
    position: number;
    group_weight: number;
    sis_source_id: string;
    integration_data: any;
    assignments: CanvasAssignment[];
    rules?: {
        drop_lowest?: number;
        drop_highest?: number;
        never_drop?: number[];
    } | null;
}
export default CanvasAssignmentGroup;

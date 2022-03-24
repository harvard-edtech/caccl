import CanvasUser from './CanvasUser';
/**
 * Canvas admin
 * @author Gabe Abrams
 */
interface CanvasAdmin {
    id: number;
    role: string;
    user?: CanvasUser | null;
    workflow_state: string;
}
export default CanvasAdmin;

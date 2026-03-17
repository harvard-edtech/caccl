import CanvasFile from './CanvasFile';
import CanvasProgress from './CanvasProgress';
/**
 * Canvas quiz report
 * @author Gabe Abrams
 */
type CanvasQuizReport = {
    id: number;
    quiz_id: number;
    report_type: 'student_analysis' | 'item_analysis';
    readable_type: string;
    includes_all_versions: boolean;
    anonymous: boolean;
    generatable: boolean;
    created_at: string;
    updated_at: string;
    url: string;
    file?: null | CanvasFile;
    progress_url?: null | string;
    progress?: null | CanvasProgress;
};
export default CanvasQuizReport;

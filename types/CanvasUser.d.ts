import CanvasEnrollment from './CanvasEnrollment';
interface CanvasUser {
    id: number;
    name: string;
    sortable_name: string;
    last_name: string;
    first_name: string;
    short_name: string;
    sis_user_id: string;
    sis_import_id: number;
    integration_id: string;
    login_id: string;
    avatar_url?: string;
    enrollments?: CanvasEnrollment[] | null;
    email?: string | null;
    locale?: string | null;
    last_login?: string | null;
    time_zone?: string | null;
    bio?: string | null;
}
export default CanvasUser;

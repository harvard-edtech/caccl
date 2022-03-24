interface CanvasUserProfile {
    id: number;
    name: string;
    short_name: string;
    sortable_name: string;
    title?: string;
    bio?: string;
    primary_email: string;
    login_id: string;
    sis_user_id?: string;
    lti_user_id?: string;
    avatar_url?: string;
    calendar?: string;
    time_zone?: string;
    locale?: string;
    k5_user?: boolean;
}
export default CanvasUserProfile;

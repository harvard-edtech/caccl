interface CanvasTab {
    html_url: string;
    id: string;
    label: string;
    type: string;
    hidden?: boolean | null;
    visibility: ('public' | 'members' | 'admins' | 'none');
    position: number;
}
export default CanvasTab;

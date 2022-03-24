interface CanvasExternalTool {
    id: number;
    domain: string;
    url: string;
    consumer_key: string;
    name: string;
    description: string;
    created_at: string;
    updated_at?: string | null;
    privacy_level: ('anonymous' | 'name_only' | 'public');
    custom_fields: {
        [k: string]: any;
    };
    account_navigation?: {
        enabled?: boolean | null;
        canvas_icon_class?: string | null;
        icon_url?: string | null;
        text: string;
        url: string;
        label: string;
        selection_width: number;
        selection_height: number;
        display_type: ('full_width' | 'full_width_in_context' | 'in_nav_context' | 'borderless' | 'default');
    } | null;
    assignment_selection?: any | null;
    course_home_sub_navigation?: any | null;
    course_navigation?: {
        enabled: boolean;
        url: string;
        text: string;
        visibility: ('admins' | 'members' | 'public');
        default: ('enabled' | 'disabled');
        windowTarget: ('_blank' | '_self');
        label: string;
        selection_width: number;
        selection_height: number;
        icon_url: string;
    } | null;
    editor_button?: {
        canvas_icon_class: string;
        icon_url: string;
        message_type: string;
        text: string;
        url: string;
        label: string;
        selection_width: number;
        selection_height: number;
    } | null;
    homework_submission?: any | null;
    link_selection?: any | null;
    migration_selection?: any | null;
    resource_selection?: any | null;
    tool_configuration?: any | null;
    user_navigation: {
        canvas_icon_class: string;
        icon_url: string;
        text: string;
        url: string;
        enabled?: boolean | null;
        visibility: ('admins' | 'members' | 'public');
        default: ('enabled' | 'disabled');
        windowTarget: ('_blank' | '_self');
    };
    selection_width: number;
    selection_height: number;
    icon_url?: string | null;
    not_selectable?: boolean;
}
export default CanvasExternalTool;

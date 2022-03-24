import CanvasUser from './CanvasUser';
interface CanvasConversation {
    id: number;
    subject: string;
    workflow_state: ('read' | 'unread' | 'archived');
    last_message?: string | null;
    start_at: string;
    message_count: number;
    subscribed: boolean;
    private: boolean;
    starred: boolean;
    properties?: string[] | null;
    audience?: number[] | null;
    audience_contexts?: any[] | null;
    avatar_url?: string | null;
    participants?: CanvasUser[] | null;
    visible: boolean;
    context_name?: string | null;
}
export default CanvasConversation;

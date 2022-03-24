interface CanvasCommunicationChannel {
    id: number;
    address: string;
    type: ('email' | 'push' | 'sms' | 'twitter');
    position: number;
    user_id: number;
    workflow_state: ('unconfirmed' | 'active');
    created_at: string;
}
export default CanvasCommunicationChannel;

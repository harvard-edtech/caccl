interface CanvasDiscussionTopic {
    id: number;
    title: string;
    message: string;
    html_url: string;
    posted_at?: string | null;
    last_reply_at?: string | null;
    require_initial_post: boolean;
    user_can_see_posts: boolean;
    discussion_subentry_count: number;
    read_state: ('read' | 'unread');
    unread_count: number;
    subscribed: boolean;
    subscription_hold?: ('initial_post_required' | 'not_in_group_set' | 'not_in_group' | 'topic_is_announcement') | null;
    assignment_id?: number | null;
    delayed_post_at?: string | null;
    published: boolean;
    lock_at?: string | null;
    locked: boolean;
    pinned: boolean;
    locked_for_user: boolean;
    lock_info?: boolean | null;
    lock_explanation?: string | null;
    user_name?: string | null;
    group_topic_children?: {
        id: number;
        group_id: number;
    }[] | null;
    root_topic_id?: number | null;
    podcast_url?: string | null;
    discussion_type: ('side_comment' | 'threaded');
    group_category_id?: number;
    attachments?: ({
        'content-type': string;
        url: string;
        filename: string;
        display_name: string;
    })[] | null;
    permissions: {
        [k: string]: boolean;
    };
    allow_rating: boolean;
    only_graders_can_rate?: boolean | null;
    sort_by_rating: boolean;
}
export default CanvasDiscussionTopic;

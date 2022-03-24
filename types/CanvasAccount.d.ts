interface CanvasAccount {
    id: number;
    name: string;
    uuid: string;
    parent_account_id: number;
    root_account_id: number;
    default_storage_quota_mb: number;
    default_user_storage_quota_mb: number;
    default_group_storage_quota_mb: number;
    default_time_zone: string;
    sis_account_id: string;
    integration_id: string;
    sis_import_id: number;
    lti_guid: string;
    workflow_state: string;
}
export default CanvasAccount;

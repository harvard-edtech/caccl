/**
 * List of error codes for the CACCL server
 * @author Gabe Abrams
 */
declare enum ErrorCode {
    NoLaunchInfo = "CSERV1",
    NoPassbackContent = "CSERV2",
    NoOutcomeInfo = "CSERV3",
    PassbackParamNotAccepted = "CSERV4",
    PassbackUnsuccessful = "CSERV5",
    NoAssignmentLaunch = "CSERV6",
    CantInitAPIWithoutLaunch = "CSERV7",
    CantInitAPIWithoutAuth = "CSERV8",
    PassbackBeforeCACCLInitialized = "CSERV9",
    StatusFailed = "CSERV10",
    NoAPIAuthDisabled = "CSERV11"
}
export default ErrorCode;

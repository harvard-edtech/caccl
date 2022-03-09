"use strict";
/**
 * List of error codes for the CACCL server
 * @author Gabe Abrams
 */
Object.defineProperty(exports, "__esModule", { value: true });
// Highest error: CSERV11
var ErrorCode;
(function (ErrorCode) {
    ErrorCode["NoLaunchInfo"] = "CSERV1";
    ErrorCode["NoPassbackContent"] = "CSERV2";
    ErrorCode["NoOutcomeInfo"] = "CSERV3";
    ErrorCode["PassbackParamNotAccepted"] = "CSERV4";
    ErrorCode["PassbackUnsuccessful"] = "CSERV5";
    ErrorCode["NoAssignmentLaunch"] = "CSERV6";
    ErrorCode["CantInitAPIWithoutLaunch"] = "CSERV7";
    ErrorCode["CantInitAPIWithoutAuth"] = "CSERV8";
    ErrorCode["PassbackBeforeCACCLInitialized"] = "CSERV9";
    ErrorCode["StatusFailed"] = "CSERV10";
    ErrorCode["NoAPIAuthDisabled"] = "CSERV11";
})(ErrorCode || (ErrorCode = {}));
;
exports.default = ErrorCode;
//# sourceMappingURL=ErrorCode.js.map
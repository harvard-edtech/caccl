import LaunchInfo from 'caccl-lti/lib/shared/types/LaunchInfo';
/**
 * Status object passed back from CACCL status endpoint
 * @author Gabe Abrams
 */
declare type CACCLStatus = ({
    launched: false;
} | {
    launched: true;
    launchInfo: LaunchInfo;
    authorized: boolean;
});
export default CACCLStatus;

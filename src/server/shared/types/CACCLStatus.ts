import LaunchInfo from 'caccl-lti/lib/shared/types/LaunchInfo';

/**
 * Status object passed back from CACCL status endpoint
 * @author Gabe Abrams
 */
type CACCLStatus = (
  // Not launched
  | {
    // True if the user has launched via LTI
    launched: false,
  }
  // Launched
  | {
    // True if the user has launched via LTI
    launched: true,
    // LTI launch info for the current user
    launchInfo: LaunchInfo,
    // True if the user is authorized with to use the Canvas API
    authorized: boolean,
  }
);

export default CACCLStatus;

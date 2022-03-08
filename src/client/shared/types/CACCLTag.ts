/**
 * Tags so CACCL libs can identify each other
 * @author Gabe Abrams
 */
enum CACCLTag {
  API = 'api',
  API_FORWARDER = 'api-forwarder',
  AUTHORIZER = 'authorizer',
  CANVAS_PARTIAL_SIMULATOR = 'canvas-partial-simulator',
  ERROR = 'error',
  GRADE_PASSBACK = 'grade-passback',
  LTI = 'lti',
  SEND_REQUEST = 'send-request',
  SELF_LAUNCHER = 'self-launcher',
};

export default CACCLTag;

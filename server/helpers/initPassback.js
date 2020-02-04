const sendPassback = require('caccl-grade-passback');
const CACCLError = require('caccl-error');

const errorCodes = require('../../errorCodes');

/**
 * Initializes LTI 1.1 Grade Passback
 * @author Gabe Abrams
 * @param {object} opts - an object containing all arguments
 * @param {Express App} opts.app - the express app to add routes to
 * @param {string} opts.apiForwardPathPrefix - the prefix to add before all
 *   Canvas-related forwarding paths. We will add a
 *   <apiForwardPathPrefix>/gradepassback path for forwarded requests from the
 *   client
 * @param {boolean} opts.disableClientSidePassback - if falsy, the client
 *   app cannot send grade passback to Canvas. If this is set to true, grade
 *   passback requests must be made from the server. Note: leaving this as
 *   false is convenient but does make it possible for clever users to spoof
 *   a grade passback request
 * @param {object} opts.installationCredentials - the app's installation
 *   credentials in the form { consumer_key, consumer_secret }
 */
module.exports = (opts) => {
  const {
    app,
    apiForwardPathPrefix,
    disableClientSidePassback,
    installationCredentials,
  } = opts;

  // Add middleware to add grade passback functionality
  app.use('*', (req, res, next) => {
    /**
     * Send a passback request
     * @author Gabe Abrams
     * @param {object} request - an object containing all the information for
     *   the passback request
     * @param {string} [request.text] - the text of the submission. If this is
     *   included, url cannot be included
     * @param {string} [request.url] - a url to send as the student's
     *   submission. If this is included, text cannot be included
     * @param {number} [request.score] - the student's score on this assignment
     * @param {number} [request.percent] - the student's score as a percent
     *   (0-100) on the assignment
     * @param {Date|string} [request.submittedAt=now] - a timestamp for when the
     *   student submitted the grade. The type must either be a Date object or
     *   an ISO 8601 formatted string
     */
    req.sendPassback = async (request) => {
      // Make sure the request contains something to submit
      if (
        !request
        || Object.keys(request).length === 0
      ) {
        throw new CACCLError({
          message: 'We could not send grades back to Canvas via passback because the request was empty.',
          code: errorCodes.NO_PASSBACK_REQUEST_PARAMS,
        });
      }

      // Make sure we have passback info
      if (
        !req.session
        || !req.session.launchInfo
        || !req.session.launchInfo.outcome
        || !req.session.launchInfo.outcome.sourcedId
        || !req.session.launchInfo.outcome.url
      ) {
        throw new CACCLError({
          message: 'We could not send grades back to Canvas via passback because we don\'t have the information from Canvas to send the request.',
          code: errorCodes.NO_OUTCOME_INFO,
        });
      }

      // Make sure Canvas can accept the request
      if (
        (
          request.url
          && !req.session.launchInfo.outcome.urlSubmissionAccepted
        )
        || (
          request.text
          && !req.session.launchInfo.outcome.textSubmissionAccepted
        )
        || (
          request.score
          && !req.session.launchInfo.outcome.totalScoreAccepted
        )
        || (
          request.submittedAt
          && !req.session.launchInfo.outcome.submittedAtAccepted
        )
      ) {
        // Canvas cannot accept our request
        throw new CACCLError({
          message: 'We could not send grades back to Canvas via passback because Canvas does not support all of the parameters we want to send.',
          code: errorCodes.CANVAS_CANNOT_ACCEPT_OUTCOME_REQUEST,
        });
      }

      // Send request
      return sendPassback(
        request,
        {
          sourcedId: req.session.launchInfo.outcome.sourcedId,
          url: req.session.launchInfo.outcome.url,
        },
        {
          consumerKey: installationCredentials.consumer_key,
          consumerSecret: installationCredentials.consumer_secret,
        }
      );
    };
    next();
  });

  // Add client-side forwarding
  if (!disableClientSidePassback) {
    app.post(
      `${apiForwardPathPrefix}/gradepassback`,
      async (req, res) => {
        // Try to send request
        try {
          await req.sendPassback(req.body);
          // Send success back to client
          return res.json({
            success: true,
          });
        } catch (err) {
          // Send failure back to client
          return res.json({
            success: false,
            message: (
              err.code
                ? err.message
                : 'An unnamed error occurred. Please contact an admin.'
            ),
            code: err.code,
          });
        }
      }
    );
  }
};

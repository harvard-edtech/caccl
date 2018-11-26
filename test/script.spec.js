const initScript = require('../script');
const environment = require('./environment.js');

const courseId = environment.testCourseId;

const {
  accessToken,
  canvasHost,
} = environment;

/*------------------------------------------------------------------------*/
/*                                 Helpers                                */
/*------------------------------------------------------------------------*/

const testAndGetEnrollments = (api, baseOptions = {}) => {
  const optionsWithCourse = baseOptions;
  optionsWithCourse.courseId = courseId;

  return api.course.listEnrollments(optionsWithCourse)
    .then((enrollments) => {
      if (!enrollments || enrollments.length === 0) {
        // No enrollments
        throw new Error('Couldn\'t get the list of enrollments!');
      }
      return enrollments;
    });
};

/*------------------------------------------------------------------------*/
/*                                  Tests                                 */
/*------------------------------------------------------------------------*/

describe.only('Script Initializer', function () {
  describe('Creates a script...', function () {
    it('...with accessToken + canvasHost', function () {
      const api = initScript({
        accessToken,
        canvasHost,
      });

      return testAndGetEnrollments(api);
    });

    it('...with accessToken only', function () {
      const api = initScript({
        accessToken,
      });

      const canvasHostIsDefault = (canvasHost === 'canvas.instructure.com');

      return new Promise((resolve, reject) => {
        // If the environment canvasHost is not canvas.instructure.com, we
        // should get an error when we try to fetch enrollments
        testAndGetEnrollments(api)
          .then(() => {
            if (canvasHostIsDefault) {
              resolve();
            } else {
              reject(new Error('We shouldn\'t have been able to get enrollments since we\'re using the default canvasHost and it\'s different than the one in the environment.'));
            }
          })
          .catch((err) => {
            if (err && !canvasHostIsDefault) {
              // An error is expected
              return resolve();
            }
            // Failure
            reject(err);
          });
      });
    });

    it('...with canvasHost only', function () {
      const api = initScript({
        canvasHost,
      });

      return new Promise((resolve, reject) => {
        // If the environment canvasHost is not canvas.instructure.com, we
        // should get an error when we try to fetch enrollments
        testAndGetEnrollments(api)
          .then(() => {
            reject(new Error('We shouldn\'t have been able to get enrollments since we didn\'t include an access token.'));
          })
          .catch((err) => {
            if (err.code !== 'CANV5') {
              // An error is expected
              return reject(new Error(`We were expecting a CANV5 error but instead, we got ${err.code}: ${err.message}`));
            }
            // We were expecting this error. Resolve
            return resolve();
          });
      });
    });
  });
});

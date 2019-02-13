const initCACCL = require('../../script');
const environment = require('../environment');

const {
  accessToken,
  canvasHost,
} = environment;

describe('Script > Canvas Host Configuration', function () {
  it('Uses canvas.instructure.com when canvasHost is undefined', async function () {
    if (canvasHost === 'canvas.instructure.com') {
      throw new Error('Cannot run this test when environment canvasHost is "canvas.instructure.com"');
    }

    // Pull profile from canvas.instructure.com
    const api = initCACCL({
      canvasHost: undefined,
      accessToken,
    });
    const instructureProfile = await api.user.self.getProfile();

    // Pull profile from canvasHost in environment
    const apiActual = initCACCL({
      canvasHost,
      accessToken,
    });
    const profile = await apiActual.user.self.getProfile();

    // Make sure two different profiles were fetched
    if (instructureProfile.id === profile.id) {
      throw new Error('Profile ids from environment canvas host and instructure match, unexpectedly');
    }

    // Make sure this is the same user
    if (instructureProfile.lti_user_id !== profile.lti_user_id) {
      throw new Error('Environment profile id must be a substring of instructure profile id');
    }
  });

  it('Uses canvas.instructure.com when canvasHost is null', async function () {
    if (canvasHost === 'canvas.instructure.com') {
      throw new Error('Cannot run this test when environment canvasHost is "canvas.instructure.com"');
    }

    // Pull profile from canvas.instructure.com
    const api = initCACCL({
      canvasHost: null,
      accessToken,
    });
    const instructureProfile = await api.user.self.getProfile();

    // Pull profile from canvasHost in environment
    const apiActual = initCACCL({
      canvasHost,
      accessToken,
    });
    const profile = await apiActual.user.self.getProfile();

    // Make sure two different profiles were fetched
    if (instructureProfile.id === profile.id) {
      throw new Error('Profile ids from environment canvas host and instructure match, unexpectedly');
    }

    // Make sure this is the same user
    if (instructureProfile.lti_user_id !== profile.lti_user_id) {
      throw new Error('Environment profile id must be a substring of instructure profile id');
    }
  });
});

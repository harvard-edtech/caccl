const initCACCL = require('../../script');
const environment = require('../environment');
const attemptToListStudents = require('../helpers/attemptToListStudents');

const {
  accessToken,
  canvasHost,
} = environment;

describe('Script > Access Token Configuration', function () {
  it('Works with a valid access token', async function () {
    const api = initCACCL({
      canvasHost,
      accessToken,
    });

    await attemptToListStudents(api);
  });

  it('Fails with null access token', async function () {
    const api = initCACCL({
      canvasHost,
      accessToken: null,
    });

    let error;
    try {
      await attemptToListStudents(api);
    } catch (err) {
      error = err;
    }

    if (!error) {
      throw new Error('Expected an error to occur, but none did');
    } else if (!error.message.includes('we don\'t have an access token')) {
      throw new Error(`The wrong error occurred: ${error.message}`);
    }
  });

  it('Fails with undefined access token', async function () {
    const api = initCACCL({
      canvasHost,
      accessToken: undefined,
    });

    let error;
    try {
      await attemptToListStudents(api);
    } catch (err) {
      error = err;
    }

    if (!error) {
      throw new Error('Expected an error to occur, but none did');
    } else if (!error.message.includes('we don\'t have an access token')) {
      throw new Error(`The wrong error occurred: ${error.message}`);
    }
  });

  it('Fails with whitespace access token', async function () {
    const api = initCACCL({
      canvasHost,
      accessToken: '   ',
    });

    let error;
    try {
      await attemptToListStudents(api);
    } catch (err) {
      error = err;
    }

    if (!error) {
      throw new Error('Expected an error to occur, but none did');
    } else if (!error.message.includes('we don\'t have an access token')) {
      throw new Error(`The wrong error occurred: ${error.message}`);
    }
  });

  it('Fails with invalid token', async function () {
    const api = initCACCL({
      canvasHost,
      accessToken: '32jdfosaidf8098a',
    });

    let error;
    try {
      await attemptToListStudents(api);
    } catch (err) {
      error = err;
    }

    if (!error) {
      throw new Error('Expected an error to occur, but none did');
    } else if (!error.message.includes('Canvas denied us access to a resource because you do not have the proper privileges')) {
      throw new Error(`The wrong error occurred: ${error.message}`);
    }
  });
});

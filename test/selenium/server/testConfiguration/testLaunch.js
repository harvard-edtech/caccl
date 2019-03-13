const { testCourseId } = require('../../../environment');

module.exports = async (driver) => {
  await driver.visit(`https://localhost:8088/courses/${testCourseId}`);
  await driver.click('#launch-button');
  await driver.waitForLocation('https://localhost:8088/login/oauth2/auth');
  await driver.clickByContents('Authorize', 'a');
  await driver.waitForLocation('https://localhost/');
  const body = await driver.getBody();
  if (!body.includes('homepage')) {
    throw new Error('Homepage could not be loaded after launch');
  }
};

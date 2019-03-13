const { testCourseId } = require('../../../environment');

module.exports = async (driver) => {
  driver.visit(`https://localhost:8088/${testCourseId}`);
  driver.pause();
};

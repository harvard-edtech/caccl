const { students, testCourseId } = require('../environment');

module.exports = async (api) => {
  // Pull list of students
  const pulledStudents = await api.course.listStudents({
    courseId: testCourseId,
  });

  // Make sure enviroment list of students is included in pulledStudents
  const includedIds = {};
  pulledStudents.forEach((student) => {
    includedIds[student.id] = true;
  });
  for (let i = 0; i < students.length; i++) {
    if (!includedIds[students[i].canvasId]) {
      // Student was not included!
      throw new Error('When testing if the api was working by listing students in the test course, we couldn\'t verify that all the test students were in Canvas\' response.');
    }
  }
};

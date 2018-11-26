# Environment File

For tests to run properly, you need to:

1. Create a Canvas sandbox course that can be devoted solely to these tests
2. Create one "fake" instructor that has access to the course as an instructor, but has no access to other courses (for security purposes, we don't want to store an access token that has privileges to other courses)
3. Create at least 20 "fake" students and add them to the course, generate access tokens for them
4. Create at least 20 "fake" graders and add them to the course,  generate access tokens for them
5. Create a `./test/environment.js` file with the following contents:

```js
module.exports = {
  accessToken: '<fake instructor access token>',
  testCourseId: <sandbox course id>,
  canvasHost: 'e.g., canvas.instructure.com',
  students: [
    {
      first: '<fake student first name>',
      last:	'<fake student last name>',
      email: '<fake student email>',
      canvasId:	<fake student canvas Id>,
      sis_user_id: '<student sis Id>',
      accessToken: '<fake student access token>'
    },
    ...
  ],
  graders: [
    {
      first: '<fake student first name>',
      last:	'<fake student last name>',
      email: '<fake student email>',
      canvasId:	<fake student canvas Id>,
      sis_user_id: '<student sis Id>',
      accessToken: '<fake student access token>'
    },
    ...
  ]
};

```

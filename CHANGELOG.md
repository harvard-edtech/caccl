# Changelog

All notable changes to this project will be documented in this file.

## 2.1.8

Fixes for scoped OAuth handshakes.

## 2.1.7

Support for simpler launching of the Canvas simulator via `npm run canvas-simulator-start` instead of a direct file path call.

## 2.1.5

Support for custom launch paths in dev environment.

## 2.1.4

Small changes to page document types.

## 2.1.3

New caccl-api endpoint for publishing/unpublishing a discussion topic.

## 2.1.2

New caccl-api endpoint for publishing/unpublishing a course.

## 2.1.1

Allow including a custom server host in client sendRequest calls, but defaults to caccl-defined server host (no change required to existing code).

## 2.1.0

Breaking change: server-side `initCACCL` no longer returns an express app, forcing programmers to effectively use express preprocessor and postprocessor functions. If you need a copy of the express app, simply add an `express.postprocessor` or `express.preprocessor` function to the arguments passed into `initCACCL`.

Also, added self-launch support for server infrastructure that externally uses ssl while communication to the app itself is non-ssl.

## 2.0.20

Now allows users to exclude optional express arguments altogether when initializing CACCL. Previously, those express arguments would need to be included as `undefined`.

## 2.0.19

Better descriptions of caccl-lti types, main exports now include `getLaunchInfo` alias.

## 2.0.18

While performing Canvas course content migrations, assignment group names that already exist will not be duplicated.

## 2.0.17

Added support for performing Canvas course content migrations.

## 2.0.12

Added back shared caccl sub-project types.

## 2.0.11

Fixed rare issue where launch info from an LTI request might not be JSONifiable.

## 2.0.7

Added new API functions to hide and show apps in nav (api.course.app.showInNav and api.course.app.hideFromNav), added docs for already-existing functions for the current user (api.user.self).

## 2.0.6

Added support for api scopes. See readme section called "Add API Scopes"

## 2.0.0

Entirety of CACCL has been redesigned with typescript. Some endpoints have been removed to reduce complexity. Automatic caching has also been removed. New features have been added including the ability for a CACCL-based app to launch itself via Canvas.

## 1.1.0

Major breaking authorization change: instead of accessTokens being stored in the user's session, they are stored in the tokenStore. This means two things: first, that CACCL now supports users being logged into your app in more than one session, and second, that tokenStores must be able to store slightly larger payloads (instead of just the refreshToken, we are now also storing accessToken and expiry timestamp).

## 1.0.106

CACCL Canvas Partial Simulator: Fixed bug where nav launches didn't send proper credentials.

## 1.0.105

CACCL Canvas Partial Simulator: Added instructor token verification.

## 1.0.104

CACCL Canvas Partial Simulator: Added support for multiple launches (TA, Student, etc.), assignment launches, and simpler simulator start

## 1.0.101

Added special encoding of newlines in grade passback so that Canvas recognizes them.

## 1.0.99

Added support for grade passback via the LTI 1.1 outcomes service.

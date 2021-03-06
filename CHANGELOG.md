# Changelog

All notable changes to this project will be documented in this file.

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

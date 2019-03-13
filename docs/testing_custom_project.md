# Testing Custom CACCL Projects

- App is on SSL (use port 443 or if not port 443, add in sslKey and sslCertificate, can be self-signed)
- Launch canvas partial simulator
- Set canvasHost to 'localhost:8088' for the app when in developer mode
- Make sure to accept localhost:8088/verifycert and your app's certificates if they're self-signed
- Run your app and run the canvas partial simulator, and visit https://localhost:8088/courses/<testcourseid> to simulate an LTI launch
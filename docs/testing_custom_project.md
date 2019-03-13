# Testing Custom CACCL Projects

CACCL comes pre-packages with tools for testing your LTI app on your Canvas instance. There are just a few steps to get set up:

## Set Up Testing

### Add Canvas Partial Simulator

The Canvas partial simulator acts as a gatekeeper: your app sends all Canvas traffic to the simulator and the simulator forwards traffic to Canvas. The simulator forwards most traffic (API, etc) to your actual Canvas instance, but does not forward _oauth_ requests. Instead, the simulator mocks the oauth process and returns a pre-determined Canvas access token. Long story short, you can test your app without adding your app to the Canvas instance's list of approved apps. You don't even need developer credentials. This is both safer (Canvas won't have localhost listed as an app) and easier.

#### 1. Create a `devEnvironment.js` config file

In your project, create a `/config` folder and put a `/config/devEnvironment.js` file in it:

```js
module.exports = {
  courseId: 53248,
  canvasHost: 'canvas.school.edu',
  accessToken: '3598~dkjalsd3098mxwnc79...',
};
```

Properties:

- courseId – the Canvas course id of your sandbox test course (where simulated LTI launches will originate from)
- canvasHost – the hostname of the Canvas instance where your sandbox course lives
- accessToken – an access token for a user in your sandbox test course (when simulating an LTI launch, this user will be the one who "clicked" your app)

To get an access token, visit Canvas, click the profile image, click Settings, click "+ Access Token." We recommend creating a new Canvas user that only has access to your sandbox course and creating an access token for that user. Then, your app will only be able to mess up your sandbox course (it won't have elevated privileges). 

#### 2. Add the Canvas partial simulator to your package.json

Add the following line to your `package.json` file:

```json
{
  "scripts": {
    "dev:canvas": "node ./node_modules/caccl/canvas/startPartialSimulation"
  }
}
```
#### 3. Configure your app properly

When running in the development environment, you app needs to:

_a. Use SSL on port 443_

> If you're letting CACCL set up your express app, this should already be done: the port will default to `443` (unless you're overriding it) and CACCL will automatically add self-signed certificates. Make sure to accept those self-signed certificates in your browser!
>
> If setting up your express app on your own, make sure you're listening on port `443` and make sure you're using https with SSL certificates.

_b. Set `canvasHost` to `localhost:8088`_

> When initializing CACCL, set the hostname to `localhost:8088` if in the development environment. This is the hostname of the Canvas partial simulator.

## Testing Your App

Follow the instructions above first.

### 1. Start your app  

App must be on `443` with SSL and `canvasHost` must be `localhost:8088` (see step 3 above).

### 2. Star the Canvas partial simulator

From the root directory of your project, run:

```bash
npm run dev:canvas
```

### 3. Simulate an LTI launch

Follow instructions in the Canvas partial simulator terminal window.
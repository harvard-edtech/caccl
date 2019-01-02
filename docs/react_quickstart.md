# Quickstart: React with Express Backend

It just takes a few steps to get your React app connected with Canvas using CACCL.

## Step 1: Create a project

> Prerequisites:  
> • npm (see [this page](https://www.npmjs.com/get-npm) for help)  
> • git (see [this page](https://gist.github.com/derhuerst/1b15ff4652a867391f03) for help)  

After creating a new repo for your project, clone it to your machine:

```bash
git clone https://githost.com/username/my-project
```

Enter your project:

```bash
cd my-project
```

Initialize the npm project and follow instructions:

```bash
npm init
```

## Step 2: Create the React client folder

Create a new react app:

```bash
# From the root directory of your project:
npx create-react-app client
```

## Step 3: Install CACCL

Add CACCL to both the server and client:

```bash
# From the root directory of your project:
npm i --save caccl
cd client
npm i --save caccl
```
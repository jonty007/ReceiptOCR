# Server Starter Node.js App

This app uses postgres database with sequelize.

## Downloading and running this app.

Prerequisites:
1. Node 12
2. Postgres

Installing:
1. Clone this repository.
2. Checkout to branch `sequelize-server`.
3. Run `npm install` in your terminal to install dependencies.
4. Check for the DB configs in `config/environment/...` check for particular environment file inside that folder.
   Options to change for database: username, password, name(DB name), host, port, schema, migrationStorageTableSchema(same as schema).
6. Start the server with `npm run server` for first time, it will sync up DB with new changes of migrations.
7. For consecutive starts, use `npm run start`. Use step 6 if there are DB changes to be synced.
7. Server starts on http://localhost:4001. 

## Documentation on Maintaining the Repo

### New Controller

**Define project specific controllers under ``/src/v1/modules``**

New controllers should access Express Router as.

``location.controller.js`` 
```javascript
import { Router } from 'express';


const location = Router();


export default location;
```

### Translation Usage Guide

As of now we are supporting two types of translation, which are:

#### 1. Static text translation

When sending a response, you need to add message key in the object like

```javascript
res.status(200).send({
  message: 'USER_NOT_FOUND'
})
```
in translation file
```json
{
  "USER_NOT_FOUND": "User does not exist!"
}
```

#### 2. Dynamic text string

If in response you want to send a dynamic text message, like number of tries, or username, email etc. This can be done like:

```javascript
res.status(200).send({
  message: { code: 'PASSWORD_FAIL_TRY %s', replace: '1'}
})
```
in translation file
```json
{
  "PASSWORD_FAIL_TRY %s": "Wrong Password. You have %s tries left!"
}
```

> **Right now we support only one string replacement.**

#### 3. Hosting static content for web

When the build/dist folder is ready, one can configure the static content by changing the development env variables as:

``{env}.js``
```json
{
  "client": true,
  "clientBundle": {
    "path": "../../react-native-poc/web/build",
    "fileName": "index.html"
  }
}
```

> **path** : this points to the build path

> **fileName** : entry file name

> defaults to /client context

To change the context change entry points in

1. ``app.middlewares.js -> modRewriteLib``
2. ``app.routes.js ->``
```javascript
app.get('/client/*', function(req, res) {
  res.sendFile(path.join(__dirname, clientBundle.path, clientBundle.fileName));
});
``` 
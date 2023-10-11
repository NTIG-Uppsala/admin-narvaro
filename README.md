# Admin närvaro
In this project a system for registering attendance for administrators at NTI gymnasiet Uppsala. This system is intended to be used by the school's admin department.

## [Codingstandard](https://docs.google.com/document/d/131W1bUSoyt6cgcMWJ0351T7rCdNp8Y3KoZeaQxhfvpE/)

## [Development environment](https://docs.google.com/document/d/1a-pp_Vd-XVFjH9qxnXjHDsL0S8OLv-I7n9eCeU7P8Pw/)

## Project dependencies
This project uses the following dependencies: \
Node v16.17.1 \
Python 3.10.6 

### env file
The environment file is used to store sensetive data that is included in the project. The file is located in the root folder of the project and should be namned `.env` \
Required variables:
```
MONGODB_URI="XXX"
MONGODB_URI_DEV='XXX'
HOST_URL="XXX"
JWT_SECRET='XXX'
```
> `MONGODB_URI` is the connection string to the production database.

> `MONGODB_URI_DEV` is the connection string to the development database.

> `HOST_URL` is the url of the server which will be used by the server to make requests to itself (eg. https://narvaro.ntig.net/) If this is not set, the backend will throw an error at runtime.

> `JWT_SECRET` the secret used to sign the JWT tokens. Needs to be long to be safe.


## Run tests
All tests are located in the `test` folder and are named `test_*.py`. To install necessary dependencies run `pip install -r requirements.txt` in the root folder of the project. To run a test run `python test/<filename> <url to be tested>`. The project also has jest tests located in `__tests_/` and can be runned with `npm run test`.

## Running the project
To run the project the dependencies needs to be installed. To install the dependencies run `npm install` in the root folder of the project.

To run the project in development mode run `npm run dev` in the root folder of the project. The project will then be available at `localhost:8000`. If the project is ran in development mode, the backend will use the development database.

To run the project in production mode run `npm run build` followed by `npm run start` in the root folder of the project. The project will then be available at `localhost:8000`. If the project is ran in production mode, the backend will use the production database.

## Run project with docker
To run the project with docker. The Docker engine needs to be installed and the dependencies that comes with docker.

### Build docker image
`docker build . -t <Your name>/admin-narvaro`

### Run docker image
`docker run -p 8080:8080 <Your name>/admin-narvaro`

After the docker image has been built and run, the project can be accessed at `localhost:8080` in the browser.

# API routes and frontend pages

All pages are located in `pages/<route>.js` and all scripts starting with `_` are not seen as a page that can be visited by the client. `pages/api/<route>.js` is used as a built in REST api which can be called from the client and other api routes.

# Frontend routes
The index page is the main page where the status of a person can be seen. The persons role can also be seen and when they last changed their status.

## /setstatus?auth={authcode}
The setstatus page is where the status of a person can be set. To visit the setstatus page you need to have a valid uri and providing in the url. All people have a unique uri. The people are also given a group and a privilege. The privilege specifies if the person can only change their own status, all statuses in their group or statuses of all the people.

## /dashboard (aka the admin panel)
This page is where the admin can configure all people. On the admin panel page every persons name, role, group privilege, uri and physical device can be seen and changes. The dashboard is password protected to prevent unauthorized access. To login to the dashboard the user is prompted with a login screen. The password is then submitted to the backend (`/api/auth/login`) and checked if it matches the password in the database.

# API (/api/)
## /auth/login (POST)
The login route will take in a username and a password as the request body. The username and password will then be checked against the database. If the username and password matches the database, a short-lived JWT token will be generated to be used to call `/auth/token`. The tokens returned from the token api will be returned to the client and set into the client local storage.

Example request:
```
POST https://narvaro.ntig.net/api/auth/login
Content-Type: application/json

{
    "username": "XXXXX",
    "password": "XXXXX"
}
```
## /auth/authorize (POST)
The authorize route will take in a authorization header with a JWT token. The token will be verified using `${JWT_SECRET}`. If the token is valid, returns true else returns a 401 status code.

## /auth/verifyurl (POST)
The verifyurl route is used for `/setstatus?auth={code}`. The route will take in a `uri` body parameter. The uri will be checked against the database. If the uri is valid, returns the list of users the uri can change the status of, and a JWT token with an expiration time of 60 seconds. 

## /auth/token
> NOTE: This route needs to have a valid JWT token in the authorization header.

The token route is used to generate JWT tokens. The route takes in a payload as the body which will be compiled into the tokens. The route will return a JWT access token which has a expiration time of 1 hour and a long lived refresh token.

## /get/:slug
> Note: CORS is enabled for all requests to `/get/:slug` for the possibility to use the API 
in other projects

> Note 2: if /get/user[s] is called a jwt token can be sent in the authorization header to get the all the information regarding the user

The /get/:slug route is used to get a user, users, groups or privileges. The route takes in a slug as a parameter. The slug can be one of the following: `user`, `users`, `groups`, `privileges`. The route will then return the requested data after making a query to the database.

if a specific user is requested, the body needs to contain the id of the user.

Example request:
```
GET https://narvaro.ntig.net/api/get/users
```
or for a specific user

```
GET https://narvaro.ntig.net/api/get/user
Content-Type: application/json

{
    "id": "[USER ID]"
}

```

## /setstatus
The setstatus route is used to set the status of a user. The route takes in a JWT token in the authorization header. The route will then check if the token is valid and if the user is allowed to change the status of the user. If the user is allowed to change the status, the status will be updated in the database. 

## /deleteuser
The deleteuser route is used to delete a user. The route takes in a JWT token in the authorization header. The route will then check if the token is valid and if the user is allowed to delete the user. If the user is allowed to delete the user, the user will be deleted in the database.
## /updateuser
The update user route is used to update a user. The route takes in a JWT token in the authorization header. The route will then check if the token is valid and if the user is allowed to update the user. If the user is allowed to update the user, the user will be updated in the database, if the user does not exist in the database a new user will be created.


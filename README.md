# Admin närvaro
In this project a system for registering attendance for administrators at NTI gymnasiet Uppsala. This system is intended to be used by the school's admin department.


## [Definition of Done](https://docs.google.com/document/d/1nFov6OfS3KaviBkWdDGdLUGio0Qt3hujJUGrA251HUg) 
- All code needs to be auditied by all members present
- All code needs to be added to the presentation document
- All members present needs to understand what is being done
- Code needs to follow coding standards
- Code needs to be commented
- Code needs to be validated


## [Codingstandard](https://docs.google.com/document/d/131W1bUSoyt6cgcMWJ0351T7rCdNp8Y3KoZeaQxhfvpE/)

## [Development enviroment](https://docs.google.com/document/d/1a-pp_Vd-XVFjH9qxnXjHDsL0S8OLv-I7n9eCeU7P8Pw/)

## Project dependencies
This project uses the following dependencies: \
Node v16.17.1 \
Python 3.10.6 

## Run tests
All tests are located in the `test` folder and are named `test_*.py`. To install necessary dependencies run `pip install -r requirements.txt` in the root folder of the project. To run a test run `python test/<filename> <url to be tested>`

## Run project
To run the project, installation of the dependencies is required. To install the dependencies run `npm install` in the root folder of the project. To run the project run `node server.js` in the root folder of the project. The project will then be available at `localhost:8000` in the browser as a development version. If you want to run the project as production, run `npm run build` and `npm run start` in the root directory of the project.

## Run project with docker
To run the project with docker. The Docker engine needs to be installed and the dependencies that comes with docker.

### Build docker image
`docker build . -t <Your name>/admin-narvaro`

### Run docker image
`docker run -p 8080:8080 <Your name>/admin-narvaro`

After the docker image has been built and run, the project can be accessed at `localhost:8080` in the browser.


### Frontend
The frontend is made using the javascript framework NextJs. NextJs is a framework based on ReactJs and is a SSR (Server Side Rendering) based framework.

The website conists of the three pages:
#### / (the index page)
> The index page is the main page where the status of a person can be seen. The persons role can also be seen and when they last their status
#### /setstatus?auth={authcode}
> The setstatus page is where the status of a person can be set. To visit the setstatus page you need to have a valid uri and providing in the url. All people have a unique uri. The person are also given a group and a privilege. The privilege specifies if the person can only change their own status, all statuses in their group or all statuses.

#### verysecretadminpanelabc123 (aka the admin panel)
> This page is where the admin can configure all people. On the admin panel page every persons name, role, group and privilege can be seen and changes. 

All pages are loacetd in `pages/<page>.js` and all scripts starting with `_` are not seen as a page that can be visited by NextJs.


### Backend
The server also consists of a backend running with Express.js. The backend handles all requests made to the website.
# Admin närvaro

In this project a system for registering attendance for administrators at NTI Gymnasiet Uppsala. This system is intended to be used by the school's admin department.

## Project dependencies

This project uses the following dependencies: \
Node v16.17.1 \
Python 3.10.6

## Coding Standard

### Javascript files

All files in javascript is has variable names in English and camelcase. All comments are in English. Indents are 4 spaces long.

### Python files

All python files has same javascript files except variable names in snakecase. All python files are formatted with [Black Formatter](https://marketplace.visualstudio.com/items?itemName=ms-python.black-formatter).

## env file

The environment file is used to store sensetive data that is included in the project. The file is located in the root folder of the project and should be namned `.env` \
Required variables:

```
MONGODB_URI=""
MONGODB_URI_DEV=""
HOST_URL=""
JWT_SECRET=""
```

> `MONGODB_URI` is the connection string to the production database.

> `MONGODB_URI_DEV` is the connection string to the development database.

> `HOST_URL` is the url of the server which will be used by the server to make requests to itself (e.g. https://narvaro.ntig.net/). If this is not set, the backend will throw an error at runtime.

> `JWT_SECRET` the secret used to sign the JWT tokens. Needs to be long to be safe.

Note:
Connection strings needs the database name at the end.
Example: This_is_the_connection_string/database_name.

## Dev database

In order for GitHub Actions tests to work, any IP adresses used by GitHub must be [whitelisted on the dev database](https://www.mongodb.com/docs/atlas/security/ip-access-list/#add-ip-access-list-entries).

## Run tests

All tests are located in the `test` folder and are named `test_*.py`. To install necessary dependencies run `pip install -r requirements.txt` in the root folder of the project. To run a test run `python test/<filename> <url to be tested>`. The project also has jest tests located in `__tests_/` and can be runned with `npm run test`.

## Running the project

To run the project the dependencies needs to be installed. To install the dependencies run `npm install` in the root folder of the project.

To run the project in development mode run `npm run dev` in the root folder of the project. The project will then be available at `localhost:8000`. If the project is ran in development mode, the backend will use the development database.

To run the project in production mode run `npm run build` followed by `npm run start` in the root folder of the project. The project will then be available at `localhost:8000`. If the project is ran in production mode, the backend will use the production database.

## Run project with Docker

To run the project with Docker, Docker Engine must to be installed.

### Build Docker image

`docker build . -t <Your name>/admin-narvaro`

### Run Docker image

`docker run -p 8080:8080 <Your name>/admin-narvaro`

After the Docker image has been built and run, the project can be accessed at `localhost:8080` in the browser.

## API routes and frontend pages

[Api and frontend pages documentation](https://github.com/NTIG-Uppsala/admin-narvaro/blob/main/Documention/API%26Frontend.md)

## Raspberry Pi Pico W (Physical box)

[Physical box documentation](https://github.com/NTIG-Uppsala/admin-narvaro/blob/main/Documention/PhysicalBox.md)

## Raspberry Pi (Display)

[Display documentation](https://github.com/NTIG-Uppsala/admin-narvaro/blob/main/Documention/RaspberryPi.md)

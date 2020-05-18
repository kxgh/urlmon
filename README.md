# urlmon

Restful microservice which allows to monitor particular URLs.
The service allows basic CRUD operations, background URL monitoring and listing results for a user.

## Setup

Clone or download this repository, then in the target folder:

    npm install
    
Then just create a `.env` file with your configuration. See [Configuration](#Configuration)

## Demo run

    npm run start:dev

## Tests run

Running tests will force to resync, **recreate** all used tables and fill them with test data.
Use on empty or test db.

    npm run test
    
## Production build and run

Application uses `@babel/node` to run which is not suitable for production run as it needs to be compiled on the fly.
First build it:

    npm run build
    
And then start the production build:

    npm run start
    
# Configuration

:warning: It is necessary to provide a `.env` file with these required params:
* `DB_DATABASE` a database urlmon will connect to
* `DB_USER` existing user in the database with privileges for tables CRUD
* `DB_PASSWORD` existing user's password

These `.env` params use default values if no param provided: 
* `DB_HOST` database url. Defaults to `localhost`
* `DB_PORT` database port. Defaults to `3306`
* `HOST` service url. Defaults to `localhost`
* `PORT` service port. Defaults to `3000`
* `DB_DIALECT` database dialect to be passed for Sequelize ORM. Defaults to `mysql`
* `DB_TIMEZONE` database dialect. Defaults to `+00:00`
* `PROTOCOL` app protocol. Either http or https. Defaults to `http`
* `SILENT` disables sequelize's logging if set to 1
* `FAKE_PAYLOAD` whether urlmon should fetch actual URL payload or use made up data. Useful for testing purposes.
Use `1` to use fake payload, otherwise leave empty or set to `0`

## Docker run

In directory with Dockerfile enter:

    docker build -t urlmon .

We'll use that image (with mysql to be pulled) in docker compose file. Create a sample `.env`:

```
HOST=0.0.0.0
PORT=3000

FAKE_PAYLOAD=1
SILENT=1

DB_HOST=db
DB_PORT=3306
DB_DIALECT=mysql
DB_TIMEZONE=+02:00
DB_DATABASE=urlmon
DB_USER=urlmonuser
DB_PASSWORD=password
PROTOCOL=http
```

Note that you can set `DB_HOST` to different address in non-container environment (e.g. `localhost`) 
although compose file assumes the name `db`. Run:

    docker-compose up
    
urlmon will keep restarting until mysql db is ready and will be ready with 2 sample users Aladin and Bart. Compose file uses some pre-defined values
for db settings, change them according to your needs.


### Database

urlmon will create 3 tables upon start:
* `Users` table of users authorized to use urlmon. Contains users 'Aladin' and 'Bart' by default (see `dummyvals.json`)
* `MonitoredEndpoints` table of active monitored endpoints (URLs)
* `MonitoringResults` table of results

# REST API

The REST API to urlmon is described below. Note that all API requests should have user's authentication access token
in `Authorized` header. urlmon will let you know if an entity exists by responding
with a 401 code if unauthorized and 404 if no such target exists.   
 

## Get list of user's endpoints

`GET /:user/endpoints/`

Response:
```
{
    "endpoints": [
        {
            "id": 2,
            "name": "endpoint_bern",
            "url": "http://192.168.0.107/",
            "createDate": "2020-05-13T02:27:47.000Z",
            "lastCheckDate": "2020-05-13T08:44:32.000Z",
            "monitoredInterval": 54000,
            "userId": 1
        },
        {
            "id": 12,
            "name": "endpoint_jihlava",
            "url": "http://www.someexample.com/",
            "createDate": "2020-05-13T02:37:22.000Z",
            "lastCheckDate": "2020-05-13T08:54:42.000Z",
            "monitoredInterval": 54000,
            "userId": 1
        }
    ]
}
```
With `Content-Type` `application/json` and status code `200`.

## Get specific monitored endpoint info

`GET /:user/endpoints/:endpointId`

Response:
```
{
    "endpoint": {
        "id": 2,
        "name": "endpoint_bern",
        "url": "http://192.168.0.107/",
        "createDate": "2020-05-15T02:27:47.000Z",
        "lastCheckDate": "2020-05-15T08:50:49.000Z",
        "monitoredInterval": 54000,
        "userId": 1
    }
}
```
With `Content-Type` `application/json` and status code `200`. 

## Get specific monitored endpoint results

Use `?limit=n` query to get last `n` results. Defaults to `10` if no limit specified. 

`GET /:user/endpoints/:endpointId/results?limit=n`

Response:
```
{
    "results": [
        {
            "id": 1698,
            "checkDate": "2020-05-13T08:54:25.000Z",
            "statusCode": 7,
            "payload": "((this is some payload))",
            "endpointId": 2
        },
        {
            "id": 1643,
            "checkDate": "2020-05-13T08:53:31.000Z",
            "statusCode": 48,
            "payload": "((this is some payload))",
            "endpointId": 2
        },
        {
            "id": 1105,
            "checkDate": "2020-05-13T08:44:32.000Z",
            "statusCode": 69,
            "payload": "((this is some payload))",
            "endpointId": 2
        }
    ]
}
```
With `Content-Type` `application/json` and status code `200`. 

## Create endpoint monitoring

Send a JSON encoded endpoint in this [format](#endpoint-format) using 
`POST /:user/endpoints`

Response: created monitoring endpoint (see above).
With `Content-Type` `application/json` and status code `201`.

## Update endpoint monitoring

To update an endpoint send a JSON encoded new endpoint props using  
`PUT /:user/endpoints/:endpointId`
or `PATCH /:user/endpoints/:endpointId` 

Response: updated monitoring endpoint.

With `Content-Type` `application/json` and status code `200`.

Note: specified `id` and `userId` will **not** be set.

## Delete endpoint monitoring

To delete an endpoint use  
`DELETE /:user/endpoints/:endpointId` 

Deleting an endpoint will also delete all of its results. If you wish to pause monitoring,
update the monitoring interval to `0`.

Response: deleted monitoring endpoint id.
```
{
    "deletedId": 67
}
```
With `Content-Type` `application/json` and status code `200`.


## Endpoint format

Invalid creations/updates result in `400` error.

* `id` endpoint's unique id. Maintained internally.
* `name` endpoint's name
* `url` must be valid url
* `createDate` endpoint's creation date. Set automatically
* `lastCheckDate` endpoint's last result insertion date. Updated automatically in background monitor
* `monitoredInterval` time in **milliseconds** at which the endpoint will be periodically monitored. Set this to `0` to
temporarily pause monitoring.
* `userId` endpoint's owner id. Maintained internally.

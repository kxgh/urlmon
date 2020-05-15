require('dotenv').config();
export const ERR_UNAUTHD = 'Unauthorized';
export const ERR_NOT_FOUND = 'Not found';
export const ERR_UNAUTHD_NOT_FOUND = 'Unauthorized or not found';
export const ERR_INTERNAL = 'Internal error';
export const ERR_BAD_REQUEST = 'Bad request';

export const EV_ENDPOINT_CREATED = 'New monitored endpoint created';
export const EV_ENDPOINT_DELETED = 'Monitored endpoint deleted';
export const EV_ENDPOINT_MODIFIED = 'Monitored endpoint modified';

export const isTesting = () => process.argv.includes('--test');

export const DB_HOST = process.env.DB_HOST || 'localhost';
export const DB_PORT = process.env.DB_PORT || 3306;
export const DB_DIALECT = process.env.DB_DIALECT || 'mysql';
export const DB_TIMEZONE = process.env.DB_TIMEZONE || '+00:00';
export const DB_DATABASE = process.env.DB_DATABASE;
export const DB_USER = process.env.DB_USER;
export const DB_PASSWORD = process.env.DB_PASSWORD;

export const HOST = process.env.HOST || 'localhost';
export const PORT = process.env.PORT || 3000;

export const PROTOCOL = process.env.PROTOCOL || 'http';

export const FAKE_PAYLOAD = (!!process.env.FAKE_PAYLOAD && process.env.FAKE_PAYLOAD !== '0');

export const getErrStatusCode = msg => {
    switch (msg) {
        case ERR_UNAUTHD:
            return 401;
        case ERR_INTERNAL:
            return 500;
        case ERR_UNAUTHD_NOT_FOUND:
            return 403;
        case ERR_NOT_FOUND:
            return 404;
        default: {
            if (/validation\s*error/i.test(msg))
                return 400;
            if (/out\sof\srange/i.test(msg))
                return 400;
            return 500;
        }
    }
};
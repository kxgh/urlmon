"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getErrStatusCode = exports.SILENT = exports.FAKE_PAYLOAD = exports.PROTOCOL = exports.PORT = exports.HOST = exports.DB_PASSWORD = exports.DB_USER = exports.DB_DATABASE = exports.DB_TIMEZONE = exports.DB_DIALECT = exports.DB_PORT = exports.DB_HOST = exports.isMonitorJob = exports.isTesting = exports.MON_SUBP_ARG = exports.EV_ENDPOINT_MODIFIED = exports.EV_ENDPOINT_DELETED = exports.EV_ENDPOINT_CREATED = exports.NO_RESP_STATUS = exports.ERR_BAD_REQUEST = exports.ERR_INTERNAL = exports.ERR_UNAUTHD_NOT_FOUND = exports.ERR_NOT_FOUND = exports.ERR_UNAUTHD = void 0;

require('dotenv').config();

const ERR_UNAUTHD = 'Unauthorized';
exports.ERR_UNAUTHD = ERR_UNAUTHD;
const ERR_NOT_FOUND = 'Not found';
exports.ERR_NOT_FOUND = ERR_NOT_FOUND;
const ERR_UNAUTHD_NOT_FOUND = 'Unauthorized or not found';
exports.ERR_UNAUTHD_NOT_FOUND = ERR_UNAUTHD_NOT_FOUND;
const ERR_INTERNAL = 'Internal error';
exports.ERR_INTERNAL = ERR_INTERNAL;
const ERR_BAD_REQUEST = 'Bad request';
exports.ERR_BAD_REQUEST = ERR_BAD_REQUEST;
const NO_RESP_STATUS = 0;
exports.NO_RESP_STATUS = NO_RESP_STATUS;
const EV_ENDPOINT_CREATED = 'New monitored endpoint created';
exports.EV_ENDPOINT_CREATED = EV_ENDPOINT_CREATED;
const EV_ENDPOINT_DELETED = 'Monitored endpoint deleted';
exports.EV_ENDPOINT_DELETED = EV_ENDPOINT_DELETED;
const EV_ENDPOINT_MODIFIED = 'Monitored endpoint modified';
exports.EV_ENDPOINT_MODIFIED = EV_ENDPOINT_MODIFIED;
const MON_SUBP_ARG = '--mon-job';
exports.MON_SUBP_ARG = MON_SUBP_ARG;

const isTesting = () => process.argv.includes('--test');

exports.isTesting = isTesting;

const isMonitorJob = () => process.argv.includes(MON_SUBP_ARG);

exports.isMonitorJob = isMonitorJob;
const DB_HOST = process.env.DB_HOST || 'localhost';
exports.DB_HOST = DB_HOST;
const DB_PORT = process.env.DB_PORT || 3306;
exports.DB_PORT = DB_PORT;
const DB_DIALECT = process.env.DB_DIALECT || 'mysql';
exports.DB_DIALECT = DB_DIALECT;
const DB_TIMEZONE = process.env.DB_TIMEZONE || '+00:00';
exports.DB_TIMEZONE = DB_TIMEZONE;
const DB_DATABASE = process.env.DB_DATABASE;
exports.DB_DATABASE = DB_DATABASE;
const DB_USER = process.env.DB_USER;
exports.DB_USER = DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
exports.DB_PASSWORD = DB_PASSWORD;
const HOST = process.env.HOST || 'localhost';
exports.HOST = HOST;
const PORT = process.env.PORT || 3000;
exports.PORT = PORT;
const PROTOCOL = process.env.PROTOCOL || 'http';
exports.PROTOCOL = PROTOCOL;
const FAKE_PAYLOAD = !!process.env.FAKE_PAYLOAD && process.env.FAKE_PAYLOAD !== '0';
exports.FAKE_PAYLOAD = FAKE_PAYLOAD;
const SILENT = !!process.env.SILENT && process.env.SILENT !== '0';
exports.SILENT = SILENT;

const getErrStatusCode = msg => {
  switch (msg) {
    case ERR_UNAUTHD:
      return 401;

    case ERR_INTERNAL:
      return 500;

    case ERR_UNAUTHD_NOT_FOUND:
      return 403;

    case ERR_NOT_FOUND:
      return 404;

    default:
      {
        if (/validation\s*error/i.test(msg)) return 400;
        if (/out\sof\srange/i.test(msg)) return 400;
        return 500;
      }
  }
};

exports.getErrStatusCode = getErrStatusCode;
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _dao = _interopRequireDefault(require("./dao"));

var _events = require("events");

var _constants = require("./constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const AUTHD_USER_ID = 'authUserId';

const prs = arg => parseInt(arg) || -1;

class Controller extends _events.EventEmitter {
  /**
   * @param {Dao} dao
   */
  constructor(dao) {
    super();
    this.dao = dao;

    this.auth = async (req, res, next) => {
      const userName = req.params.userName;

      try {
        req[AUTHD_USER_ID] = (await this.dao.nameTokenAuth(userName, req.header('authorization'))).id;
        next();
      } catch ({
        message
      }) {
        console.warn(message);
        res.send((0, _constants.getErrStatusCode)(message), `User '${userName}' ${message}`);
      }
    };

    this.getUserEndpoints = async (req, res, next) => {
      try {
        const endpoints = await this.dao.getUserEndpoints(req[AUTHD_USER_ID]);
        res.send(200, {
          endpoints
        });
      } catch ({
        message
      }) {
        console.warn(message);
        res.send((0, _constants.getErrStatusCode)(message), message);
      }
    };

    this.createEndpoint = async (req, res, next) => {
      try {
        const created = await this.dao.createEndpoint(req[AUTHD_USER_ID], req.body);
        this.emit(_constants.EV_ENDPOINT_CREATED, created);
        res.send(201, {
          created
        });
      } catch ({
        message
      }) {
        console.log(message);
        res.send((0, _constants.getErrStatusCode)(message), message);
      }
    };

    this.updateEndpoint = async (req, res, next) => {
      try {
        const updated = await this.dao.updateEndpoint(req[AUTHD_USER_ID], prs(req.params.endpointId), req.body);
        this.emit(_constants.EV_ENDPOINT_MODIFIED, updated);
        res.send(200, {
          updated
        });
      } catch ({
        message
      }) {
        console.warn(message);
        res.send((0, _constants.getErrStatusCode)(message), message);
      }
    };

    this.deleteEndpoint = async (req, res, next) => {
      try {
        const deletedId = await this.dao.deleteEndpoint(req[AUTHD_USER_ID], prs(req.params.endpointId));
        this.emit(_constants.EV_ENDPOINT_DELETED, deletedId);
        res.send(200, {
          deletedId
        });
      } catch ({
        message
      }) {
        console.warn(message);
        res.send((0, _constants.getErrStatusCode)(message), message);
      }
    };

    this.getEndpoint = async (req, res, next) => {
      try {
        const endpoint = await this.dao.getEndpoint(req[AUTHD_USER_ID], prs(req.params.endpointId));
        res.send(200, {
          endpoint
        });
      } catch ({
        message
      }) {
        console.warn(message);
        res.send((0, _constants.getErrStatusCode)(message), message);
      }
    };

    this.listMonitoringResults = async (req, res, next) => {
      try {
        const limit = parseInt(req.query && req.query.limit) || 10;
        const results = await this.dao.listMonitoringResults(req[AUTHD_USER_ID], parseInt(req.params.endpointId), limit);
        res.send(200, {
          results: results
        });
      } catch ({
        message
      }) {
        console.warn(message);
        res.send((0, _constants.getErrStatusCode)(message), message);
      }
    };

    this.fallback = async (req, res) => {
      res.status(501);
      res.end();
    };
  }

  getUsedDatabaseAccessObject() {
    return this.dao;
  }

}

exports.default = Controller;
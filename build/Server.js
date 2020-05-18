"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var restify = _interopRequireWildcard(require("restify"));

var _Controller = _interopRequireDefault(require("./Controller"));

var _constants = require("./constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

class Server {
  /**
   * @param {Controller} controller with middleware funcs
   */
  constructor(controller) {
    this.server = restify.createServer({
      name: 'urlmon'
    });
    this.server.use(restify.plugins.jsonBodyParser({}));
    this.server.use(restify.plugins.queryParser());
    this.middleware = controller;
  }
  /***
   * @param {Object} opts
   * @param {number} [opts.port] server port to be used
   * @param {string} [opts.host] server url
   */


  startServer({
    port = _constants.PORT,
    host = _constants.HOST
  } = {}) {
    const mid = this.middleware;
    this.server.get('/:userName/endpoints/', mid.auth, mid.getUserEndpoints);
    this.server.get('/:userName/endpoints', mid.auth, mid.getUserEndpoints);
    this.server.get('/:userName/endpoints/:endpointId', mid.auth, mid.getEndpoint);
    this.server.get('/:userName/endpoints/:endpointId/', mid.auth, mid.getEndpoint);
    this.server.get('/:userName/endpoints/:endpointId/results', mid.auth, mid.listMonitoringResults);
    this.server.get('/:userName/endpoints/:endpointId/results/', mid.auth, mid.listMonitoringResults);
    this.server.post('/:userName/endpoints', mid.auth, mid.createEndpoint);
    this.server.post('/:userName/endpoints/', mid.auth, mid.createEndpoint);
    this.server.put('/:userName/endpoints/:endpointId', mid.auth, mid.updateEndpoint);
    this.server.put('/:userName/endpoints/:endpointId/', mid.auth, mid.updateEndpoint);
    this.server.patch('/:userName/endpoints/:endpointId', mid.auth, mid.updateEndpoint);
    this.server.patch('/:userName/endpoints/:endpointId/', mid.auth, mid.updateEndpoint);
    this.server.del('/:userName/endpoints/:endpointId', mid.auth, mid.deleteEndpoint);
    this.server.del('/:userName/endpoints/:endpointId/', mid.auth, mid.deleteEndpoint);
    this.server.listen(port, host, () => {
      console.log('[%s] ### listening at %s', this.server.name, this.server.url);
    });
  }

}

var _default = Server;
exports.default = _default;
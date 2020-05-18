"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Server = _interopRequireDefault(require("./Server"));

var _Controller = _interopRequireDefault(require("./Controller"));

var _Monitor = _interopRequireDefault(require("./Monitor"));

var _DbDao = _interopRequireDefault(require("./dao/DbDao"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let begun = false;
let monitor;

const begin = async () => {
  if (!begun) {
    begun = true;
    await _DbDao.default.syncAndStart();
    const restMiddleware = new _Controller.default(_DbDao.default);
    new _Server.default(restMiddleware).startServer();
    monitor = new _Monitor.default(restMiddleware);
    await monitor.startMonitor();
  }

  return {
    dao: _DbDao.default,
    monitor
  };
};

var _default = {
  begin
};
exports.default = _default;
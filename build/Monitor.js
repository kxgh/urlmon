"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Controller = _interopRequireDefault(require("./Controller"));

var _constants = require("./constants");

var _MonitoredEndpoint = _interopRequireDefault(require("./model/MonitoredEndpoint"));

var _child_process = require("child_process");

var _path = require("path");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Monitor {
  /**
   * @param {Controller} middleware
   */
  constructor(middleware) {
    this.middleware = middleware;

    this._checkMap = (() => {
      /**
       * @type {Map<number, Timeout>}
       * @private
       */
      const m = new Map();
      return {
        hasCheck: key => !!m.get(parseInt(key)),
        getCheck: key => m.get(parseInt(key)),
        setAndClearCheck: (key, check) => {
          key = parseInt(key);
          const c = m.get(key);
          c && clearInterval(c);
          m.set(key, check);
        },
        clearAndDeleteCheck: key => {
          key = parseInt(key);
          const c = m.get(key);
          c && clearInterval(c);
          m.delete(key);
        }
      };
    })();
  }
  /**
   * @param {MonitoredEndpoint} endpoint
   */


  _setupCheck(endpoint) {
    const performCheck = () => {
      this.job.send(endpoint);
    };

    if (endpoint.monitoredInterval > 0) return setInterval(performCheck, endpoint.monitoredInterval);
  }

  async startMonitor() {
    const modifCallback = modifiedEndpoint => {
      const check = this._checkMap.getCheck(modifiedEndpoint.id);

      const newInterval = modifiedEndpoint.monitoredInterval;

      if (check) {
        if (newInterval !== check._repeat) this._checkMap.setAndClearCheck(modifiedEndpoint.id, this._setupCheck(modifiedEndpoint));
      } else createdCallback(modifiedEndpoint);
    };

    const delCallback = deletedEndpointId => {
      this._checkMap.clearAndDeleteCheck(deletedEndpointId);
    };

    const createdCallback = createdEndpoint => {
      const key = createdEndpoint.id;
      if (createdEndpoint.monitoredInterval > 0) this._checkMap.setAndClearCheck(key, this._setupCheck(createdEndpoint));
    };

    this.middleware.on(_constants.EV_ENDPOINT_MODIFIED, modifCallback);
    this.middleware.on(_constants.EV_ENDPOINT_DELETED, delCallback);
    this.middleware.on(_constants.EV_ENDPOINT_CREATED, createdCallback);
    this.middleware.getUsedDatabaseAccessObject().getAllMonitoredEndpoints(1).then(meList => {
      for (let me of meList) createdCallback(me);
    }).catch(err => {
      throw err;
    });
    if (!this._cleanupListeners) this._cleanupListeners = () => {
      this.middleware.removeListener(_constants.EV_ENDPOINT_MODIFIED, modifCallback);
      this.middleware.removeListener(_constants.EV_ENDPOINT_DELETED, delCallback);
      this.middleware.removeListener(_constants.EV_ENDPOINT_CREATED, createdCallback);
    };
    return new Promise(resolve => {
      if (!this.job) {
        this.job = (0, _child_process.fork)((0, _path.join)(__dirname, 'monitor-job'), [_constants.MON_SUBP_ARG]);
        this.job.on('message', msg => {
          if (msg == 'rdy') {
            console.log('[urlmon] ### child process ready!');
            resolve(true);
          }
        });
      } else resolve(true);
    });
  }

  terminate() {
    for (let check of this._checkMap.values()) clearInterval(check);

    this._cleanupListeners && this._cleanupListeners();
    this.job && this.job.kill();
  }

}

exports.default = Monitor;
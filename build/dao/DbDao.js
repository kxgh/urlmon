"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _constants = require("../constants");

var _ = _interopRequireDefault(require("."));

var _User = _interopRequireDefault(require("../model/User"));

var _MonitoredEndpoint = _interopRequireDefault(require("../model/MonitoredEndpoint"));

var _MonitoringResult = _interopRequireDefault(require("../model/MonitoringResult"));

var _sequelize = require("sequelize");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.log(`[urlmon] ### Connecting to ${_constants.DB_DATABASE} with ${_constants.DB_USER} ${(0, _constants.isMonitorJob)() ? '(monitor process)' : ''}` + `${(0, _constants.isTesting)() ? 'testing.' : ''}`);
let sequelize = null;

try {
  sequelize = new _sequelize.Sequelize(_constants.DB_DATABASE, _constants.DB_USER, _constants.DB_PASSWORD, {
    host: _constants.DB_HOST,
    port: _constants.DB_PORT,
    dialect: _constants.DB_DIALECT,
    timezone: _constants.DB_TIMEZONE,
    logging: !_constants.SILENT
  });
} catch (err) {
  console.error(err);
  process.exit(-1);
}

_User.default.init(_User.default.getAttributes(), {
  sequelize,
  timestamps: false,
  hooks: _User.default.getHooks()
});

_MonitoredEndpoint.default.init(_MonitoredEndpoint.default.getAttributes(_User.default), {
  sequelize,
  timestamps: false,
  hooks: _MonitoredEndpoint.default.getHooks()
});

_MonitoringResult.default.init(_MonitoringResult.default.getAttributes(_MonitoredEndpoint.default), {
  sequelize,
  timestamps: false,
  hooks: _MonitoringResult.default.getHooks()
});

_User.default.hasMany(_MonitoredEndpoint.default, {
  foreignKey: 'userId'
});

_MonitoredEndpoint.default.belongsTo(_User.default, {
  foreignKey: 'userId'
});

_MonitoredEndpoint.default.hasMany(_MonitoringResult.default, {
  foreignKey: 'endpointId',
  onDelete: 'CASCADE',
  hooks: true
});

_MonitoringResult.default.belongsTo(_MonitoredEndpoint.default, {
  foreignKey: 'endpointId',
  onDelete: 'CASCADE',
  hooks: true
});

class DbDao extends _.default {
  constructor(props) {
    super(props);
    this._syncd = false;
  }

  async syncAndStart() {
    if (!(0, _constants.isMonitorJob)()) {
      await sequelize.sync({
        force: (0, _constants.isTesting)()
      });
      const users = await _User.default.findAll();

      if (process.argv.includes('--prod') && (!users || !users.length)) {
        const dvs = require('../../dummyvals');

        _User.default.create(dvs.users[0]);

        _User.default.create(dvs.users[1]);
      }
    }

    return this._syncd = true;
  }

  async nameTokenAuth(userName, accessToken) {
    const user = await _User.default.findOne({
      where: {
        userName
      }
    });
    if (!user) throw new Error(_constants.ERR_NOT_FOUND);else if (user.accessToken !== accessToken) throw new Error(_constants.ERR_UNAUTHD);
    user.id = parseInt(user.id);
    return user;
  }

  async createEndpoint(userId, endpointProps) {
    endpointProps.userId = userId;
    const newMe = new _MonitoredEndpoint.default(endpointProps);
    return await _MonitoredEndpoint.default.create(newMe);
  }

  async deleteEndpoint(authdUserId, endpointId) {
    const delMe = await _MonitoredEndpoint.default.destroy({
      where: {
        id: endpointId,
        userId: authdUserId
      }
    });
    if (!delMe) throw new Error(_constants.ERR_UNAUTHD);
    return endpointId;
  }

  async saveMonitoringResult(monitoringResult) {
    return _MonitoringResult.default.create(monitoringResult);
  }

  async listMonitoringResults(authdUserId, endpointId, limit) {
    const me = await _MonitoredEndpoint.default.findByPk(endpointId);
    if (!me) throw new Error(_constants.ERR_NOT_FOUND);else if (me.userId != authdUserId) throw new Error(_constants.ERR_UNAUTHD);
    const mrs = await me.getMonitoringResults({
      order: [['id', 'DESC']],
      limit: limit
    });
    if (!mrs) return [];
    return mrs;
  }

  async getEndpoint(authdUserId, endpointId) {
    const gotMe = await _MonitoredEndpoint.default.findByPk(endpointId);
    if (!gotMe) throw new Error(_constants.ERR_NOT_FOUND);else if (gotMe.userId != authdUserId) throw new Error(_constants.ERR_UNAUTHD);
    return gotMe;
  }

  async updateEndpoint(authdUserId, endpointId, endpointProps) {
    let me = await _MonitoredEndpoint.default.findByPk(endpointId);
    if (!me) throw new Error(_constants.ERR_NOT_FOUND);

    if (me.dataValues.userId == authdUserId) {
      me = me.dataValues; // avoid sequelize's me.update()

      Object.assign(me, endpointProps, {
        id: endpointId,
        userId: authdUserId
      });
      await _MonitoredEndpoint.default.update(me, {
        where: {
          id: endpointId
        }
      });
      return new _MonitoredEndpoint.default(me);
    } else throw new Error(_constants.ERR_UNAUTHD);
  }

  async getUserEndpoints(userId) {
    const user = await _User.default.findByPk(userId);
    const eps = await user.getMonitoredEndpoints();
    if (!eps) return [];
    return eps;
  }

  async updateLastCheck(endpointId) {
    let updated = await _MonitoredEndpoint.default.update({
      lastCheckDate: new Date()
    }, {
      where: {
        id: endpointId
      },
      validate: false
    });
    if (Array.isArray(updated)) updated = updated[0];
    return updated ? endpointId : null;
  }

  async addUser(user) {
    if (typeof user.save === 'function') return user.save();
    return _User.default.create(new _User.default(user));
  }

  async getAllMonitoredEndpoints(minInterval) {
    return _MonitoredEndpoint.default.findAll({
      where: {
        monitoredInterval: {
          [_sequelize.Op.gte]: minInterval
        }
      }
    });
  }

}

const dbDao = new DbDao();
var _default = dbDao;
exports.default = _default;
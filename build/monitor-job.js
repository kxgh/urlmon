"use strict";

var _constants = require("./constants");

var _MonitoredEndpoint = _interopRequireDefault(require("./model/MonitoredEndpoint"));

var _DbDao = _interopRequireDefault(require("./dao/DbDao"));

var _axios = _interopRequireDefault(require("axios"));

var _MonitoringResult = _interopRequireDefault(require("./model/MonitoringResult"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('dotenv').config();

require("@babel/register")();

const snapshotResponse = async endpoint => {
  if (!_constants.FAKE_PAYLOAD) {
    try {
      const fetched = await _axios.default.get(endpoint.url, {
        headers: {
          //accept:'text/html',
          cacheControl: 'no-store'
        },
        transformResponse: r => r
      });
      return new _MonitoringResult.default({
        statusCode: fetched.status,
        payload: fetched.data,
        endpointId: endpoint.id,
        checkDate: Date.now()
      });
    } catch (err) {
      let statusCode = err.statusCode || _constants.NO_RESP_STATUS;
      let payload = err.code || err.message || '';

      if (err.response) {
        statusCode = err.response.statusCode || statusCode;
        payload = err.response.data || payload;
      }

      return new _MonitoringResult.default({
        statusCode,
        payload,
        endpointId: endpoint.id,
        checkDate: Date.now()
      });
    }
  } else {
    return new _MonitoringResult.default({
      statusCode: Math.floor(Math.random() * 100),
      payload: `==THIS IS FAKE PAYLOAD FOR URL ${endpoint.url} ${Date.now()}==`,
      endpointId: endpoint.id,
      checkDate: Date.now()
    });
  }
};

const onCheck = async endpoint => {
  _DbDao.default.updateLastCheck(endpoint.id).catch(err => {// foreign key constraint err
    // this happens when during the check endpoint gets deleted; nothing to do
  });

  const monitoringResult = await snapshotResponse(endpoint);

  _DbDao.default.saveMonitoringResult(monitoringResult).catch(err => {// foreign key constraint err
    // this happens when during the check endpoint gets deleted; nothing to do
  });
};

process.send('rdy');
process.on('message', msg => {
  onCheck(new _MonitoredEndpoint.default(msg));
});
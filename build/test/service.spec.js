"use strict";

var _app = _interopRequireDefault(require("../app"));

var _constants = require("../constants");

var _chai = require("chai");

var _axios = _interopRequireDefault(require("axios"));

var _MonitoredEndpoint = _interopRequireDefault(require("../model/MonitoredEndpoint"));

var _MonitoringResult = _interopRequireDefault(require("../model/MonitoringResult"));

var _User = _interopRequireDefault(require("../model/User"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('dotenv').config();

require("@babel/register")();

const makeHeaders = user => {
  return {
    headers: {
      Authorization: user.accessToken
    }
  };
};

const baseurl = `${_constants.PROTOCOL}://${_constants.HOST}:${_constants.PORT}`;

const getEndpoints = userName => `${baseurl}/${userName}/endpoints`;

const getResults = (userName, endpointId) => `${baseurl}/${userName}/endpoints/${endpointId}/results`;

describe('REST test', async () => {
  let u1;
  let u2;
  let me1;
  let me2;
  let mr1;
  let mr2;
  before(async () => {
    const {
      dao
    } = await _app.default.begin();

    const dvs = require('../../dummyvals');

    u1 = dvs.users[0];
    u2 = dvs.users[1];
    me1 = dvs.endpoints[0];
    me2 = dvs.endpoints[1];
    mr1 = dvs.results[0];
    mr2 = dvs.results[1]; // all await so they are in order

    await _User.default.create(new _User.default(dvs.users[0]));
    await _User.default.create(new _User.default(dvs.users[1]));
    await _MonitoredEndpoint.default.create(new _MonitoredEndpoint.default(dvs.endpoints[0]));
    await _MonitoredEndpoint.default.create(new _MonitoredEndpoint.default(dvs.endpoints[1]));
    await _MonitoringResult.default.create(new _MonitoringResult.default(dvs.results[0]));
    await _MonitoringResult.default.create(new _MonitoringResult.default(dvs.results[1]));
    return true;
  });
  it('should GET endpoints of both users', async () => {
    let resp1 = _axios.default.get(getEndpoints(u1.userName), makeHeaders(u1));

    let resp2 = _axios.default.get(getEndpoints(u1.userName), makeHeaders(u1));

    resp1 = await resp1;
    resp2 = await resp2;

    _chai.assert.equal(resp1.status, 200, 'BAD RESPONSE STATUS');

    _chai.assert.equal(resp2.status, resp1.status, 'BAD RESPONSE STATUS');

    _chai.assert.property(resp1.data, 'endpoints', 'NO ENDPOINTS PROPERTY');

    _chai.assert.property(resp2.data, 'endpoints', 'NO ENDPOINTS PROPERTY');

    const ru1 = resp1.data.endpoints;
    const ru2 = resp2.data.endpoints;

    _chai.assert.typeOf(ru1, 'array', 'ENDPOINT PROPERTY NOT ARRAY');

    _chai.assert.typeOf(ru2, 'array', 'ENDPOINT PROPERTY NOT ARRAY');

    return true;
  });
  it('should GET results of an endpoint', async () => {
    let resp1 = await _axios.default.get(getResults(u1.userName, me1.id), makeHeaders(u1));

    _chai.assert.equal(resp1.status, 200, 'BAD RESPONSE STATUS');

    _chai.assert.property(resp1.data, 'results', 'NO RESULTS PROPERTY');

    const ru1 = resp1.data.results;

    _chai.assert.typeOf(ru1, 'array', 'ENDPOINT PROPERTY NOT ARRAY');

    return true;
  });
  it('should fail to UPDATE endpoint because of invalid URL', async () => {
    try {
      const resp = await _axios.default.put(getEndpoints(u1.userName) + '/' + me1.id, {
        url: 'some invalid url'
      }, makeHeaders(u1));

      _chai.assert.isNotOk(resp);

      return true;
    } catch (err) {
      _chai.assert.include([400, 401, 403], err.response.status);

      return true;
    }
  });
  it('should ignore endpoint id UPDATE', async () => {
    try {
      const resp = await _axios.default.put(getEndpoints(u1.userName) + '/' + me1.id, {
        id: 99999999
      }, makeHeaders(u1));

      _chai.assert.isOk(resp);

      _chai.assert.property(resp.data, 'updated', 'MISSING PROPERTY UPDATED');

      _chai.assert.typeOf(resp.data.updated, 'object', 'INVALID UPDATED PROPERTY TYPE');

      _chai.assert.equal(resp.data.updated.id, me1.id, 'MANAGED TO CHANGE PROPERTY WITH UPDATE');

      return true;
    } catch (err) {
      console.log(err);

      _chai.assert.fail('SHOULD PASS WITHOUT EXCEPTION');

      return true;
    }
  });
  it('should fail to UPDATE endpoint because the user is not its owner', async () => {
    try {
      const resp = await _axios.default.put(getEndpoints(u2.userName) + '/' + me1.id, {
        url: 'some invalid url'
      }, makeHeaders(u1));

      _chai.assert.isNotOk(resp);

      return true;
    } catch (err) {
      _chai.assert.include([401, 403, 404], err.response.status, 'STATUS NOT ONE OF LISTED');

      return true;
    }
  });
  it('should fail to DELETE endpoint because the user is not its owner', async () => {
    try {
      const resp = await _axios.default.delete(getEndpoints(u2.userName) + '/' + me1.id, makeHeaders(u1));

      _chai.assert.isNotOk(resp);

      return true;
    } catch (err) {
      _chai.assert.include([401, 403, 404], err.response.status, 'STATUS NOT ONE OF LISTED');

      return true;
    }
  });
  it('should fail to UPDATE endpoint because it does not exist', async () => {
    try {
      const resp = await _axios.default.put(getEndpoints(u1.userName) + '/' + 1000000, {
        url: 'some invalid url'
      }, makeHeaders(u1));

      _chai.assert.isNotOk(resp);

      return true;
    } catch (err) {
      _chai.assert.include([401, 403, 404], err.response.status, 'STATUS NOT ONE OF LISTED');

      return true;
    }
  });
  it('should create an endpoint for user2 and return it', async () => {
    try {
      const newMe = {
        name: 'random_endpoint_' + Math.floor(Math.random() * 10e6),
        url: 'http://www.mozilla.org',
        userId: u2.id,
        monitoredInterval: 800000
      };
      const resp = await _axios.default.post(getEndpoints(u2.userName), newMe, makeHeaders(u2));

      _chai.assert.equal(resp.status, 201, 'STATUS NOT MATCHING WITH CREATED');

      _chai.assert.property(resp.data, 'created', 'MISSING CREATED PROPERTY');

      const c = resp.data.created;

      _chai.assert.equal(c.userId, newMe.userId);

      _chai.assert.equal(c.url, newMe.url);

      _chai.assert.equal(c.name, newMe.name);

      _chai.assert.equal(c.monitoredInterval, newMe.monitoredInterval);

      return true;
    } catch (err) {
      console.log(err);

      _chai.assert.fail('SHOULD PASS WITHOUT EXCEPTION');

      return true;
    }
  });
  it('should create an endpoint for user2 and obtain at least one result with the new endpoint it', async () => {
    try {
      const newMe = {
        name: 'another_random_endpoint_' + Math.floor(Math.random() * 10e6),
        url: 'http://www.trhvvvvvvvvvv48dwqdszzz.co.uk',
        userId: u2.id,
        monitoredInterval: 1000
      };
      let resp = await _axios.default.post(getEndpoints(u2.userName), newMe, makeHeaders(u2));

      _chai.assert.isOk(resp, 'INVALID RESPONSE');

      const c = resp.data.created;

      _chai.assert.isOk(c, 'CREATED NOT RETURNED');

      const timeout = new Promise(resolve => {
        setTimeout(async () => {
          resp = await _axios.default.get(getResults(u2.userName, c.id), makeHeaders(u2));

          _chai.assert.equal(resp.status, 200, 'BAD RESPONSE STATUS');

          _chai.assert.property(resp.data, 'results', 'NO RESULTS PROPERTY');

          const ru = resp.data.results;

          _chai.assert.typeOf(ru, 'array', 'ENDPOINT PROPERTY NOT ARRAY');

          const ids = new Set(ru.map(ru => ru.endpointId));

          _chai.assert.isAtLeast(ids.size, 1, 'DID NOT GET AT LEAST ONE RESULT');

          resolve(true);
        }, 8000);
      });

      try {
        await timeout;
      } catch (e) {
        console.log(e);

        _chai.assert.fail('SHOULD PASS WITHOUT EXCEPTION');

        return true;
      }
    } catch (err) {
      console.log(err);

      _chai.assert.fail('SHOULD PASS WITHOUT EXCEPTION');

      return true;
    }
  });
  it('should delete endpoint', async () => {
    try {
      const delurl = getEndpoints(u1.userName) + '/' + me1.id;
      let resp = await _axios.default.delete(delurl, makeHeaders(u1));

      _chai.assert.equal(resp.status, 200, 'DELETE STATUS INVALID');

      _chai.assert.property(resp.data, 'deletedId', 'HAS INVALID DELETED ID PROPERTY');

      const delId = resp.data.deletedId;

      _chai.assert.equal(delId, me1.id);

      return true;
    } catch (err) {
      _chai.assert.fail('SHOULD PASS WITHOUT EXCEPTION');

      return true;
    }
  });
});
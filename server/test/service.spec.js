require('dotenv').config();
require("@babel/register")();

import app from "../app";
import {PROTOCOL, HOST, PORT} from "../constants";


import {assert} from "chai";
import axios from "axios";
import MonitoredEndpoint from "../model/MonitoredEndpoint";
import MonitoringResult from "../model/MonitoringResult";
import User from "../model/User";

const makeHeaders = user => {
    return {
        headers: {
            Authorization: user.accessToken
        }
    }
};
const baseurl = `${PROTOCOL}://${HOST}:${PORT}`;
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
        const {dao} = await app.begin();
        const dvs = require('../../dummyvals');
        u1 = dvs.users[0];
        u2 = dvs.users[1];
        me1 = dvs.endpoints[0];
        me2 = dvs.endpoints[1];
        mr1 = dvs.results[0];
        mr2 = dvs.results[1];

        // all await so they are in order
        await User.create(new User(dvs.users[0]));
        await User.create(new User(dvs.users[1]));
        await MonitoredEndpoint.create(new MonitoredEndpoint(dvs.endpoints[0]));
        await MonitoredEndpoint.create(new MonitoredEndpoint(dvs.endpoints[1]));
        await MonitoringResult.create(new MonitoringResult(dvs.results[0]));
        await MonitoringResult.create(new MonitoringResult(dvs.results[1]));
        return true
    });


    it('should GET endpoints of both users', async () => {
        let resp1 = axios.get(getEndpoints(u1.userName), makeHeaders(u1));
        let resp2 = axios.get(getEndpoints(u1.userName), makeHeaders(u1));
        resp1 = await resp1;
        resp2 = await resp2;

        assert.equal(resp1.status, 200, 'BAD RESPONSE STATUS');
        assert.equal(resp2.status, resp1.status, 'BAD RESPONSE STATUS');
        assert.property(resp1.data, 'endpoints', 'NO ENDPOINTS PROPERTY');
        assert.property(resp2.data, 'endpoints', 'NO ENDPOINTS PROPERTY');
        const ru1 = resp1.data.endpoints;
        const ru2 = resp2.data.endpoints;

        assert.typeOf(ru1, 'array', 'ENDPOINT PROPERTY NOT ARRAY');
        assert.typeOf(ru2, 'array', 'ENDPOINT PROPERTY NOT ARRAY');
        return true
    });

    it('should GET results of an endpoint', async () => {
        let resp1 = await axios.get(getResults(u1.userName, me1.id), makeHeaders(u1));

        assert.equal(resp1.status, 200, 'BAD RESPONSE STATUS');
        assert.property(resp1.data, 'results', 'NO RESULTS PROPERTY');
        const ru1 = resp1.data.results;

        assert.typeOf(ru1, 'array', 'ENDPOINT PROPERTY NOT ARRAY');
        return true
    });

    it('should fail to UPDATE endpoint because of invalid URL', async () => {
        try {
            const resp = await axios.put(getEndpoints(u1.userName) + '/' + me1.id,
                {
                    url: 'some invalid url'
                },
                makeHeaders(u1)
            );
            assert.isNotOk(resp);
            return true
        } catch (err) {
            assert.include([400,401,403], err.response.status);
            return true
        }
    });

    it('should ignore endpoint id UPDATE', async () => {
        try {
            const resp = await axios.put(getEndpoints(u1.userName) + '/' + me1.id,
                {
                    id: 99999999
                },
                makeHeaders(u1)
            );
            assert.isOk(resp);
            assert.property(resp.data, 'updated', 'MISSING PROPERTY UPDATED');
            assert.typeOf(resp.data.updated, 'object', 'INVALID UPDATED PROPERTY TYPE');
            assert.equal(resp.data.updated.id, me1.id, 'MANAGED TO CHANGE PROPERTY WITH UPDATE');
            return true
        } catch (err) {
            console.log(err);
            assert.fail('SHOULD PASS WITHOUT EXCEPTION');
            return true
        }
    });

    it('should fail to UPDATE endpoint because the user is not its owner', async () => {
        try {
            const resp = await axios.put(getEndpoints(u2.userName) + '/' + me1.id,
                {
                    url: 'some invalid url'
                },
                makeHeaders(u1)
            );
            assert.isNotOk(resp);
            return true
        } catch (err) {
            assert.include([401, 403, 404], err.response.status, 'STATUS NOT ONE OF LISTED');
            return true
        }
    });

    it('should fail to DELETE endpoint because the user is not its owner', async () => {
        try {
            const resp = await axios.delete(getEndpoints(u2.userName) + '/' + me1.id,
                makeHeaders(u1)
            );
            assert.isNotOk(resp);
            return true
        } catch (err) {
            assert.include([401, 403, 404], err.response.status, 'STATUS NOT ONE OF LISTED');
            return true
        }
    });

    it('should fail to UPDATE endpoint because it does not exist', async () => {
        try {
            const resp = await axios.put(getEndpoints(u1.userName) + '/' + 1000000,
                {
                    url: 'some invalid url'
                },
                makeHeaders(u1)
            );
            assert.isNotOk(resp);
            return true
        } catch (err) {
            assert.include([401, 403, 404], err.response.status, 'STATUS NOT ONE OF LISTED');
            return true
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
            const resp = await axios.post(getEndpoints(u2.userName),
                newMe,
                makeHeaders(u2)
            );
            assert.equal(resp.status, 201, 'STATUS NOT MATCHING WITH CREATED');
            assert.property(resp.data, 'created', 'MISSING CREATED PROPERTY');
            const c = resp.data.created;
            assert.equal(c.userId, newMe.userId);
            assert.equal(c.url, newMe.url);
            assert.equal(c.name, newMe.name);
            assert.equal(c.monitoredInterval, newMe.monitoredInterval);
            return true
        } catch (err) {
            console.log(err);
            assert.fail('SHOULD PASS WITHOUT EXCEPTION');
            return true
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
            let resp = await axios.post(getEndpoints(u2.userName),
                newMe,
                makeHeaders(u2)
            );
            assert.isOk(resp, 'INVALID RESPONSE');
            const c = resp.data.created;
            assert.isOk(c, 'CREATED NOT RETURNED');

            const timeout = new Promise((resolve) => {
                setTimeout(async () => {
                    resp = await axios.get(getResults(u2.userName, c.id), makeHeaders(u2));
                    assert.equal(resp.status, 200, 'BAD RESPONSE STATUS');
                    assert.property(resp.data, 'results', 'NO RESULTS PROPERTY');
                    const ru = resp.data.results;
                    assert.typeOf(ru, 'array', 'ENDPOINT PROPERTY NOT ARRAY');
                    const ids = new Set(ru.map(ru => ru.endpointId));
                    assert.isAtLeast(ids.size, 1, 'DID NOT GET AT LEAST ONE RESULT');
                    resolve(true);
                }, 8000)
            });
            try {
                await timeout
            } catch (e) {
                console.log(e);
                assert.fail('SHOULD PASS WITHOUT EXCEPTION');
                return true
            }
        } catch (err) {
            console.log(err);
            assert.fail('SHOULD PASS WITHOUT EXCEPTION');
            return true
        }
    });


    it('should delete endpoint', async () => {
        try {
            const delurl = getEndpoints(u1.userName) + '/' + me1.id;
            let resp = await axios.delete(delurl, makeHeaders(u1));
            assert.equal(resp.status, 200, 'DELETE STATUS INVALID');
            assert.property(resp.data, 'deletedId', 'HAS INVALID DELETED ID PROPERTY');

            const delId = resp.data.deletedId;
            assert.equal(delId, me1.id);
            return true
        } catch (err) {
            assert.fail('SHOULD PASS WITHOUT EXCEPTION');
            return true;
        }
    });

});

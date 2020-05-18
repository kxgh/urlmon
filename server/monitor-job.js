require('dotenv').config();
require("@babel/register")();

import {FAKE_PAYLOAD, NO_RESP_STATUS} from "./constants";
import MonitoredEndpoint from "./model/MonitoredEndpoint";
import dbDao from "./dao/DbDao";
import axios from "axios";
import MonitoringResult from "./model/MonitoringResult";

const snapshotResponse = async endpoint => {
    if (!FAKE_PAYLOAD) {
        try {
            const fetched = await axios.get(endpoint.url, {
                headers: {
                    //accept:'text/html',
                    cacheControl: 'no-store'
                },
                transformResponse: r => r
            });
            return new MonitoringResult({
                statusCode: fetched.status,
                payload: fetched.data,
                endpointId: endpoint.id,
                checkDate: Date.now()
            });
        } catch (err) {
            let statusCode = err.statusCode || NO_RESP_STATUS;
            let payload = err.code || err.message || '';
            if (err.response) {
                statusCode = err.response.statusCode || statusCode;
                payload = err.response.data || payload;
            }
            return new MonitoringResult({
                statusCode,
                payload,
                endpointId: endpoint.id,
                checkDate: Date.now()
            });
        }
    } else {
        return new MonitoringResult({
            statusCode: Math.floor(Math.random() * 100),
            payload: `==THIS IS FAKE PAYLOAD FOR URL ${endpoint.url} ${Date.now()}==`,
            endpointId: endpoint.id,
            checkDate: Date.now()
        })
    }
};

const onCheck = async (endpoint) => {
    dbDao.updateLastCheck(endpoint.id).catch(err => {
        // foreign key constraint err
        // this happens when during the check endpoint gets deleted; nothing to do
    });
    const monitoringResult = await snapshotResponse(endpoint);
    dbDao.saveMonitoringResult(monitoringResult).catch(err => {
        // foreign key constraint err
        // this happens when during the check endpoint gets deleted; nothing to do
    });

};

process.on('message', msg => {
    onCheck(new MonitoredEndpoint(msg));
});
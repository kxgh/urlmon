import Controller from "./Controller";
import {EV_ENDPOINT_CREATED, EV_ENDPOINT_DELETED, EV_ENDPOINT_MODIFIED, FAKE_PAYLOAD} from "./constants"
import MonitoredEndpoint from "./model/MonitoredEndpoint";
import MonitoringResult from "./model/MonitoringResult";
import axios from "axios";


export default class Monitor {
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
            const m = new Map;
            return {
                hasCheck: key => !!m.get(parseInt(key)),
                getCheck: key => m.get(parseInt(key)),
                setAndClearCheck: (key, check) => {
                    key = parseInt(key);
                    const c = m.get(key);
                    if (c)
                        clearInterval(c);
                    m.set(key, check);
                },
                clearAndDeleteCheck: key => {
                    key = parseInt(key);
                    const c = m.get(key);
                    if (c)
                        clearInterval(c);
                    m.delete(key);
                }
            }
        })();
    }

    /**
     * @param {MonitoredEndpoint} endpoint
     * @return {Promise<MonitoringResult>}
     */
    async _snapshotResponse(endpoint) {
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
                let statusCode = err.statusCode || 0;
                let payload = err.code || err.message || '';
                if(err.response){
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
    }

    /**
     * @param {MonitoredEndpoint} endpoint
     */
    _setupCheck(endpoint) {
        const performCheck = async () => {
            const dao = this.middleware.getUsedDatabaseAccessObject();
                dao.updateLastCheck(endpoint.id).catch(e=>{
                    // this happens when during the check endpoint gets deleted; nothing to do
                });
                const monitoringResult = await this._snapshotResponse(endpoint);
                dao.saveMonitoringResult(monitoringResult).catch(e=>{
                    // this happens when during the check endpoint gets deleted; nothing to do
                });
        };
        if (endpoint.monitoredInterval > 0)
            return setInterval(performCheck, endpoint.monitoredInterval)
    }

    startMonitor() {
        const modifCallback = modifiedEndpoint => {
            const check = this._checkMap.getCheck(modifiedEndpoint.id);
            const newInterval = modifiedEndpoint.monitoredInterval;
            if (check) {
                if (newInterval !== check._repeat)
                    this._checkMap.setAndClearCheck(modifiedEndpoint.id, this._setupCheck(modifiedEndpoint));
            } else createdCallback(modifiedEndpoint)
        };

        const delCallback = deletedEndpointId => {
            this._checkMap.clearAndDeleteCheck(deletedEndpointId);
        };

        const createdCallback = createdEndpoint => {
            const key = createdEndpoint.id;
            if (createdEndpoint.monitoredInterval > 0)
                this._checkMap.setAndClearCheck(key, this._setupCheck(createdEndpoint));
        };

        this.middleware.on(EV_ENDPOINT_MODIFIED, modifCallback);
        this.middleware.on(EV_ENDPOINT_DELETED, delCallback);
        this.middleware.on(EV_ENDPOINT_CREATED, createdCallback);

        this.middleware.getUsedDatabaseAccessObject().getAllMonitoredEndpoints(1).then(meList => {
            for (let me of meList)
                createdCallback(me);
        }).catch(err => {
            throw err
        });

        if (!this._cleanupListeners)
            this._cleanupListeners = () => {
                this.middleware.removeListener(EV_ENDPOINT_MODIFIED, modifCallback);
                this.middleware.removeListener(EV_ENDPOINT_DELETED, delCallback);
                this.middleware.removeListener(EV_ENDPOINT_CREATED, createdCallback);
            };
    }

    terminate() {
        for (let check of this._checkMap.values())
            clearInterval(check);
        this._cleanupListeners && this._cleanupListeners();
    }
}

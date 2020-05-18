import Controller from "./Controller";
import {NO_RESP_STATUS, EV_ENDPOINT_CREATED, EV_ENDPOINT_DELETED, EV_ENDPOINT_MODIFIED, MON_SUBP_ARG} from "./constants"
import MonitoredEndpoint from "./model/MonitoredEndpoint";
import {fork} from "child_process";
import {join} from "path";


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
                    c && clearInterval(c);
                    m.set(key, check);
                },
                clearAndDeleteCheck: key => {
                    key = parseInt(key);
                    const c = m.get(key);
                    c && clearInterval(c);
                    m.delete(key);
                }
            }
        })();
    }


    /**
     * @param {MonitoredEndpoint} endpoint
     */
    _setupCheck(endpoint) {
        const performCheck = () => {
            this.job.send(endpoint);
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

        if(!this.job)
            this.job = fork(join(__dirname,'monitor-job'),[MON_SUBP_ARG]);

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
        this.job && this.job.kill();
    }
}
